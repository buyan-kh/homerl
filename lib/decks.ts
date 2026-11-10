import { CS166_TEST2 } from "@/data/cs166-test2";
import type { Question } from "./types";

export type DeckDefinition = {
  slug: string;
  title: string;
  description: string;
  questions: Question[];
};

export const DECKS: Record<string, DeckDefinition> = {
  cs166: {
    slug: "cs166",
    title: "CS 166 Test 2",
    description: "Security protocols, hashes, and Test 2 patterns until they stick.",
    questions: CS166_TEST2,
  },
};

export function getDeck(slug: string): DeckDefinition | undefined {
  return DECKS[slug];
}

export function listDecks(): DeckDefinition[] {
  return Object.values(DECKS);
}
