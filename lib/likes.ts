import { getDeck } from "./decks";
import { scheduleProgressPush } from "./progress-sync";

const KEY_PREFIX = "homerl-liked-v2";
const LEGACY_KEY = "homerl-liked-v1";
const EVENT_PREFIX = "homerl-liked";

const EMPTY: Record<string, true> = {};

const cache = new Map<string, { raw: string | null; liked: Record<string, true> }>();

function storageKey(deckSlug: string) {
  return `${KEY_PREFIX}:${deckSlug}`;
}

function eventName(deckSlug: string) {
  return `${EVENT_PREFIX}:${deckSlug}`;
}

function migrateLegacy(deckSlug: string) {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(storageKey(deckSlug))) return;

  const parent = deckSlug.includes("/") ? deckSlug.split("/")[0] : deckSlug;
  if (parent === "cs166" && !localStorage.getItem(storageKey("cs166"))) {
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) localStorage.setItem(storageKey("cs166"), legacy);
  }

  if (!deckSlug.includes("/")) return;
  const parentRaw = localStorage.getItem(storageKey(parent));
  if (!parentRaw) return;

  try {
    const all = JSON.parse(parentRaw) as Record<string, true>;
    const deck = getDeck(deckSlug);
    if (!deck) return;
    const allowed = new Set(deck.questions.map((q) => q.id));
    const sliced: Record<string, true> = {};
    for (const [id, value] of Object.entries(all)) {
      if (allowed.has(id) && value) sliced[id] = true;
    }
    if (Object.keys(sliced).length > 0) {
      localStorage.setItem(storageKey(deckSlug), JSON.stringify(sliced));
    }
  } catch {
    // leave likes empty if the parent dump cannot be split
  }
}

export function loadLiked(deckSlug: string): Record<string, true> {
  if (typeof window === "undefined") return EMPTY;

  migrateLegacy(deckSlug);

  let raw: string | null;
  try {
    raw = localStorage.getItem(storageKey(deckSlug));
  } catch {
    return EMPTY;
  }

  const hit = cache.get(deckSlug);
  if (hit && hit.raw === raw) return hit.liked;

  let liked = EMPTY;
  if (raw) {
    try {
      liked = JSON.parse(raw) as Record<string, true>;
    } catch {
      liked = EMPTY;
    }
  }
  cache.set(deckSlug, { raw, liked });
  return liked;
}

export function isLiked(deckSlug: string, questionId: string) {
  return loadLiked(deckSlug)[questionId] === true;
}

export function saveLiked(deckSlug: string, liked: Record<string, true>, opts?: { skipSync?: boolean }) {
  const raw = JSON.stringify(liked);
  localStorage.setItem(storageKey(deckSlug), raw);
  cache.set(deckSlug, { raw, liked });
  window.dispatchEvent(new Event(eventName(deckSlug)));
  if (!opts?.skipSync) scheduleProgressPush(deckSlug);
}

export function toggleLiked(deckSlug: string, questionId: string) {
  const next = { ...loadLiked(deckSlug) };
  if (next[questionId]) delete next[questionId];
  else next[questionId] = true;
  saveLiked(deckSlug, next);
}

export function subscribeLiked(deckSlug: string, onStoreChange: () => void) {
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

export function getServerLiked(_deckSlug: string): Record<string, true> {
  return EMPTY;
}
