const KEY_PREFIX = "homerl-chapter-run";

type ChapterRun = {
  order: string[];
  seen: string[];
  finished: boolean;
};

type DeckRuns = Record<string, ChapterRun>;

function storageKey(deckSlug: string) {
  return `${KEY_PREFIX}:${deckSlug}`;
}

function loadDeck(deckSlug: string): DeckRuns {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(storageKey(deckSlug));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as DeckRuns;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveDeck(deckSlug: string, runs: DeckRuns) {
  localStorage.setItem(storageKey(deckSlug), JSON.stringify(runs));
}

function sameIds(order: string[], ids: string[]) {
  if (order.length !== ids.length) return false;
  const have = new Set(order);
  return ids.every((id) => have.has(id));
}

function shuffle(ids: string[]) {
  const next = [...ids];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const swap = next[i];
    next[i] = next[j];
    next[j] = swap;
  }
  return next;
}

function differentOrder(ids: string[], previous: string[]) {
  if (ids.length < 2) return [...ids];
  let order = shuffle(ids);
  for (let attempt = 0; attempt < 8 && order.join("\0") === previous.join("\0"); attempt++) {
    order = shuffle(ids);
  }
  if (order.join("\0") === previous.join("\0")) {
    return [order[order.length - 1], ...order.slice(0, -1)];
  }
  return order;
}

/**
 * Resume an unfinished pass in the same order. A finished drill pass starts in a new order.
 * Books always keep the source order.
 */
export function beginChapterRun(
  deckSlug: string,
  chapterKey: string,
  ids: string[],
  options?: { keepOrder?: boolean; pickStart?: (order: string[]) => string | undefined },
) {
  const runs = loadDeck(deckSlug);
  const saved = runs[chapterKey];
  const reusable = saved && sameIds(saved.order, ids) && !saved.finished;

  if (reusable && saved) {
    const order = options?.keepOrder ? [...ids] : saved.order;
    const startId = order.find((id) => !saved.seen.includes(id)) ?? order[0];
    if (options?.keepOrder) {
      runs[chapterKey] = { ...saved, order };
      saveDeck(deckSlug, runs);
    }
    return { order, startId };
  }

  const order =
    options?.keepOrder || !(saved && sameIds(saved.order, ids))
      ? [...ids]
      : differentOrder(ids, saved.order);
  runs[chapterKey] = { order, seen: [], finished: false };
  saveDeck(deckSlug, runs);
  const picked = options?.pickStart?.(order);
  return { order, startId: picked && order.includes(picked) ? picked : order[0] };
}

/** Remember that this card was left during the current pass. Completing the list finishes the pass. */
export function noteChapterVisit(deckSlug: string, chapterKey: string, questionId: string) {
  const runs = loadDeck(deckSlug);
  const saved = runs[chapterKey];
  if (!saved || saved.finished || !saved.order.includes(questionId)) return;
  if (!saved.seen.includes(questionId)) saved.seen.push(questionId);
  if (saved.order.every((id) => saved.seen.includes(id))) saved.finished = true;
  saveDeck(deckSlug, runs);
}

export function clearChapterRuns(deckSlug: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(storageKey(deckSlug));
}
