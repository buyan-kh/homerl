const KEY_PREFIX = "homerl-notes-v1";
const EVENT_PREFIX = "homerl-notes";

function storageKey(deckSlug: string) {
  return `${KEY_PREFIX}:${deckSlug}`;
}

function eventName(deckSlug: string) {
  return `${EVENT_PREFIX}:${deckSlug}`;
}

export function loadNotes(deckSlug: string): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(storageKey(deckSlug));
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

export function saveNote(deckSlug: string, questionId: string, note: string) {
  const next = { ...loadNotes(deckSlug), [questionId]: note };
  localStorage.setItem(storageKey(deckSlug), JSON.stringify(next));
  window.dispatchEvent(new Event(eventName(deckSlug)));
}
