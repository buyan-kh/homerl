"use client";

const KEY = "homerl-leetcode-v1";
const EVENT = "homerl-leetcode";

export type LcProgress = {
  /** Whole problems solved, by item id. */
  solved: Record<string, true>;
  /** Breakdown steps solved, by item id, as step indexes. */
  steps: Record<string, number[]>;
};

const EMPTY: LcProgress = { solved: {}, steps: {} };
let cache: { raw: string | null; value: LcProgress } | null = null;

export function getServerLcProgress(): LcProgress {
  return EMPTY;
}

export function loadLcProgress(): LcProgress {
  if (typeof window === "undefined") return EMPTY;
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return EMPTY;
  }
  if (cache && cache.raw === raw) return cache.value;
  let value = EMPTY;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<LcProgress>;
      value = { solved: parsed.solved ?? {}, steps: parsed.steps ?? {} };
    } catch {
      value = EMPTY;
    }
  }
  cache = { raw, value };
  return value;
}

function save(next: LcProgress) {
  const raw = JSON.stringify(next);
  localStorage.setItem(KEY, raw);
  cache = { raw, value: next };
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeLcProgress(cb: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cb();
  };
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function markItemSolved(itemId: string) {
  const cur = loadLcProgress();
  if (cur.solved[itemId]) return;
  save({ ...cur, solved: { ...cur.solved, [itemId]: true } });
}

export function markStepSolved(itemId: string, stepIndex: number) {
  const cur = loadLcProgress();
  const have = cur.steps[itemId] ?? [];
  if (have.includes(stepIndex)) return;
  save({ ...cur, steps: { ...cur.steps, [itemId]: [...have, stepIndex].sort((a, b) => a - b) } });
}

export function resetLevelProgress(itemIds: string[]) {
  const cur = loadLcProgress();
  const solved = { ...cur.solved };
  const steps = { ...cur.steps };
  for (const id of itemIds) {
    delete solved[id];
    delete steps[id];
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${CODE_PREFIX}${id}#`)) localStorage.removeItem(key);
      }
    } catch {
      // ignore
    }
  }
  save({ solved, steps });
}

export function clearAllLcProgress() {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && (key === KEY || key.startsWith(CODE_PREFIX))) localStorage.removeItem(key);
    }
  } catch {
    // ignore
  }
  cache = null;
  window.dispatchEvent(new Event(EVENT));
}

const CODE_PREFIX = "homerl-leetcode-code:";

export function loadDraft(key: string): string | null {
  try {
    return localStorage.getItem(`${CODE_PREFIX}${key}`);
  } catch {
    return null;
  }
}

export function saveDraft(key: string, code: string) {
  try {
    localStorage.setItem(`${CODE_PREFIX}${key}`, code);
  } catch {
    // storage full or blocked: drafts are a convenience only
  }
}

export function clearDraft(key: string) {
  try {
    localStorage.removeItem(`${CODE_PREFIX}${key}`);
  } catch {
    // ignore
  }
}
