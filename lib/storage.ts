import type { DeckMemory } from "./types";

const KEY = "homerl-memory-v1";
const EVENT = "homerl-memory";

const EMPTY_MEMORY: DeckMemory = {};

let cachedRaw: string | null = null;
let cachedMemory: DeckMemory = EMPTY_MEMORY;

export function getServerMemory(): DeckMemory {
  return EMPTY_MEMORY;
}

export function loadMemory(): DeckMemory {
  if (typeof window === "undefined") return EMPTY_MEMORY;

  let raw: string | null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return EMPTY_MEMORY;
  }

  if (raw === cachedRaw) return cachedMemory;

  cachedRaw = raw;
  if (!raw) {
    cachedMemory = EMPTY_MEMORY;
    return cachedMemory;
  }

  try {
    cachedMemory = JSON.parse(raw) as DeckMemory;
  } catch {
    cachedMemory = EMPTY_MEMORY;
  }
  return cachedMemory;
}

export function saveMemory(memory: DeckMemory) {
  localStorage.setItem(KEY, JSON.stringify(memory));
  window.dispatchEvent(new Event(EVENT));
}

export function clearMemory() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeMemory(onStoreChange: () => void) {
  window.addEventListener(EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}
