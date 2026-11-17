export type Grade = "missed" | "close" | "got_it";

export type Question = {
  id: string;
  deck: string;
  source?: string;
  chapter?: string;
  /** Finer topic shown on the card when chapter is a section-level filter. */
  topic?: string;
  prompt: string;
  answer: string;
  answerImage?: string;
  /** Alt text for answerImage. */
  answerImageAlt?: string;
  /** Diagram shown with the prompt, before the answer is revealed. */
  promptImage?: string;
  promptImageAlt?: string;
  /** Key of an inline SVG diagram shown with the prompt. */
  diagram?: string;
  /** Key of an inline SVG diagram shown after the answer is revealed. */
  answerDiagram?: string;
  pattern?: string;
  /** Answer choices. When set with correctIndex, the card is multiple choice. */
  choices?: string[];
  /** 0-based index of the correct choice. */
  correctIndex?: number;
  /** When true, render each choice as a code block. */
  choicesAreCode?: boolean;
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

export type DeckQuizStats = {
  attempts: number;
  bestPercent: number;
  bestGotIt: number;
  bestAsked: number;
  lastPercent: number;
  lastGotIt: number;
  lastAsked: number;
};

export function isMultipleChoice(question: Question): boolean {
  return (
    Array.isArray(question.choices) &&
    question.choices.length >= 2 &&
    typeof question.correctIndex === "number" &&
    question.correctIndex >= 0 &&
    question.correctIndex < question.choices.length
  );
}

export function deckIsMultipleChoice(questions: Question[]): boolean {
  return questions.length > 0 && questions.every(isMultipleChoice);
}
