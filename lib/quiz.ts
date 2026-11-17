import type { DeckQuizStats, Question } from "./types";

export { isMultipleChoice, deckIsMultipleChoice } from "./types";

const KEY_PREFIX = "homerl-quiz-stats-v1";
const EVENT_PREFIX = "homerl-quiz-stats";

const EMPTY_STATS: DeckQuizStats = {
  attempts: 0,
  bestPercent: 0,
  bestGotIt: 0,
  bestAsked: 0,
  lastPercent: 0,
  lastGotIt: 0,
  lastAsked: 0,
};

const cache = new Map<string, { raw: string | null; stats: DeckQuizStats }>();

function storageKey(deckSlug: string) {
  return `${KEY_PREFIX}:${deckSlug}`;
}

function eventName(deckSlug: string) {
  return `${EVENT_PREFIX}:${deckSlug}`;
}

export function shuffleItems<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const swap = next[i];
    next[i] = next[j] as T;
    next[j] = swap as T;
  }
  return next;
}

/** Shuffle choice order and return the new correct index. */
export function shuffleChoices(question: Question): { order: number[]; correctIndex: number } {
  const count = question.choices?.length ?? 0;
  const order = shuffleItems(Array.from({ length: count }, (_, i) => i));
  const correctIndex = order.indexOf(question.correctIndex ?? 0);
  return { order, correctIndex: correctIndex < 0 ? 0 : correctIndex };
}

export function choiceLooksLikeCode(text: string, force?: boolean): boolean {
  if (force) return true;
  if (text.includes("\n")) return true;
  return /^(def |class |import |from |@|function |const |let |return |for |if |while |model\.|#include )/.test(
    text.trim(),
  );
}

export function scorePercent(gotIt: number, asked: number): number {
  if (asked <= 0) return 0;
  return Math.round((gotIt / asked) * 100);
}

function parseStats(raw: string | null): DeckQuizStats {
  if (!raw) return EMPTY_STATS;
  try {
    const parsed = JSON.parse(raw) as Partial<DeckQuizStats>;
    return {
      attempts: Number(parsed.attempts) || 0,
      bestPercent: Number(parsed.bestPercent) || 0,
      bestGotIt: Number(parsed.bestGotIt) || 0,
      bestAsked: Number(parsed.bestAsked) || 0,
      lastPercent: Number(parsed.lastPercent) || 0,
      lastGotIt: Number(parsed.lastGotIt) || 0,
      lastAsked: Number(parsed.lastAsked) || 0,
    };
  } catch {
    return EMPTY_STATS;
  }
}

export function getServerQuizStats(_deckSlug: string): DeckQuizStats {
  return EMPTY_STATS;
}

export function loadQuizStats(deckSlug: string): DeckQuizStats {
  if (typeof window === "undefined") return EMPTY_STATS;
  let raw: string | null;
  try {
    raw = localStorage.getItem(storageKey(deckSlug));
  } catch {
    return EMPTY_STATS;
  }
  const hit = cache.get(deckSlug);
  if (hit && hit.raw === raw) return hit.stats;
  const stats = parseStats(raw);
  cache.set(deckSlug, { raw, stats });
  return stats;
}

function saveQuizStats(deckSlug: string, stats: DeckQuizStats) {
  const raw = JSON.stringify(stats);
  localStorage.setItem(storageKey(deckSlug), raw);
  cache.set(deckSlug, { raw, stats });
  window.dispatchEvent(new Event(eventName(deckSlug)));
}

function isBetterScore(candidate: DeckQuizStats, best: DeckQuizStats): boolean {
  if (candidate.lastPercent > best.bestPercent) return true;
  if (candidate.lastPercent < best.bestPercent) return false;
  if (candidate.lastAsked > best.bestAsked) return true;
  if (candidate.lastAsked < best.bestAsked) return false;
  return candidate.lastGotIt > best.bestGotIt;
}

/** Save one finished attempt. Returns the updated stats. Does nothing if no cards were answered. */
export function recordQuizAttempt(deckSlug: string, gotIt: number, asked: number): DeckQuizStats {
  const current = loadQuizStats(deckSlug);
  if (asked <= 0) return current;
  const percent = scorePercent(gotIt, asked);
  const next: DeckQuizStats = {
    ...current,
    attempts: current.attempts + 1,
    lastPercent: percent,
    lastGotIt: gotIt,
    lastAsked: asked,
  };
  if (current.attempts === 0 || isBetterScore(next, current)) {
    next.bestPercent = percent;
    next.bestGotIt = gotIt;
    next.bestAsked = asked;
  }
  saveQuizStats(deckSlug, next);
  return next;
}

export function clearQuizStats(deckSlug: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(storageKey(deckSlug));
  cache.set(deckSlug, { raw: null, stats: EMPTY_STATS });
  window.dispatchEvent(new Event(eventName(deckSlug)));
}

export function subscribeQuizStats(deckSlug: string, onStoreChange: () => void) {
  const localEvent = eventName(deckSlug);
  const onStorage = (e: StorageEvent) => {
    if (e.key === storageKey(deckSlug)) onStoreChange();
  };
  window.addEventListener(localEvent, onStoreChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(localEvent, onStoreChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function formatScore(gotIt: number, asked: number): string {
  if (asked <= 0) return "No score yet";
  return `${gotIt} of ${asked} (${scorePercent(gotIt, asked)}%)`;
}

