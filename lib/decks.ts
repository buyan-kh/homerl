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
import { LLM_P1_FOUNDATIONS } from "@/data/llm-p1-foundations";
import { LLM_P2_KERNELS } from "@/data/llm-p2-kernels";
import { LLM_P3_ARCHITECTURE } from "@/data/llm-p3-architecture";
import { LLM_P4_PRETRAINING } from "@/data/llm-p4-pretraining";
import { LLM_P5_POST_TRAINING } from "@/data/llm-p5-post-training";
import { LLM_RL } from "@/data/llm-rl";
import { LLM_P6_EVALS } from "@/data/llm-p6-evals";
import { LLM_P7_INTERPRETABILITY } from "@/data/llm-p7-interpretability";
import { LLM_P8_CAPSTONE } from "@/data/llm-p8-capstone";
import { LEETCODE_LEVELS } from "@/data/leetcode/meta";
import type { Question } from "./types";

export type DeckKind = "drill" | "book" | "code";

export type DeckDefinition = {
  slug: string;
  courseSlug: string;
  section: string;
  title: string;
  description: string;
  /** Drills can reshuffle after a finished pass. Books stay in source order. Code sections are coding levels with their own page (no flash cards). */
  kind: DeckKind;
  /** "plain" turns off the CS 166 protocol-notation math rendering (KV, RL, E(...) and so on). Defaults to "protocol". */
  notation?: "protocol" | "plain";
  /** Optional reference books shown on the section page and its course tile. */
  books?: string[];
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

const LLM_SECTIONS: DeckDefinition[] = [
  {
    slug: "llm/p1-foundations",
    courseSlug: "llm",
    section: "p1-foundations",
    title: "P1 Foundations",
    kind: "book",
    notation: "plain",
    books: ["Mathematics for Machine Learning (Deisenroth, Faisal, Ong)", "Understanding Deep Learning (Simon Prince)", "Build a Large Language Model (From Scratch) (Sebastian Raschka)"],
    description: "Linear algebra and MML, micrograd and backprop, probability and optimizers, makemore, Attention Is All You Need, nanoGPT and RoPE, CS336 assignment 1. Build this cards for every ship goal.",
    questions: LLM_P1_FOUNDATIONS,
  },
  {
    slug: "llm/p2-kernels",
    courseSlug: "llm",
    section: "p2-kernels",
    title: "P2 Kernels and GPUs",
    kind: "book",
    notation: "plain",
    books: ["How to Scale Your Model (Google DeepMind)", "The Ultra-Scale Playbook (Hugging Face)"],
    description: "PyTorch internals, the profiler and torch.compile, the GPU execution and memory model, GPU Puzzles, Triton, and fused softmax and RMSNorm kernels.",
    questions: LLM_P2_KERNELS,
  },
  {
    slug: "llm/p3-architecture",
    courseSlug: "llm",
    section: "p3-architecture",
    title: "P3 Architecture frontier",
    kind: "book",
    notation: "plain",
    books: ["Understanding Deep Learning (Simon Prince)", "Build a Large Language Model (From Scratch) (Sebastian Raschka)"],
    description: "PreNorm, FlashAttention 1 and 2, PI and YaRN, Switch and DeepSeekMoE, linear attention and GLA, Mamba and Mamba-2, DeltaNet and FLA, Gated DeltaNet, Kimi Linear (KDA), Attention Residuals, modded-nanogpt.",
    questions: LLM_P3_ARCHITECTURE,
  },
  {
    slug: "llm/p4-pretraining",
    courseSlug: "llm",
    section: "p4-pretraining",
    title: "P4 Pretraining and scale",
    kind: "book",
    notation: "plain",
    books: ["How to Scale Your Model (Google DeepMind)", "The Ultra-Scale Playbook (Hugging Face)"],
    description: "Kaplan and Chinchilla scaling laws, the Ultra-Scale Playbook (precision, FSDP, parallelism), How to Scale Your Model and inference at scale, FineWeb data work, nanochat, and reading the Kimi K3 report.",
    questions: LLM_P4_PRETRAINING,
  },
  {
    slug: "llm/p5-post-training",
    courseSlug: "llm",
    section: "p5-post-training",
    title: "P5 Post-training",
    kind: "book",
    notation: "plain",
    books: ["RLHF Book (Nathan Lambert)", "Build a Large Language Model (From Scratch) (Sebastian Raschka)"],
    description: "InstructGPT and SFT with TRL, DPO, DeepSeekMath and GRPO, DeepSeek-R1 and reasoning RL. Pair with the RL deep track.",
    questions: LLM_P5_POST_TRAINING,
  },
  {
    slug: "llm/rl",
    courseSlug: "llm",
    section: "rl",
    title: "RL deep track (with P5)",
    kind: "book",
    notation: "plain",
    books: ["Reinforcement Learning: An Introduction (Sutton and Barto)", "Spinning Up in Deep RL (OpenAI)", "RLHF Book (Nathan Lambert)", "Understanding Deep Learning (Simon Prince)"],
    description: "The largest section, studied alongside P5. MDPs, Bellman, the policy gradient theorem from first principles, REINFORCE and RLOO, GAE, actor-critic, TRPO, PPO in full, KL penalties and estimators, reward models, PPO for LLMs, DPO derivation, GRPO and its fixes (Dr. GRPO, DAPO, GSPO), RLVR, reward hacking, entropy collapse, process rewards, environments, importance sampling, and the rollout loop.",
    questions: LLM_RL,
  },
  {
    slug: "llm/p6-evals",
    courseSlug: "llm",
    section: "p6-evals",
    title: "P6 Evals and graders",
    kind: "book",
    notation: "plain",
    books: ["RLHF Book (Nathan Lambert)"],
    description: "lm-evaluation-harness tasks and scoring modes, benchmark statistics, contamination, pass@k, judges, deterministic graders, agentic evals, and evaluating RL environments.",
    questions: LLM_P6_EVALS,
  },
  {
    slug: "llm/p7-interpretability",
    courseSlug: "llm",
    section: "p7-interpretability",
    title: "P7 Interpretability",
    kind: "book",
    notation: "plain",
    books: ["Understanding Deep Learning (Simon Prince)"],
    description: "QK and OV circuits, induction heads, logit lens and activation patching, TransformerLens and ARENA, probes, superposition, Towards Monosemanticity, and sparse autoencoders (L1, TopK, JumpReLU).",
    questions: LLM_P7_INTERPRETABILITY,
  },
  {
    slug: "llm/p8-capstone",
    courseSlug: "llm",
    section: "p8-capstone",
    title: "P8 Research taste and capstone",
    kind: "book",
    notation: "plain",
    description: "Research taste, seeds and ablations, negative results, writing an arXiv-style paper, reproducibility, and the capstone build.",
    questions: LLM_P8_CAPSTONE,
  },
];

const LEETCODE_SECTIONS: DeckDefinition[] = LEETCODE_LEVELS.map((level) => ({
  slug: `leetcode/${level.slug}`,
  courseSlug: "leetcode",
  section: level.slug,
  title: level.title,
  kind: "code" as const,
  description: level.description,
  questions: [],
}));

export const COURSES: Record<string, CourseDefinition> = {
  cs166: {
    slug: "cs166",
    title: "CS 166",
    description: "Information Security. Sections for Test 2 practice now; later you can add a Final review here too.",
    sections: CS166_SECTIONS,
  },
  llm: {
    slug: "llm",
    title: "LLM Research: the 9-month scientist track",
    description: "Build your own models and do real research, phase by phase from the 9-month plan. Each section is a book that follows the plan's readings in order, with Build this cards for every ship goal, plus a deep RL track alongside post-training.",
    sections: LLM_SECTIONS,
  },
  leetcode: {
    slug: "leetcode",
    title: "LeetCode",
    description: "Coding practice that runs Python right in the browser. Levels 1 to 3 are bite-sized drills for Python fluency, 4 to 6 are easy problems you can break into small steps, 7 and 8 are medium, and 9 and 10 are hard.",
    sections: LEETCODE_SECTIONS,
  },
};

export const DECKS: Record<string, DeckDefinition> = Object.fromEntries(
  [...CS166_SECTIONS, ...LLM_SECTIONS, ...LEETCODE_SECTIONS].map((section) => [section.slug, section]),
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
