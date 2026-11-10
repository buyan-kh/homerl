import { AUSTIN_EXAM2 } from "@/data/austin-exam2";
import { CS166_TEST2 } from "@/data/cs166-test2";
import { REVIEW_VARIANT_A } from "@/data/review-variant-a";
import { REVIEW_VARIANT_B } from "@/data/review-variant-b";
import { REVIEW_VARIANT_C } from "@/data/review-variant-c";
import { STAMP_BOOK_CH69 } from "@/data/stamp-book-ch69";
import { HW_ASSIGNMENT_6 } from "@/data/hw-assignment-6";
import { HW_ASSIGNMENT_7 } from "@/data/hw-assignment-7";
import { HW_ASSIGNMENT_8 } from "@/data/hw-assignment-8";
import { HW_ASSIGNMENT_9 } from "@/data/hw-assignment-9";
import { STAMP_OLDER_REVIEW } from "@/data/stamp-older-review";
import type { Question } from "./types";

export type DeckKind = "drill" | "book";

export type DeckDefinition = {
  slug: string;
  courseSlug: string;
  section: string;
  title: string;
  description: string;
  /** Drills can reshuffle after a finished pass. Books stay in source order. */
  kind: DeckKind;
  questions: Question[];
};

export type CourseDefinition = {
  slug: string;
  title: string;
  description: string;
  sections: DeckDefinition[];
};

const CS166_SECTIONS: DeckDefinition[] = [
  {
    slug: "cs166/review",
    courseSlug: "cs166",
    section: "review",
    title: "Stamp Test 2 review",
    kind: "drill",
    description: "Current Stamp review. People are saying the exam tracks this closely. Drill this first.",
    questions: CS166_TEST2,
  },
  {
    slug: "cs166/variant-a",
    courseSlug: "cs166",
    section: "variant-a",
    title: "Exam-style variant A",
    kind: "drill",
    description: "Same shape as the official review, with different numbers and protocols from the book. Use this to check you did not just memorize the review wording.",
    questions: REVIEW_VARIANT_A,
  },
  {
    slug: "cs166/variant-b",
    courseSlug: "cs166",
    section: "variant-b",
    title: "Exam-style variant B",
    kind: "drill",
    description: "Second altered version of the review: password Cases I-IV, nonce public-key protocols, and a new Fiat-Shamir instance.",
    questions: REVIEW_VARIANT_B,
  },
  {
    slug: "cs166/variant-c",
    courseSlug: "cs166",
    section: "variant-c",
    title: "Exam-style variant C",
    kind: "drill",
    description: "Third altered version, including a different split-password scheme, the timestamp re-sign attack, and signed Diffie-Hellman.",
    questions: REVIEW_VARIANT_C,
  },
  {
    slug: "cs166/austin",
    courseSlug: "cs166",
    section: "austin",
    title: "Austin practice Exam 2",
    kind: "drill",
    description: "Extra practice from Austin's fall17 Exam 2. Different angles: Kerberos, IDS, WEP, iris codes, and more.",
    questions: AUSTIN_EXAM2,
  },
  {
    slug: "cs166/older",
    courseSlug: "cs166",
    section: "older",
    title: "Stamp older review",
    kind: "drill",
    description: "Extra practice from Stamp's older public Test 2 review. Overlapping topics with new numbers and protocol variants.",
    questions: STAMP_OLDER_REVIEW,
  },
  {
    slug: "cs166/book",
    courseSlug: "cs166",
    section: "book",
    title: "Stamp book, Chapters 6-9",
    kind: "book",
    description: "Original study cards from Stamp's 3rd edition, Chapters 6 through 9. Separate from the review decks.",
    questions: STAMP_BOOK_CH69,
  },
  {
    slug: "cs166/homework",
    courseSlug: "cs166",
    section: "homework",
    title: "Homework 6-9 (book problems)",
    kind: "book",
    description: "Worked solutions to Assignments 6 to 9: the assigned Stamp end-of-chapter problems, extra credit included. Filter by chapter.",
    questions: [...HW_ASSIGNMENT_6, ...HW_ASSIGNMENT_7, ...HW_ASSIGNMENT_8, ...HW_ASSIGNMENT_9],
  },
];

export const COURSES: Record<string, CourseDefinition> = {
  cs166: {
    slug: "cs166",
    title: "CS 166",
    description: "Information Security. Sections for Test 2 practice now; later you can add a Final review here too.",
    sections: CS166_SECTIONS,
  },
};

export const DECKS: Record<string, DeckDefinition> = Object.fromEntries(
  CS166_SECTIONS.map((section) => [section.slug, section]),
);

export function getCourse(slug: string): CourseDefinition | undefined {
  return COURSES[slug];
}

export function listCourses(): CourseDefinition[] {
  return Object.values(COURSES);
}

export function getDeck(slug: string): DeckDefinition | undefined {
  return DECKS[slug];
}

export function listDecks(): DeckDefinition[] {
  return Object.values(DECKS);
}
