import type { Question } from "../lib/types";
import { LLM_MC_P1 } from "./llm-mc-p1";
import { LLM_MC_P2 } from "./llm-mc-p2";
import { LLM_MC_P3 } from "./llm-mc-p3";
import { LLM_MC_P4 } from "./llm-mc-p4";
import { LLM_MC_P5 } from "./llm-mc-p5";
import { LLM_MC_RL } from "./llm-mc-rl";
import { LLM_MC_P6 } from "./llm-mc-p6";
import { LLM_MC_P7 } from "./llm-mc-p7";
import { LLM_MC_P8 } from "./llm-mc-p8";

export const LLM_MULTIPLE_CHOICE: Question[] = [
  ...LLM_MC_P1,
  ...LLM_MC_P2,
  ...LLM_MC_P3,
  ...LLM_MC_P4,
  ...LLM_MC_P5,
  ...LLM_MC_RL,
  ...LLM_MC_P6,
  ...LLM_MC_P7,
  ...LLM_MC_P8,
];
