import type { CardMemory, DeckMemory, Grade, Question } from "./types";

export function emptyMemory(): CardMemory {
  return { ease: 1, streak: 0, seen: 0, missed: 0 };
}

export function applyGrade(prev: CardMemory | undefined, grade: Grade): CardMemory {
  const card = prev ?? emptyMemory();
  const seen = card.seen + 1;
  if (grade === "missed") {
    return {
      ease: Math.min(card.ease * 2.4 + 0.8, 16),
      streak: 0,
      seen,
      missed: card.missed + 1,
      lastGrade: grade,
    };
  }
  if (grade === "close") {
    return {
      ease: Math.min(Math.max(card.ease * 1.15, 1.1), 16),
      streak: 0,
      seen,
      missed: card.missed,
      lastGrade: grade,
    };
  }
  return {
    ease: Math.max(card.ease * 0.42, 0.12),
    streak: card.streak + 1,
    seen,
    missed: card.missed,
    lastGrade: grade,
  };
}

export function isLearned(card: CardMemory | undefined) {
  return !!card && card.streak >= 3 && card.ease <= 0.35;
}

export function pickNext(
  questions: Question[],
  memory: DeckMemory,
  lastId?: string,
): Question | null {
  if (questions.length === 0) return null;
  const weights = questions.map((q) => {
    if (q.id === lastId) return 0.02;
    const card = memory[q.id];
    if (!card) return 1.4;
    if (isLearned(card)) return 0.08;
    return card.ease;
  });
  const total = weights.reduce((sum, w) => sum + w, 0);
  if (total <= 0) return questions[0];
  let r = Math.random() * total;
  for (let i = 0; i < questions.length; i++) {
    r -= weights[i];
    if (r <= 0) return questions[i];
  }
  return questions[questions.length - 1];
}

export function deckStats(questions: Question[], memory: DeckMemory) {
  const learned = questions.filter((q) => isLearned(memory[q.id])).length;
  const seen = questions.filter((q) => (memory[q.id]?.seen ?? 0) > 0).length;
  return { total: questions.length, learned, seen };
}
