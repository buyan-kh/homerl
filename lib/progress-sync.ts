import { getClientId } from "./client-id";
import { loadLiked } from "./likes";
import { loadMemory } from "./storage";
import type { DeckMemory } from "./types";

const syncTimers = new Map<string, ReturnType<typeof setTimeout>>();

export type RemoteProgress = {
  memory: DeckMemory;
  liked: Record<string, true>;
  updatedAt: string;
};

export async function pullProgress(deckSlug: string): Promise<RemoteProgress | null> {
  const clientId = getClientId();
  if (!clientId) return null;
  try {
    const res = await fetch(`/api/progress?deck=${encodeURIComponent(deckSlug)}`, {
      headers: { "X-Homerl-Client-Id": clientId },
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return (await res.json()) as RemoteProgress;
  } catch {
    return null;
  }
}

export function scheduleProgressPush(deckSlug: string) {
  const existing = syncTimers.get(deckSlug);
  if (existing) clearTimeout(existing);
  syncTimers.set(
    deckSlug,
    setTimeout(() => {
      syncTimers.delete(deckSlug);
      void pushProgress(deckSlug);
    }, 400),
  );
}

export async function pushProgress(deckSlug: string): Promise<void> {
  const clientId = getClientId();
  if (!clientId) return;
  const memory = loadMemory(deckSlug);
  const liked = loadLiked(deckSlug);
  try {
    await fetch(`/api/progress?deck=${encodeURIComponent(deckSlug)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Homerl-Client-Id": clientId,
      },
      body: JSON.stringify({ memory, liked }),
    });
  } catch {
    // localStorage remains source of truth when the server is unavailable
  }
}
