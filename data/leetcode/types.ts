export type LcCompare = "exact" | "float" | "unordered" | "unordered_nested";

export type LcTest = {
  /** Positional arguments for the function, or [ops, params] for a class problem. */
  args: unknown[];
  expected: unknown;
};

/** One codeable unit: a whole problem or one breakdown step. */
export type LcUnit = {
  func: string;
  prompt: string;
  starter: string;
  solution: string;
  tests: LcTest[];
  compare: LcCompare;
  /** "func" calls func(*args). "class" builds the class and replays method calls. */
  mode: "func" | "class";
};

export type LcStep = LcUnit & { title: string };

export type LcItem = LcUnit & {
  id: string;
  level: number;
  title: string;
  pattern: string;
  hints: string[];
  /** Ordered sub-steps. The UI adds the whole problem as the last step. */
  breakdown?: LcStep[];
};

export type LcLevelMeta = {
  level: number;
  slug: string;
  title: string;
  description: string;
  items: { id: string; title: string; pattern: string; steps: number }[];
};
