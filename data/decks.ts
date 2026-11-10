import type { DeckInfo } from "../lib/types";
import { AUSTIN_EXAM2 } from "./austin-exam2";
import { CS166_TEST2 } from "./cs166-test2";
import { STAMP_OLDER_REVIEW } from "./stamp-older-review";

export const DECKS: DeckInfo[] = [
  {
    id: "main",
    title: "Stamp Test 2 review (current)",
    blurb:
      "Primary deck. People are saying the exam tracks this review closely. Drill this first.",
    primary: true,
    questions: CS166_TEST2,
  },
  {
    id: "austin",
    title: "Austin practice Exam 2",
    blurb:
      "Extra practice from Austin's fall17 Exam 2. Different angles: Kerberos, IDS, WEP, iris codes, and more.",
    primary: false,
    questions: AUSTIN_EXAM2,
  },
  {
    id: "stamp-old",
    title: "Stamp older review.pdf",
    blurb:
      "Extra practice from Stamp's older public Test 2 review. Overlapping topics with new numbers and protocol variants.",
    primary: false,
    questions: STAMP_OLDER_REVIEW,
  },
];

export function getDeck(id: string): DeckInfo | undefined {
  return DECKS.find((deck) => deck.id === id);
}
