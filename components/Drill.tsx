"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import { getDeck } from "@/lib/decks";
import { deckStats, isGraduated, isLearned, applyGrade } from "../lib/scheduler";
import { Button } from "@/components/ui/button-clean";
import { ChangeSummary, type MetricChange } from "@/components/ui/change-summary-clean";
import { CardDiagram, hasCardDiagram } from "@/components/CardDiagram";
import { DrillReactions } from "@/components/DrillReactions";
import { ProtocolText } from "@/components/ProtocolText";
import { DrillSessionCard } from "@/components/DrillSessionCard";
import { StudyProgressBar } from "@/components/StudyProgressBar";
import { TextArea } from "@/components/ui/text-area-clean";
import { CONTENT_READ } from "@/lib/content-layout";
import { pullProgress } from "@/lib/progress-sync";
import {
  choiceLooksLikeCode,
  clearQuizStats,
  deckIsMultipleChoice,
  formatScore,
  getServerQuizStats,
  isMultipleChoice,
  loadQuizStats,
  recordQuizAttempt,
  shuffleChoices,
  shuffleItems,
  subscribeQuizStats,
} from "@/lib/quiz";
import { loadNotes, saveNote } from "../lib/notes";
import { beginChapterRun, clearChapterRuns, noteChapterVisit } from "../lib/chapter-run";
import { clearMemory, getServerMemory, loadMemory, saveMemory, subscribeMemory } from "../lib/storage";
import type { CardMemory, DeckMemory, Grade, Question } from "../lib/types";
import { getServerLiked, loadLiked, saveLiked, subscribeLiked, toggleLiked } from "../lib/likes";

const DRILL_COLUMN = CONTENT_READ;
const ALL_CHAPTERS = "all";

const REVEAL_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

const revealCss = `
@keyframes homerl-reveal-in {
  from { opacity: 0; transform: translateY(4px); filter: blur(2px); }
}
.homerl-reveal__item {
  animation: homerl-reveal-in 520ms ${REVEAL_EASE} both;
}
@media (prefers-reduced-motion: reduce) {
  .homerl-reveal__item { animation: none; }
}
`;

function filterKey(deckSlug: string) {
  return `homerl-chapter-filter:${deckSlug}`;
}

function uniqueChapters(questions: Question[]): string[] {
  const seen = new Set<string>();
  const list: string[] = [];
  for (const question of questions) {
    const chapter = question.chapter?.trim();
    if (!chapter || seen.has(chapter)) continue;
    seen.add(chapter);
    list.push(chapter);
  }
  return list;
}

function filterQuestions(questions: Question[], chapterFilter: string): Question[] {
  if (chapterFilter === ALL_CHAPTERS) return questions;
  return questions.filter((question) => question.chapter === chapterFilter);
}

function cardMetrics(card: CardMemory | undefined): MetricChange[] {
  if (!card || card.seen === 0) {
    return [
      { label: "Status", change: "First time on this card", tone: "neutral" },
      { label: "Deck priority", change: "Weighted higher until you grade it", tone: "neutral" },
    ];
  }

  const metrics: MetricChange[] = [
    {
      label: "Times seen",
      change: `${card.seen} review${card.seen === 1 ? "" : "s"}`,
      tone: "neutral",
    },
  ];

  if (card.missed > 0) {
    metrics.push({
      label: "Misses",
      change: `${card.missed} logged`,
      tone: "bad",
      direction: "down",
    });
  }

  metrics.push({
    label: "Streak",
    change:
      card.streak > 0 ? `${card.streak} got-it in a row` : "Reset. Build it back up",
    tone: card.streak >= 3 ? "good" : card.streak > 0 ? "neutral" : "bad",
    direction: card.streak > 0 ? "up" : "down",
  });

  if (isGraduated(card)) {
    metrics.push({ label: "Learned", change: "In light review", tone: "good" });
  } else {
    metrics.push({
      label: "Review weight",
      change: `${card.ease.toFixed(1)}x, ${card.ease > 2 ? "comes back often" : card.ease > 1 ? "normal rotation" : "fading out"}`,
      tone: card.ease > 2 ? "bad" : card.ease <= 0.35 ? "good" : "neutral",
      direction: card.ease > 1 ? "up" : "down",
    });
  }

  if (card.lastGrade) {
    const labels: Record<Grade, string> = {
      missed: "Missed it",
      close: "Close",
      got_it: "Got it",
    };
    metrics.push({
      label: "Last grade",
      change: labels[card.lastGrade],
      tone: card.lastGrade === "got_it" ? "good" : card.lastGrade === "missed" ? "bad" : "neutral",
    });
  }

  return metrics;
}

