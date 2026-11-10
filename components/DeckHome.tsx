"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { listDecks } from "@/lib/decks";
import { getServerMemory, loadMemory, subscribeMemory } from "@/lib/storage";
import { deckStats } from "@/lib/scheduler";
import { Button } from "@/components/ui/button-clean";

const COLUMN = "mx-auto flex w-full max-w-md flex-col items-start gap-6 text-left";

function useDeckMemory(deckSlug: string) {
  return useSyncExternalStore(
    (cb) => subscribeMemory(deckSlug, cb),
    () => loadMemory(deckSlug),
    () => getServerMemory(deckSlug),
  );
}

function DeckRow({ slug, title, description }: { slug: string; title: string; description: string }) {
  const deck = listDecks().find((d) => d.slug === slug)!;
  const memory = useDeckMemory(slug);
  const stats = deckStats(deck.questions, memory);

  return (
    <Link
      href={`/${slug}`}
      className="flex w-full flex-col items-start gap-2 rounded-lg border border-border bg-card p-4 text-left shadow-sm transition-colors hover:bg-muted/40"
    >
      <span className="font-mono text-xs text-stone-500">/{slug}</span>
      <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
      <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      <p className="font-mono text-xs text-stone-500">
        {stats.learned} learned · {stats.seen} touched · {stats.total} cards
      </p>
    </Link>
  );
}

export function DeckHome() {
  const decks = listDecks();

  return (
    <div className={COLUMN}>
      <p className="font-mono text-xs tracking-wide text-stone-500 uppercase">homeRL</p>
      <h1 className="text-2xl font-semibold text-stone-900">Choose a drill</h1>
      <p className="text-sm leading-6 text-muted-foreground">
        Progress is saved in this browser and synced to the server when you drill, so you can pick up
        tomorrow where you left off.
      </p>
      <div className="flex w-full flex-col gap-3">
        {decks.map((deck) => (
          <DeckRow key={deck.slug} slug={deck.slug} title={deck.title} description={deck.description} />
        ))}
      </div>
      {decks.length === 1 ? (
        <Button type="button" variant="primary" className="w-full" onClick={() => (window.location.href = `/${decks[0].slug}`)}>
          Open {decks[0].title}
        </Button>
      ) : null}
    </div>
  );
}
