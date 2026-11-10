export type Grade = "missed" | "close" | "got_it";

export type Question = {
  id: string;
  deck: string;
  source?: string;
  chapter?: string;
  prompt: string;
  answer: string;
  answerImage?: string;
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

export type DeckInfo = {
  id: string;
  title: string;
  blurb: string;
  primary: boolean;
  questions: Question[];
};
