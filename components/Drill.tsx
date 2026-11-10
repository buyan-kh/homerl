"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { CS166_TEST2 } from "../data/cs166-test2";
import { deckStats, isLearned, pickNext, applyGrade } from "../lib/scheduler";
import { clearMemory, loadMemory, saveMemory, subscribeMemory } from "../lib/storage";
import type { DeckMemory, Grade, Question } from "../lib/types";

export function Drill() {
  const memory = useSyncExternalStore<DeckMemory>(subscribeMemory, loadMemory, (): DeckMemory => ({}));
  const [current, setCurrent] = useState<Question | null>(null);
  const [draft, setDraft] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [session, setSession] = useState({ asked: 0, gotIt: 0, missed: 0 });
  const textRef = useRef<HTMLTextAreaElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);

  const stats = useMemo(() => deckStats(CS166_TEST2, memory), [memory]);

  useEffect(() => {
    if (!current) return;
    if (revealed) {
      revealRef.current?.focus();
    } else {
      textRef.current?.focus();
    }
  }, [current?.id, revealed, current]);

  function grade(value: Grade) {
    if (!current) return;
    const nextMemory: DeckMemory = {
      ...memory,
      [current.id]: applyGrade(memory[current.id], value),
    };
    saveMemory(nextMemory);
    setSession((s) => ({
      asked: s.asked + 1,
      gotIt: s.gotIt + (value === "got_it" ? 1 : 0),
      missed: s.missed + (value === "missed" ? 1 : 0),
    }));
    setDraft("");
    setRevealed(false);
    setCurrent(pickNext(CS166_TEST2, nextMemory, current.id));
  }

  function resetDeck() {
    if (!confirm("Clear your memory for this deck and start over?")) return;
    clearMemory();
    setSession({ asked: 0, gotIt: 0, missed: 0 });
    setDraft("");
    setRevealed(false);
    setCurrent(null);
  }

  if (!current) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <p className="font-mono text-xs tracking-wide text-stone-500 uppercase">homeRL</p>
        <h1 className="text-2xl font-semibold text-stone-900">CS 166 Test 2 drill</h1>
        <p className="max-w-2xl text-sm leading-6 text-stone-600">
          {stats.learned} of {stats.total} cards are already learned in this browser.
          Write an answer, reveal the model answer, and grade yourself. Missed questions come back more often.
        </p>
        <button
          type="button"
          onClick={() => setCurrent(pickNext(CS166_TEST2, memory))}
          className="w-fit bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2"
        >
          Start drilling
        </button>
      </div>
    );
  }

  const card = memory[current.id];
  const remaining = stats.total - stats.learned;
  const progress = stats.total === 0 ? 0 : Math.round((stats.learned / stats.total) * 100);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <header className="border-b border-stone-300 pb-4">
        <p className="font-mono text-xs tracking-wide text-stone-500 uppercase">homeRL</p>
        <h1 className="mt-1 text-2xl font-semibold text-stone-900">CS 166 Test 2 drill</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
          Write your answer first, then reveal the model answer and grade yourself.
          Missed cards come back more often until the pattern sticks.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-stone-700">
          <p>
            Learned {stats.learned} of {stats.total}
          </p>
          <p>This session: {session.gotIt} solid, {session.missed} missed, {session.asked} reviewed</p>
          <button
            type="button"
            onClick={resetDeck}
            className="ml-auto text-stone-600 underline decoration-stone-400 underline-offset-2 hover:text-stone-900"
          >
            Reset memory
          </button>
        </div>
        <progress
          className="mt-3 h-2 w-full overflow-hidden rounded-none bg-stone-200 [&::-webkit-progress-bar]:bg-stone-200 [&::-webkit-progress-value]:bg-stone-900 [&::-moz-progress-bar]:bg-stone-900"
          max={stats.total}
          value={stats.learned}
          aria-label="Cards learned"
        >
          {progress}%
        </progress>
        <p className="mt-1 font-mono text-xs text-stone-500">{remaining} still in rotation</p>
      </header>

      <section className="flex flex-col gap-4">
        <p className="font-mono text-xs text-stone-500">
          {current.chapter} · {current.id}
          {card?.seen ? ` · seen ${card.seen}` : " · new"}
          {isLearned(card) ? " · learned, light review" : ""}
        </p>
        <h2 className="text-lg leading-7 font-medium text-stone-900 whitespace-pre-wrap">
          {current.prompt}
        </h2>

        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (!revealed) setRevealed(true);
          }}
        >
          <label htmlFor="answer" className="text-sm font-medium text-stone-800">
            Your answer
          </label>
          <textarea
            id="answer"
            ref={textRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={6}
            spellCheck
            className="w-full resize-y rounded-none border border-stone-400 bg-white px-3 py-2 font-sans text-base leading-6 text-stone-900 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900"
          />
          {!revealed ? (
            <button
              type="submit"
              className="w-fit bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2"
            >
              Reveal answer
            </button>
          ) : null}
        </form>

        {revealed ? (
          <div
            ref={revealRef}
            tabIndex={-1}
            className="flex flex-col gap-3 border border-stone-300 bg-stone-50 p-4 outline-none"
          >
            <h3 className="text-sm font-semibold text-stone-900">Model answer</h3>
            <p className="text-base leading-7 whitespace-pre-wrap text-stone-800">{current.answer}</p>
            {current.pattern ? (
              <p className="border-t border-stone-200 pt-3 text-sm leading-6 text-stone-600">
                Pattern to remember: {current.pattern}
              </p>
            ) : null}
            <p className="text-sm font-medium text-stone-800">How did you do?</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => grade("missed")}
                className="border border-red-800 px-3 py-2 text-sm text-red-900 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-800"
              >
                Missed it
              </button>
              <button
                type="button"
                onClick={() => grade("close")}
                className="border border-stone-700 px-3 py-2 text-sm text-stone-800 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-800"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => grade("got_it")}
                className="bg-stone-900 px-3 py-2 text-sm font-medium text-white hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2"
              >
                Got it
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
