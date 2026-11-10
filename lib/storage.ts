import { getDeck } from "./decks";
import { scheduleProgressPush } from "./progress-sync";
import type { DeckMemory } from "./types";

const KEY_PREFIX = "homerl-memory-v2";
const LEGACY_KEY = "homerl-memory-v1";
const EVENT_PREFIX = "homerl-memory";

const EMPTY_MEMORY: DeckMemory = {};

const cache = new Map<string, { raw: string | null; memory: DeckMemory }>();

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
    const all = JSON.parse(parentRaw) as DeckMemory;
    const deck = getDeck(deckSlug);
    if (!deck) return;
    const allowed = new Set(deck.questions.map((q) => q.id));
    const sliced: DeckMemory = {};
    for (const [id, value] of Object.entries(all)) {
      if (allowed.has(id)) sliced[id] = value;
    }
    if (Object.keys(sliced).length > 0) {
      localStorage.setItem(storageKey(deckSlug), JSON.stringify(sliced));
    }
  } catch {
    // leave the section empty if the parent dump cannot be split
  }
}

export function getServerMemory(_deckSlug: string): DeckMemory {
  return EMPTY_MEMORY;
}

export function loadMemory(deckSlug: string): DeckMemory {
  if (typeof window === "undefined") return EMPTY_MEMORY;

  migrateLegacy(deckSlug);

  let raw: string | null;
  try {
    raw = localStorage.getItem(storageKey(deckSlug));
  } catch {
    return EMPTY_MEMORY;
  }

  const hit = cache.get(deckSlug);
  if (hit && hit.raw === raw) return hit.memory;

  let memory = EMPTY_MEMORY;
  if (raw) {
    try {
      memory = JSON.parse(raw) as DeckMemory;
    } catch {
      memory = EMPTY_MEMORY;
    }
  }
  cache.set(deckSlug, { raw, memory });
  return memory;
}

export function saveMemory(deckSlug: string, memory: DeckMemory, opts?: { skipSync?: boolean }) {
  const raw = JSON.stringify(memory);
  localStorage.setItem(storageKey(deckSlug), raw);
  cache.set(deckSlug, { raw, memory });
  window.dispatchEvent(new Event(eventName(deckSlug)));
  if (!opts?.skipSync) scheduleProgressPush(deckSlug);
}

export function clearMemory(deckSlug: string) {
  localStorage.removeItem(storageKey(deckSlug));
  cache.set(deckSlug, { raw: null, memory: EMPTY_MEMORY });
  window.dispatchEvent(new Event(eventName(deckSlug)));
  scheduleProgressPush(deckSlug);
}

export function subscribeMemory(deckSlug: string, onStoreChange: () => void) {
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