type DrillProps = {
  deckSlug: string;
};

type Phase = "start" | "drill" | "recap";

function ChapterFilter({
  chapters,
  value,
  onChange,
}: {
  chapters: string[];
  value: string;
  onChange: (next: string) => void;
}) {
  if (chapters.length < 2) return null;
  const options = [ALL_CHAPTERS, ...chapters];
  return (
    <div className="flex w-full flex-col items-start gap-2">
      <p className="font-mono text-xs tracking-wide text-stone-500 uppercase">Chapter</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Button
            key={option}
            type="button"
            size="sm"
            variant={value === option ? "primary" : "secondary"}
            onClick={() => onChange(option)}
          >
            {option === ALL_CHAPTERS ? "All" : option}
          </Button>
        ))}
      </div>
    </div>
  );
}

export function Drill({ deckSlug }: DrillProps) {
  const deckDef = getDeck(deckSlug);
  const plainText = deckDef?.notation === "plain";
  const questions = deckDef?.questions ?? [];
  const isMcDeck = deckIsMultipleChoice(questions);
  const chapters = useMemo(() => uniqueChapters(questions), [questions]);

  const memory = useSyncExternalStore(
    (cb) => subscribeMemory(deckSlug, cb),
    () => loadMemory(deckSlug),
    () => getServerMemory(deckSlug),
  );
  const liked = useSyncExternalStore(
    (cb) => subscribeLiked(deckSlug, cb),
    () => loadLiked(deckSlug),
    () => getServerLiked(deckSlug),
  );
  const quizStats = useSyncExternalStore(
    (cb) => subscribeQuizStats(deckSlug, cb),
    () => loadQuizStats(deckSlug),
    () => getServerQuizStats(deckSlug),
  );
  const [current, setCurrent] = useState<Question | null>(null);
  const [draft, setDraft] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [session, setSession] = useState({ asked: 0, gotIt: 0, missed: 0 });
  const [sessionMissed, setSessionMissed] = useState<Question[]>([]);
  const [phase, setPhase] = useState<Phase>("start");
  const [chapterFilter, setChapterFilter] = useState(ALL_CHAPTERS);
  const [focusIds, setFocusIds] = useState<string[] | null>(null);
  const [notesTick, setNotesTick] = useState(0);
  const [optionMap, setOptionMap] = useState<Record<string, number[]>>({});
  const [pickedMap, setPickedMap] = useState<Record<string, number>>({});
  const [answeredIds, setAnsweredIds] = useState<string[]>([]);
  const [scored, setScored] = useState(false);
  const scoredRef = useRef(false);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const choiceGroupRef = useRef<HTMLDivElement>(null);

  const pool = useMemo(() => {
    if (focusIds && focusIds.length > 0) {
      const byId = new Map(questions.map((question) => [question.id, question]));
      return focusIds.map((id) => byId.get(id)).filter((question): question is Question => !!question);
    }
    return filterQuestions(questions, chapterFilter);
  }, [questions, chapterFilter, focusIds]);
  const stats = useMemo(() => deckStats(pool, memory), [pool, memory]);
  const cardNote = useMemo(() => {
    void notesTick;
    return current ? (loadNotes(deckSlug)[current.id] ?? "") : "";
  }, [deckSlug, current?.id, notesTick, current]);

  useEffect(() => {
    const saved = sessionStorage.getItem(filterKey(deckSlug));
    if (saved && (saved === ALL_CHAPTERS || chapters.includes(saved))) {
      setChapterFilter(saved);
    } else {
      setChapterFilter(ALL_CHAPTERS);
    }
  }, [deckSlug, chapters]);

  useEffect(() => {
    if (chapters.length < 2) return;
    sessionStorage.setItem(filterKey(deckSlug), chapterFilter);
  }, [deckSlug, chapterFilter, chapters.length]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const remote = await pullProgress(deckSlug);
      if (cancelled || !remote) return;
      const local = loadMemory(deckSlug);
      const localLiked = loadLiked(deckSlug);
      const localEmpty = Object.keys(local).length === 0;
      const remoteHas = Object.keys(remote.memory).length > 0;

      if (localEmpty && remoteHas) {
        saveMemory(deckSlug, remote.memory, { skipSync: true });
      }
      if (Object.keys(localLiked).length === 0 && Object.keys(remote.liked).length > 0) {
        saveLiked(deckSlug, remote.liked, { skipSync: true });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [deckSlug]);

  useEffect(() => {
    if (!current) return;
    if (revealed) {
      revealRef.current?.focus();
    } else if (isMultipleChoice(current)) {
      choiceGroupRef.current?.focus();
    } else {
      textRef.current?.focus();
    }
  }, [current?.id, revealed, current]);

  useEffect(() => {
    if (!current) {
      sessionStorage.removeItem("homerl-chat-context");
      return;
    }
    const lines = [
      `Deck: ${deckSlug}`,
      `Question id: ${current.id}`,
      current.chapter ? `Chapter: ${current.chapter}` : null,
      `Prompt: ${current.prompt}`,
      revealed ? `Model answer: ${current.answer}` : "Answer not revealed yet.",
      current.pattern ? `Pattern: ${current.pattern}` : null,
    ].filter(Boolean);
    sessionStorage.setItem("homerl-chat-context", lines.join("\n"));
  }, [current, revealed, deckSlug]);


  function bookRunOptions() {
    const isBook = deckDef?.kind === "book";
    return {
      keepOrder: isBook,
      // After a finished pass, a book continues at its first card that is not learned yet.
      pickStart: isBook
        ? (order: string[]) => order.find((id) => !isLearned(memory[id]))
        : undefined,
    };
  }

  function resetCardView(next: Question | null = null, picks: Record<string, number> = pickedMap) {
    setDraft("");
    const alreadyAnswered = next != null && picks[next.id] != null;
    setRevealed(alreadyAnswered);
  }

  function clearQuizView() {
    setOptionMap({});
    setPickedMap({});
    setAnsweredIds([]);
    scoredRef.current = false;
    setScored(false);
  }

  function nextUnanswered(fromPool: Question[], afterId?: string, already: string[] = answeredIds): Question | null {
    if (fromPool.length === 0) return null;
    const start = afterId ? fromPool.findIndex((question) => question.id === afterId) : -1;
    for (let step = 1; step <= fromPool.length; step++) {
      const index = (Math.max(start, -1) + step) % fromPool.length;
      const question = fromPool[index];
      if (question && !already.includes(question.id)) return question;
    }
    return null;
  }

  function finishQuiz(finalScore?: { asked: number; gotIt: number; missed: number }) {
    const asked = finalScore?.asked ?? session.asked;
    const gotIt = finalScore?.gotIt ?? session.gotIt;
    if (isMcDeck && !scoredRef.current && asked > 0) {
      scoredRef.current = true;
      recordQuizAttempt(deckSlug, gotIt, asked);
      setScored(true);
    }
    setPhase("recap");
    setCurrent(null);
    resetCardView();
  }

  function advanceToNext(fromPool: Question[] = pool, lastId?: string) {
    const from = lastId ?? current?.id;
    if (from && !isMcDeck) noteChapterVisit(deckSlug, chapterFilter, from);
    if (isMcDeck) {
      const already = from && answeredIds.includes(from) ? answeredIds : answeredIds;
      const upcoming = nextUnanswered(fromPool, from, already);
      if (!upcoming) {
        finishQuiz();
        return;
      }
      resetCardView(upcoming);
      setCurrent(upcoming);
      return;
    }
    if (!from || fromPool.length === 0) {
      resetCardView(fromPool[0] ?? null);
      setCurrent(fromPool[0] ?? null);
      return;
    }
    const index = fromPool.findIndex((question) => question.id === from);
    const nextIndex = index < 0 ? 0 : (index + 1) % fromPool.length;
    const upcoming = fromPool[nextIndex] ?? fromPool[0] ?? null;
    resetCardView(upcoming);
    setCurrent(upcoming);
  }

  function changeChapterFilter(next: string) {
    if (phase === "drill" && current && !isMcDeck) noteChapterVisit(deckSlug, chapterFilter, current.id);
    setChapterFilter(next);
    const nextPool = filterQuestions(questions, next);
    if (phase !== "drill") {
      setFocusIds(null);
      return;
    }
    if (isMcDeck) {
      startDrilling(nextPool, { keepSession: false, filter: next });
      return;
    }
    setFocusIds(null);
    if (!current) return;
    if (nextPool.some((question) => question.id === current.id)) return;
    const { order, startId } = beginChapterRun(
      deckSlug,
      next,
      nextPool.map((question) => question.id),
      bookRunOptions(),
    );
    const byId = new Map(nextPool.map((question) => [question.id, question]));
    const ordered = order
      .map((id) => byId.get(id))
      .filter((question): question is Question => !!question);
    setFocusIds(order);
    const upcoming = byId.get(startId) ?? ordered[0] ?? null;
    resetCardView(upcoming);
    setCurrent(upcoming);
  }

  function applySessionGrade(value: Grade, question: Question, advance: boolean) {
    if (answeredIds.includes(question.id)) {
      if (advance) advanceToNext();
      return;
    }
    const nextMemory: DeckMemory = {
      ...memory,
      [question.id]: applyGrade(memory[question.id], value),
    };
    saveMemory(deckSlug, nextMemory);
    const nextAnswered = [...answeredIds, question.id];
    setAnsweredIds(nextAnswered);
    if (value === "missed") {
      setSessionMissed((prev) =>
        prev.some((item) => item.id === question.id) ? prev : [...prev, question],
      );
    }
    setSession((s) => ({
      asked: s.asked + 1,
      gotIt: s.gotIt + (value === "got_it" ? 1 : 0),
      missed: s.missed + (value === "missed" ? 1 : 0),
    }));
    if (advance) {
      if (isMcDeck && !nextUnanswered(pool, question.id, nextAnswered)) {
        finishQuiz({
          asked: session.asked + 1,
          gotIt: session.gotIt + (value === "got_it" ? 1 : 0),
          missed: session.missed + (value === "missed" ? 1 : 0),
        });
        return;
      }
      advanceToNext();
    } else if (isMcDeck && !nextUnanswered(pool, question.id, nextAnswered)) {
      // Stay on the last card so the explanation can be read, then Next finishes.
    }
  }

  function grade(value: Grade) {
    if (!current) return;
    applySessionGrade(value, current, true);
  }

  function pickChoice(displayIndex: number) {
    if (!current || !isMultipleChoice(current) || revealed) return;
    const order = optionMap[current.id] ?? current.choices!.map((_, i) => i);
    const originalIndex = order[displayIndex];
    if (originalIndex == null) return;
    setPickedMap((map) => ({ ...map, [current.id]: displayIndex }));
    setRevealed(true);
    const correct = originalIndex === current.correctIndex;
    applySessionGrade(correct ? "got_it" : "missed", current, false);
  }

  function continueAfterMc() {
    if (!current) return;
    if (!nextUnanswered(pool, current.id)) {
      finishQuiz();
      return;
    }
    advanceToNext();
  }

  useEffect(() => {
    if (phase !== "drill" || !current || !isMultipleChoice(current)) return;
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      if (!revealed) {
        const letters = ["a", "b", "c", "d", "e", "f"];
        const fromLetter = letters.indexOf(event.key.toLowerCase());
        const fromDigit = event.key >= "1" && event.key <= "9" ? Number(event.key) - 1 : -1;
        const index = fromLetter >= 0 ? fromLetter : fromDigit;
        const count = current?.choices?.length ?? 0;
        if (index >= 0 && index < count) {
          event.preventDefault();
          pickChoice(index);
        }
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        continueAfterMc();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, current, revealed, optionMap, pickedMap, pool, answeredIds, session]);

  if (!deckDef) {
    return (
      <div className={DRILL_COLUMN}>
        <p className="text-sm text-muted-foreground">Unknown deck.</p>
        <Link href="/" className="text-sm font-medium text-stone-900 underline">
          Back home
        </Link>
      </div>
    );
  }

  function skipCard() {
    if (!current) return;
    advanceToNext();
  }

  function stepQuestion(direction: -1 | 1) {
    if (!current || pool.length === 0) return;
    if (direction === 1 && !isMcDeck) noteChapterVisit(deckSlug, chapterFilter, current.id);
    const index = pool.findIndex((question) => question.id === current.id);
    if (isMcDeck) {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= pool.length) return;
      const upcoming = pool[nextIndex] ?? current;
      resetCardView(upcoming);
      setCurrent(upcoming);
      return;
    }
    const nextIndex = (index + direction + pool.length) % pool.length;
    const upcoming = pool[nextIndex] ?? current;
    resetCardView(upcoming);
    setCurrent(upcoming);
  }

  function goToStart() {
    setPhase("start");
    setCurrent(null);
    setFocusIds(null);
    clearQuizView();
    resetCardView();
    setSession({ asked: 0, gotIt: 0, missed: 0 });
    setSessionMissed([]);
  }


  function seedChoiceOrders(fromPool: Question[]) {
    const map: Record<string, number[]> = {};
    for (const question of fromPool) {
      if (isMultipleChoice(question)) {
        map[question.id] = shuffleChoices(question).order;
      }
    }
    setOptionMap(map);
  }

  function startDrilling(
    fromPool: Question[] = pool,
    opts?: { keepSession?: boolean; filter?: string },
  ) {
    const ids = fromPool.map((question) => question.id);
    let order: string[];
    let startId: string | undefined;
    if (isMcDeck) {
      order = shuffleItems(ids);
      startId = order[0];
    } else {
      const started = beginChapterRun(deckSlug, opts?.filter ?? chapterFilter, ids, bookRunOptions());
      order = started.order;
      startId = started.startId;
    }
    const byId = new Map(fromPool.map((question) => [question.id, question]));
    if (opts?.filter) setChapterFilter(opts.filter);
    clearQuizView();
    seedChoiceOrders(fromPool);
    const upcoming = byId.get(startId ?? "") ?? fromPool[0] ?? null;
    resetCardView(upcoming, {});
    setFocusIds(order);
    setSession({ asked: 0, gotIt: 0, missed: 0 });
    setSessionMissed([]);
    setPhase("drill");
    setCurrent(upcoming);
  }

  function endSession() {
    finishQuiz();
  }

  function drillMissedAgain() {
    if (sessionMissed.length === 0) {
      goToStart();
      return;
    }
    const missedPool = isMcDeck ? shuffleItems(sessionMissed) : sessionMissed;
    clearQuizView();
    seedChoiceOrders(missedPool);
    resetCardView(missedPool[0] ?? null, {});
    setFocusIds(missedPool.map((question) => question.id));
    setSession({ asked: 0, gotIt: 0, missed: 0 });
    setSessionMissed([]);
    setPhase("drill");
    setCurrent(missedPool[0] ?? null);
  }

  function resetDeck() {
    if (!confirm("Clear your memory for this deck and start over?")) return;
    clearMemory(deckSlug);
    clearChapterRuns(deckSlug);
    clearQuizStats(deckSlug);
    goToStart();
  }

  const deckTitle = deckDef.title;
  const courseHref = `/${deckDef.courseSlug}`;
  const courseLabel = `${deckDef.courseSlug} sections`;
  const remaining = stats.total - stats.learned;

  if (phase === "recap") {
    return (
      <div className={DRILL_COLUMN}>
        <Link href={courseHref} className="inline-flex min-h-11 items-center font-mono text-xs text-stone-500 hover:text-stone-800">
          ← {courseLabel}
        </Link>
        <p className="font-mono text-xs tracking-wide text-stone-500 uppercase">homeRL</p>
        <h1 className="text-2xl font-semibold text-stone-900">{isMcDeck ? "Your score" : "Session recap"}</h1>
        {isMcDeck ? (
          <div className="flex w-full flex-col gap-1">
            <p className="text-3xl font-semibold tabular-nums text-stone-900">
              {formatScore(session.gotIt, session.asked)}
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              {session.asked} answered, {session.gotIt} correct, {session.missed} missed
              {chapterFilter !== ALL_CHAPTERS ? `, in ${chapterFilter}` : ""}.
            </p>
            {quizStats.attempts > 0 ? (
              <p className="text-sm leading-6 text-stone-700">
                Best: {formatScore(quizStats.bestGotIt, quizStats.bestAsked)} · {quizStats.attempts} attempt{quizStats.attempts === 1 ? "" : "s"}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm leading-6 text-muted-foreground">
            {session.asked} reviewed, {session.gotIt} solid, {session.missed} missed
            {chapterFilter !== ALL_CHAPTERS ? `, in ${chapterFilter}` : ""}.
          </p>
        )}
        {sessionMissed.length === 0 ? (
          <p className="text-sm leading-6 text-muted-foreground">
            No missed cards this session.
          </p>
        ) : (
          <div className="flex w-full flex-col gap-3">
            <p className="text-sm leading-6 text-stone-800">
              Missed this session, {sessionMissed.length} card{sessionMissed.length === 1 ? "" : "s"}:
            </p>
            {sessionMissed.map((question) => (
              <article
                key={question.id}
                className="flex w-full flex-col gap-2 rounded-lg border border-border bg-card p-4 text-left"
              >
                <p className="font-mono text-xs text-stone-500">
                  {question.topic ? `${question.chapter} · ${question.topic}` : question.chapter}
                </p>
                <h2 className="text-sm leading-6 font-medium text-stone-900 whitespace-pre-wrap">
                  <ProtocolText plain={plainText} text={question.prompt} />
                </h2>
                {isMultipleChoice(question) && question.choices ? (
                  <ol className="flex list-none flex-col gap-2 p-0">
                    {question.choices.map((choice, index) => {
                      const correct = index === question.correctIndex;
                      const code = choiceLooksLikeCode(choice, question.choicesAreCode);
                      return (
                        <li
                          key={`${question.id}-recap-${index}`}
                          className={`rounded-lg border px-3 py-2 text-sm leading-6 whitespace-pre-wrap ${
                            correct
                              ? "border-emerald-600 bg-emerald-50 text-stone-900"
                              : "border-stone-200 text-stone-600"
                          }`}
                        >
                          <span className="mr-2 font-mono text-xs text-stone-500">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          {code ? (
                            <pre className="mt-1 overflow-x-auto font-mono text-xs leading-5">{choice}</pre>
                          ) : (
                            <ProtocolText plain={plainText} text={choice} />
                          )}
                        </li>
                      );
                    })}
                  </ol>
                ) : (
                  <p className="text-sm leading-6 whitespace-pre-wrap text-stone-800">
                    <ProtocolText plain={plainText} text={question.answer} />
                  </p>
                )}
                {question.pattern ? (
                  <p className="border-t border-stone-200 pt-2 text-sm leading-6 text-stone-600">
                    {isMultipleChoice(question) ? "Why: " : "Pattern to remember: "}<ProtocolText plain={plainText} text={question.pattern} />
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {sessionMissed.length > 0 ? (
            <Button type="button" onClick={drillMissedAgain}>
              {isMcDeck ? "Retry missed only" : "Drill missed again"}
            </Button>
          ) : null}
          <Button type="button" variant={sessionMissed.length > 0 ? "secondary" : "primary"} onClick={isMcDeck ? () => startDrilling() : goToStart}>
            {isMcDeck ? "Start a new test" : "Back to start"}
          </Button>
          {isMcDeck ? (
            <Button type="button" variant="secondary" onClick={goToStart}>
              Back to start
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  if (phase !== "drill" || !current) {
    return (
      <div className={DRILL_COLUMN}>
        <Link href={courseHref} className="inline-flex min-h-11 items-center font-mono text-xs text-stone-500 hover:text-stone-800">
          ← {courseLabel}
        </Link>
        <p className="font-mono text-xs tracking-wide text-stone-500 uppercase">homeRL</p>
        <h1 className="text-2xl font-semibold text-stone-900">{deckTitle}</h1>
        {deckDef.books && deckDef.books.length > 0 ? (
          <div className="flex flex-col gap-1">
            <p className="font-mono text-xs tracking-wide text-stone-500 uppercase">Books</p>
            <ul className="list-disc pl-5 text-sm leading-6 text-stone-700">
              {deckDef.books.map((book) => (
                <li key={book}>{book}</li>
              ))}
            </ul>
          </div>
        ) : null}
        <p className="text-sm leading-6 text-muted-foreground">
          {isMcDeck
            ? "Tap one of four answers. Questions and the option order shuffle every time you start. Missed cards show up in a recap so you can retry just those. Explanations teach the idea after you answer. Your best score is saved in this browser."
            : "Write an answer, reveal the model answer, and grade yourself. Missed questions come back more often."}
        </p>
        {isMcDeck && quizStats.attempts > 0 ? (
          <p className="text-sm leading-6 text-stone-800">
            Best score: {formatScore(quizStats.bestGotIt, quizStats.bestAsked)}
            {quizStats.lastAsked > 0 ? ` · Last: ${formatScore(quizStats.lastGotIt, quizStats.lastAsked)}` : ""}
            {` · ${quizStats.attempts} attempt${quizStats.attempts === 1 ? "" : "s"}`}
          </p>
        ) : null}
        <p className="text-sm leading-6 text-muted-foreground">
          {stats.learned} of {stats.total} cards are already learned in this browser.
        </p>
        <ChapterFilter chapters={chapters} value={chapterFilter} onChange={changeChapterFilter} />
        <StudyProgressBar
          label="Cards learned"
          learned={stats.learned}
          total={stats.total}
          style={{ width: "100%", maxWidth: "24rem" }}
        />
        <ChangeSummary
          title="Deck progress"
          changes={[
            {
              label: "Started",
              change: `${stats.seen} cards touched at least once`,
              tone: "neutral",
            },
          ]}
        />
        <Button type="button" onClick={() => startDrilling()} disabled={pool.length === 0}>
          {isMcDeck ? "Start test" : "Start drilling"}
        </Button>
      </div>
    );
  }

  const card = memory[current.id];
  const currentPosition = pool.findIndex((question) => question.id === current.id) + 1;

  return (
    <div className="mx-auto grid w-full min-w-0 max-w-[60rem] grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,42rem)_17rem] lg:justify-center lg:gap-8">
      <section className="flex min-w-0 flex-col items-start gap-4">
        <ChapterFilter chapters={chapters} value={chapterFilter} onChange={changeChapterFilter} />
        <div className="flex items-center gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => stepQuestion(-1)}>
            Previous
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => stepQuestion(1)}>
            Next
          </Button>
        </div>
        <p className="font-mono text-xs text-stone-500">
          {currentPosition > 0 ? `Question ${currentPosition} of ${pool.length}` : null}
          {current.chapter ? ` · ${current.chapter}` : ""}
          {current.topic ? ` · ${current.topic}` : ""}
          {card?.seen ? ` · seen ${card.seen}` : " · new"}
          {isGraduated(card) ? " · light review" : isLearned(card) ? " · got it" : ""}
        </p>
        <h1 className="text-lg leading-7 font-medium text-stone-900 whitespace-pre-wrap">
          <ProtocolText plain={plainText} text={current.prompt} />
        </h1>
        {current.promptImage ? (
          <img
            src={current.promptImage}
            alt={current.promptImageAlt ?? "Diagram for this question"}
            className="h-auto w-full max-w-2xl rounded-md border border-stone-200 bg-white"
          />
        ) : null}
        {hasCardDiagram(current.diagram) ? <CardDiagram diagram={current.diagram} /> : null}

        {isMultipleChoice(current) && current.choices ? (
          <McChoices
            question={current}
            order={optionMap[current.id] ?? current.choices.map((_, i) => i)}
            picked={pickedMap[current.id]}
            revealed={revealed}
            plainText={plainText}
            groupRef={choiceGroupRef}
            onPick={pickChoice}
            onSkip={skipCard}
          />
        ) : (
        <form
          className="flex w-full flex-col items-start gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (!revealed) setRevealed(true);
          }}
        >
          <TextArea
            id="answer"
            ref={textRef}
            label="Your answer"
            hint="Write from memory first. ⌘Enter or Ctrl+Enter reveals the model answer."
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            minRows={4}
            maxRows={12}
            expandable
            spellCheck
            disabled={revealed}
            onSubmitShortcut={() => {
              if (!revealed) setRevealed(true);
            }}
          />
          {!revealed ? (
            <div className="flex items-center gap-2">
              <Button type="submit">Reveal answer</Button>
              <Button type="button" variant="secondary" onClick={skipCard}>
                Skip
              </Button>
            </div>
          ) : null}
        </form>
        )}

        {revealed ? (
          <div
            ref={revealRef}
            tabIndex={-1}
            className="homerl-reveal flex w-full flex-col gap-3 rounded-lg border border-border bg-card p-4 text-left outline-none"
          >
            <style href="homerl-reveal" precedence="default">
              {revealCss}
            </style>
            <h3 className="homerl-reveal__item text-sm font-semibold text-stone-900">
              {isMultipleChoice(current)
                ? pickedIsCorrect(current, optionMap[current.id], pickedMap[current.id])
                  ? "Correct"
                  : "Not quite"
                : "Model answer"}
            </h3>
            {isMultipleChoice(current) ? null : (
            <p
              className="homerl-reveal__item text-base leading-7 whitespace-pre-wrap text-stone-800"
              style={{ animationDelay: "70ms" }}
            >
              <ProtocolText plain={plainText} text={current.answer} />
            </p>
            )}
            {hasCardDiagram(current.answerDiagram) ? (
              <div className="homerl-reveal__item" style={{ animationDelay: "70ms" }}>
                <CardDiagram diagram={current.answerDiagram} />
              </div>
            ) : null}
            {current.answerImage ? (
              <img
                src={current.answerImage}
                alt={
                  current.answerImageAlt ??
                  (plainText ? "Study diagram for this card" : "Official attack diagram from the review solutions")
                }
                className="homerl-reveal__item h-auto w-full max-w-2xl rounded-md border border-stone-200 bg-white"
                style={{ animationDelay: "140ms" }}
              />
            ) : null}
            {current.pattern ? (
              <p
                className="homerl-reveal__item border-t border-stone-200 pt-3 text-sm leading-6 text-stone-600"
                style={{ animationDelay: "140ms" }}
              >
                {isMultipleChoice(current) ? "Why: " : "Pattern to remember: "}<ProtocolText plain={plainText} text={current.pattern} />
              </p>
            ) : null}
            <div className="homerl-reveal__item" style={{ animationDelay: "210ms" }}>
            {isMultipleChoice(current) ? (
              <div className="flex w-full flex-col items-start gap-3">
                <Button type="button" onClick={continueAfterMc}>
                  {nextUnanswered(pool, current.id) ? "Next" : "See score"}
                </Button>
                <DrillReactions
                  key={`${current.id}-${revealed}`}
                  canGrade
                  showGrade={false}
                  problemLiked={liked[current.id] === true}
                  savedComment={cardNote}
                  onToggleProblemLike={() => toggleLiked(deckSlug, current.id)}
                  onMissed={() => {}}
                  onCommentSave={(note) => {
                    saveNote(deckSlug, current.id, note);
                    setNotesTick((n) => n + 1);
                  }}
                  onGotIt={() => {}}
                />
              </div>
            ) : (
            <DrillReactions
              key={`${current.id}-${revealed}`}
              canGrade
              problemLiked={liked[current.id] === true}
              savedComment={cardNote}
              onToggleProblemLike={() => toggleLiked(deckSlug, current.id)}
              onMissed={() => grade("missed")}
              onCommentSave={(note) => {
                saveNote(deckSlug, current.id, note);
                setNotesTick((n) => n + 1);
              }}
              onGotIt={() => grade("got_it")}
            />
            )}
            </div>
          </div>
        ) : null}

        <ChangeSummary
          key={`${current.id}-summary`}
          title="This card"
          changes={cardMetrics(card)}
        />
      </section>

      <aside className="w-full lg:sticky lg:top-4">
        <DrillSessionCard
          title={deckTitle}
          solid={session.gotIt}
          missed={session.missed}
          reviewed={session.asked}
          learned={stats.learned}
          total={stats.total}
          remaining={remaining}
          books={deckDef.books}
          onReset={resetDeck}
          onEndSession={endSession}
        />
      </aside>
    </div>
  );
}


function pickedIsCorrect(question: Question, order: number[] | undefined, picked: number | undefined): boolean {
  if (!isMultipleChoice(question) || picked == null) return false;
  const sequence = order ?? question.choices!.map((_, i) => i);
  return sequence[picked] === question.correctIndex;
}

function McChoices({
  question,
  order,
  picked,
  revealed,
  plainText,
  groupRef,
  onPick,
  onSkip,
}: {
  question: Question;
  order: number[];
  picked: number | undefined;
  revealed: boolean;
  plainText: boolean;
  groupRef: RefObject<HTMLDivElement | null>;
  onPick: (index: number) => void;
  onSkip: () => void;
}) {
  const choices = question.choices ?? [];
  return (
    <div className="flex w-full flex-col items-start gap-3">
      <div
        ref={groupRef}
        tabIndex={-1}
        role="radiogroup"
        aria-label="Answer choices"
        className="flex w-full flex-col gap-2 outline-none"
      >
        {order.map((originalIndex, displayIndex) => {
          const choice = choices[originalIndex] ?? "";
          const code = choiceLooksLikeCode(choice, question.choicesAreCode);
          const isPicked = picked === displayIndex;
          const isCorrect = originalIndex === question.correctIndex;
          const showState = revealed;
          let tone = "border-stone-300 bg-card text-stone-900";
          if (showState && isCorrect) tone = "border-emerald-600 bg-emerald-50 text-stone-900";
          else if (showState && isPicked && !isCorrect) tone = "border-red-600 bg-red-50 text-stone-900";
          else if (showState) tone = "border-stone-200 bg-card text-stone-500";
          return (
            <button
              key={`${question.id}-${originalIndex}`}
              type="button"
              role="radio"
              aria-checked={isPicked}
              disabled={revealed}
              onClick={() => onPick(displayIndex)}
              className={`flex w-full min-h-11 items-start gap-3 rounded-lg border px-3 py-3 text-left shadow-sm transition-colors ${tone} ${revealed ? "cursor-default" : "hover:bg-muted/40 active:bg-muted/60"}`}
            >
              <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-current/20 font-mono text-xs font-semibold">
                {String.fromCharCode(65 + displayIndex)}
              </span>
              <span className="min-w-0 flex-1">
                {code ? (
                  <pre className="overflow-x-auto font-mono text-xs leading-5 whitespace-pre-wrap sm:whitespace-pre">{choice}</pre>
                ) : (
                  <span className="text-sm leading-6 whitespace-pre-wrap">
                    <ProtocolText plain={plainText} text={choice} />
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
      {!revealed ? (
        <Button type="button" variant="secondary" onClick={onSkip}>
          Skip
        </Button>
      ) : null}
    </div>
  );
}
