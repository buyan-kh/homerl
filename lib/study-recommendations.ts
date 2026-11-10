import { deckStats, isLearned, pickNext } from "./scheduler";
import type { Recommendation } from "@/components/ui/smart-recommendation-clean";
import type { DeckDefinition } from "./decks";
import type { DeckMemory, Question } from "./types";

const QUESTION_PREFIX = "question:";
const RANDOM_ID = "deck:random";

export function studyPlanFromId(id: string): { kind: "question"; questionId: string } | { kind: "random" } {
  if (id === RANDOM_ID) return { kind: "random" };
  if (id.startsWith(QUESTION_PREFIX)) {
    return { kind: "question", questionId: id.slice(QUESTION_PREFIX.length) };
  }
  return { kind: "random" };
}

export function questionForStudyPlan(
  questions: Question[],
  memory: DeckMemory,
  planId: string,
  lastId?: string,
): Question | null {
  const plan = studyPlanFromId(planId);
  if (plan.kind === "question") {
    return questions.find((q) => q.id === plan.questionId) ?? pickNext(questions, memory, lastId);
  }
  return pickNext(questions, memory, lastId);
}

export function buildDeckStudyOptions(questions: Question[], memory: DeckMemory): Recommendation[] {
  const stats = deckStats(questions, memory);
  const ranked = questions
    .map((q) => ({ q, card: memory[q.id] }))
    .filter(({ card }) => !isLearned(card))
  .sort((a, b) => {
    const easeA = a.card?.ease ?? 1.4;
    const easeB = b.card?.ease ?? 1.4;
    return easeB - easeA;
  });

  const options: Recommendation[] = [];

  const heavyMiss = ranked.find(
    ({ card }) => (card?.missed ?? 0) > 0 || card?.lastGrade === "missed" || (card?.ease ?? 0) > 2.2,
  );
  if (heavyMiss) {
    const misses = heavyMiss.card?.missed ?? 0;
    const ease = heavyMiss.card?.ease ?? 1.4;
    options.push({
      id: `${QUESTION_PREFIX}${heavyMiss.q.id}`,
      label: `Card ${heavyMiss.q.id}`,
      reason: `Strong review signal: ${misses} miss${misses === 1 ? "" : "es"}, weight ${ease.toFixed(1)}×. ${
        heavyMiss.q.chapter ?? "Drill this pattern again."
      }`,
      signal: misses >= 2 || ease > 3 ? 3 : 2,
    });
  }

  const fresh = questions.find((q) => !memory[q.id]?.seen);
  if (fresh) {
    const unseenCount = questions.filter((q) => !memory[q.id]?.seen).length;
    options.push({
      id: `${QUESTION_PREFIX}${fresh.id}`,
      label: `New card ${fresh.id}`,
      reason: `${unseenCount} card${unseenCount === 1 ? "" : "s"} you have not opened yet. Start with this one.`,
      signal: unseenCount > 8 ? 3 : 2,
    });
  }

  const schedulerPick = pickNext(questions, memory);
  options.push({
    id: RANDOM_ID,
    label: "Scheduler pick",
    reason: schedulerPick
      ? `Weighted draw favors **${schedulerPick.id}** right now (${stats.learned}/${stats.total} learned).`
      : `Weighted draw across the deck (${stats.learned}/${stats.total} learned).`,
    signal: stats.learned < stats.total * 0.4 ? 2 : 1,
  });

  if (options.length === 0) {
    options.push({
      id: RANDOM_ID,
      label: "Start drilling",
      reason: "Pick the next card from the deck.",
      signal: 1,
    });
  }

  return options;
}

export function buildSectionStudyOptions(sections: DeckDefinition[]): Recommendation[] {
  const scored = sections.map((section) => {
    if (typeof window === "undefined") {
      return { section, score: 0, unseen: section.questions.length, misses: 0 };
    }
    const { loadMemory } = require("./storage") as typeof import("./storage");
    const memory = loadMemory(section.slug);
    const stats = deckStats(section.questions, memory);
    const misses = section.questions.reduce((n, q) => n + (memory[q.id]?.missed ?? 0), 0);
    const unseen = section.questions.length - stats.seen;
    const score = unseen * 2 + misses * 3 + (section.slug.endsWith("review") ? 1 : 0);
    return { section, score, unseen, misses };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.map((entry, index) => ({
    id: `section:${entry.section.slug}`,
    label: entry.section.title,
    reason:
      entry.unseen > 0
        ? `${entry.unseen} unseen · ${entry.misses} miss${entry.misses === 1 ? "" : "es"} logged. ${entry.section.description}`
        : `${entry.section.description} (${entry.misses} miss${entry.misses === 1 ? "" : "es"} logged).`,
    signal: (index === 0 && entry.score > 4 ? 3 : index === 0 ? 2 : 1) as 0 | 1 | 2 | 3,
  }));
}

export function sectionHrefFromRecommendation(id: string): string | null {
  if (!id.startsWith("section:")) return null;
  return `/${id.slice("section:".length)}`;
}
