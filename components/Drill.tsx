"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { getDeck } from "@/lib/decks";
import { deckStats, isLearned, pickNext, applyGrade } from "../lib/scheduler";
import { Button } from "@/components/ui/button-clean";
import { ChangeSummary, type MetricChange } from "@/components/ui/change-summary-clean";
import { DrillReactions } from "@/components/DrillReactions";
import { ProtocolText } from "@/components/ProtocolText";
import { StudyProgressBar } from "@/components/StudyProgressBar";
import { TextArea } from "@/components/ui/text-area-clean";
import { CONTENT_READ } from "@/lib/content-layout";
import { pullProgress } from "@/lib/progress-sync";
import { getServerLiked, loadLiked, saveLiked, subscribeLiked, toggleLiked } from "../lib/likes";
import { clearMemory, getServerMemory, loadMemory, saveMemory, subscribeMemory } from "../lib/storage";
import type { CardMemory, DeckMemory, Grade, Question } from "../lib/types";

const DRILL_COLUMN = CONTENT_READ;

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
      card.streak > 0 ? `${card.streak} got-it in a row` : "Reset — build it back up",
    tone: card.streak >= 3 ? "good" : card.streak > 0 ? "neutral" : "bad",
    direction: card.streak > 0 ? "up" : "down",
  });

  if (isLearned(card)) {
    metrics.push({ label: "Learned", change: "In light review", tone: "good" });
  } else {
    metrics.push({
      label: "Review weight",
      change: `${card.ease.toFixed(1)}× — ${card.ease > 2 ? "comes back often" : card.ease > 1 ? "normal rotation" : "fading out"}`,
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

export function Drill({ deckSlug }: DrillProps) {
  const deckDef = getDeck(deckSlug);
  const questions = deckDef?.questions ?? [];

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
  const [current, setCurrent] = useState<Question | null>(null);
  const [draft, setDraft] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [session, setSession] = useState({ asked: 0, gotIt: 0, missed: 0 });
  const textRef = useRef<HTMLTextAreaElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);

  const stats = useMemo(() => deckStats(questions, memory), [questions, memory]);

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

  function advanceToNext(nextMemory: DeckMemory) {
    setDraft("");
    setRevealed(false);
    setCurrent(pickNext(questions, nextMemory, current?.id));
  }

  function grade(value: Grade) {
    if (!current) return;
    const nextMemory: DeckMemory = {
      ...memory,
      [current.id]: applyGrade(memory[current.id], value),
    };
    saveMemory(deckSlug, nextMemory);
    setSession((s) => ({
      asked: s.asked + 1,
      gotIt: s.gotIt + (value === "got_it" ? 1 : 0),
      missed: s.missed + (value === "missed" ? 1 : 0),
    }));
    advanceToNext(nextMemory);
  }

  function skipCard() {
    if (!current) return;
    advanceToNext(memory);
  }

  function resetDeck() {
    if (!confirm("Clear your memory for this deck and start over?")) return;
    clearMemory(deckSlug);
    setSession({ asked: 0, gotIt: 0, missed: 0 });
    setDraft("");
    setRevealed(false);
    setCurrent(null);
  }

  const deckTitle = deckDef.title;
  const courseHref = `/${deckDef.courseSlug}`;
  const courseLabel = `${deckDef.courseSlug} sections`;

  if (!current) {
    return (
      <div className={DRILL_COLUMN}>
        <Link href={courseHref} className="font-mono text-xs text-stone-500 hover:text-stone-800">
          ← {courseLabel}
        </Link>
        <p className="font-mono text-xs tracking-wide text-stone-500 uppercase">homeRL</p>
        <h1 className="text-2xl font-semibold text-stone-900">{deckTitle}</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          {stats.learned} of {stats.total} cards are already learned in this browser.
          Write an answer, reveal the model answer, and grade yourself. Missed questions come back more often.
        </p>
        <StudyProgressBar
          label="Cards learned"
          learned={stats.learned}
          total={stats.total}
          style={{ width: "100%", maxWidth: "24rem" }}
        />
        <ChangeSummary
          title="Deck progress"
          period="Saved locally"
          changes={[
            {
              label: "Started",
              change: `${stats.seen} cards touched at least once`,
              tone: "neutral",
            },
          ]}
        />
        <Button type="button" onClick={() => setCurrent(pickNext(questions, memory))}>
          Start drilling
        </Button>
      </div>
    );
  }

  const card = memory[current.id];
  const remaining = stats.total - stats.learned;

  return (
    <div className={`${DRILL_COLUMN} gap-8`}>
      <header className="flex w-full flex-col items-start gap-3 border-b border-border pb-6">
        <Link href={courseHref} className="font-mono text-xs text-stone-500 hover:text-stone-800">
          ← {courseLabel}
        </Link>
        <p className="font-mono text-xs tracking-wide text-stone-500 uppercase">homeRL</p>
        <h1 className="mt-1 text-2xl font-semibold text-stone-900">{deckTitle}</h1>
        <div className="flex flex-col items-start gap-2 text-sm text-muted-foreground">
          <p>
            This session: {session.gotIt} solid, {session.missed} missed, {session.asked} reviewed
          </p>
          <Button type="button" variant="secondary" size="sm" onClick={resetDeck}>
            Reset memory
          </Button>
        </div>
        <StudyProgressBar
          label="Cards learned"
          learned={stats.learned}
          total={stats.total}
          style={{ width: "100%", maxWidth: "24rem" }}
        />
        <p className="mt-1 font-mono text-xs text-stone-500">{remaining} still in rotation</p>
      </header>

      <section className="flex w-full flex-col items-start gap-4">
        <p className="font-mono text-xs text-stone-500">
          {current.chapter} · {current.id}
          {card?.seen ? ` · seen ${card.seen}` : " · new"}
          {isLearned(card) ? " · learned, light review" : ""}
        </p>
        <h2 className="text-lg leading-7 font-medium text-stone-900 whitespace-pre-wrap">
          <ProtocolText text={current.prompt} />
        </h2>

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
            minRows={6}
            maxRows={12}
            expandable
            spellCheck
            disabled={revealed}
            onSubmitShortcut={() => {
              if (!revealed) setRevealed(true);
            }}
          />
          {!revealed ? <Button type="submit">Reveal answer</Button> : null}
        </form>

        {revealed ? (
          <div
            ref={revealRef}
            tabIndex={-1}
            className="flex w-full flex-col gap-3 rounded-lg border border-border bg-card p-4 text-left outline-none"
          >
            <h3 className="text-sm font-semibold text-stone-900">Model answer</h3>
            <p className="text-base leading-7 whitespace-pre-wrap text-stone-800">
              <ProtocolText text={current.answer} />
            </p>
            {current.pattern ? (
              <p className="border-t border-stone-200 pt-3 text-sm leading-6 text-stone-600">
                Pattern to remember: <ProtocolText text={current.pattern} />
              </p>
            ) : null}
            <DrillReactions
              key={`${current.id}-${revealed}`}
              canGrade
              problemLiked={liked[current.id] === true}
              onToggleProblemLike={() => toggleLiked(deckSlug, current.id)}
              onRefresh={skipCard}
              onMissed={() => grade("missed")}
              onClose={() => grade("close")}
              onGotIt={() => grade("got_it")}
            />
          </div>
        ) : null}

        <ChangeSummary
          key={`${current.id}-summary`}
          title="This card"
          period={current.chapter ?? current.id}
          changes={cardMetrics(card)}
        />
      </section>
    </div>
  );
}
