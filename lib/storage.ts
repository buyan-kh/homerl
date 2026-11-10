import type { DeckMemory } from "./types";

const KEY = "homerl-memory-v1";
const EVENT = "homerl-memory";

export function loadMemory(): DeckMemory {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as DeckMemory) : {};
  } catch {
    return {};
  }
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
