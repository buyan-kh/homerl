export type Grade = "missed" | "close" | "got_it";

export type Question = {
  id: string;
  deck: string;
  chapter?: string;
  prompt: string;
  answer: string;
  pattern?: string;
};

export type CardMemory = {
  ease: number;
  streak: number;
  seen: number;
  missed: number;
  lastGrade?: Grade;
};

export type DeckMemory = Record<string, CardMemory>;
