import { NextResponse } from "next/server";
import { getDeck } from "@/lib/decks";
import { readProgress, writeProgress } from "@/lib/progress-db";
import type { DeckMemory } from "@/lib/types";

function clientIdFrom(request: Request): string | null {
  const id = request.headers.get("X-Homerl-Client-Id")?.trim();
  if (!id || id.length > 128) return null;
  return id;
}

function deckFrom(request: Request): string | null {
  const deck = new URL(request.url).searchParams.get("deck")?.trim();
  if (!deck || !getDeck(deck)) return null;
  return deck;
}

export async function GET(request: Request) {
  const deck = deckFrom(request);
  if (!deck) {
    return NextResponse.json({ error: "Unknown deck" }, { status: 404 });
  }
  const clientId = clientIdFrom(request);
  if (!clientId) {
    return NextResponse.json({ error: "Missing client id" }, { status: 400 });
  }
  try {
    const snapshot = await readProgress(clientId, deck);
    if (!snapshot) {
      return NextResponse.json({ error: "No progress" }, { status: 404 });
    }
    return NextResponse.json(snapshot);
  } catch {
    return NextResponse.json({ error: "Progress store unavailable" }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  const deck = deckFrom(request);
  if (!deck) {
    return NextResponse.json({ error: "Unknown deck" }, { status: 404 });
  }
  const clientId = clientIdFrom(request);
  if (!clientId) {
    return NextResponse.json({ error: "Missing client id" }, { status: 400 });
  }
  let body: { memory?: DeckMemory; liked?: Record<string, true> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.memory || typeof body.memory !== "object") {
    return NextResponse.json({ error: "memory required" }, { status: 400 });
  }
  const liked = body.liked && typeof body.liked === "object" ? body.liked : {};
  try {
    const snapshot = await writeProgress(clientId, deck, {
      memory: body.memory,
      liked,
    });
    return NextResponse.json(snapshot);
  } catch {
    return NextResponse.json({ error: "Progress store unavailable" }, { status: 503 });
  }
}
