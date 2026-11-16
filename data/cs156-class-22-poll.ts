import type { Question } from "../lib/types";

export const CS156_CLASS_22_POLL: Question[] = [
  {
    id: "c22-1",
    deck: "CS 156 Class 22 Poll",
    chapter: "Class 22 Poll",
    source: "CS 156 Class 22 iClicker, lecture slide 6",
    prompt:
      "In the rain network, R (raining) points to T (traffic) and D (roof drips), and both T and D point to S (I'm sad). Is T independent of D given R?\nA. Yes, we can guarantee independence\nB. No, we cannot guarantee independence",
    answer: "A. Yes, we can guarantee independence.",
    pattern:
      "The two paths are T-S-D and T-R-D. Given only R, the collider through S stays closed and the fork through R is blocked, so there are no active paths.",
  },
  {
    id: "c22-2",
    deck: "CS 156 Class 22 Poll",
    chapter: "Class 22 Poll",
    source: "CS 156 Class 22 iClicker, lecture slide 10",
    prompt:
      "In the alarm network, John and Mary called, and we want to know if there was a burglary. Query is B, evidence is J and M, and hidden variables are E and A. What probability are we looking for?\nA. P(+b, +j, +m)\nB. P(+b | +j, +m)\nC. P(+b, +j, +m, -e, +a)\nD. P(+b, +j, +m | -e, +a)",
    answer: "B. P(+b | +j, +m).",
    pattern:
      "We want the query given the evidence we actually have. Do not invent values for the hidden variables E and A.",
  },
  {
    id: "c22-3",
    deck: "CS 156 Class 22 Poll",
    chapter: "Class 22 Poll",
    source: "CS 156 Class 22 iClicker, lecture slide 13",
    prompt:
      "In the alarm network, B and E are roots, both point to A, and A points to J and M. What is P(+b, +j, +m, +e, +a)?\nA. P(+b) P(+j) P(+m) P(+e) P(+a)\nB. P(+b) P(+e) P(+a | +b, +e) P(+j | +a) P(+m | +a)\nC. P(+j) P(+m) P(+a | +j, +m) P(+b | +a) P(+e | +a)\nD. P(+b) P(+e) P(+a | +b) P(+a | +e) P(+j | +a) P(+m | +a)\nE. P(+b) P(+j) P(+m) P(+e) P(+a | +b, +e, +j, +m)",
    answer: "B. P(+b) P(+e) P(+a | +b, +e) P(+j | +a) P(+m | +a).",
    pattern:
      "The joint is the product of each variable given only its parents.",
  },
  {
    id: "c22-4",
    deck: "CS 156 Class 22 Poll",
    chapter: "Class 22 Poll",
    source: "CS 156 Class 22 iClicker, lecture slide 17",
    prompt:
      "In the alarm CPT, P(A | B, E) has the row +b, +e, +a equal to 0.95, and the row +b, +e, -a equal to 0.05. What is P(+a | +b, +e)?",
    answer: "0.95.",
    pattern: "Read the matching row in P(A | B, E): +b, +e, +a is 0.95.",
  },
  {
    id: "c22-5",
    deck: "CS 156 Class 22 Poll",
    chapter: "Class 22 Poll",
    source: "CS 156 Class 22 iClicker, lecture slide 21",
    prompt:
      "In the alarm CPT, P(J | A) has +a, +j equal to 0.9 and -a, +j equal to 0.05. What is P(+j | -a)?",
    answer: "0.05.",
    pattern: "Look up P(J | A) at -a, +j, which is 0.05, not the 0.9 that goes with +a.",
  },
  {
    id: "c22-6",
    deck: "CS 156 Class 22 Poll",
    chapter: "Class 22 Poll",
    source: "CS 156 Class 22 iClicker, lecture slide 33",
    prompt:
      "A Markov chain is the Bayes net X1 -> X2 -> X3 -> ... -> Xt. What is P(X1, X2, X3)?\nA. P(X1) P(X2) P(X3)\nB. P(X1 | X2) P(X2 | X3) P(X3)\nC. P(X1) P(X2 | X1) P(X3 | X2)\nD. P(X1) + P(X2) + P(X3)",
    answer: "C. P(X1) P(X2 | X1) P(X3 | X2).",
    pattern:
      "A chain joint is the initial distribution times each one-step transition.",
  },
  {
    id: "c22-7",
    deck: "CS 156 Class 22 Poll",
    chapter: "Class 22 Poll",
    source: "CS 156 Class 22 iClicker, lecture slide 36",
    prompt:
      "The weather chain starts with P(X1 = sun) = 1.0, and we just found P(X2 = sun) = 0.9. What is P(X2 = rain)?",
    answer: "0.1.",
    pattern: "Sun and rain are the only two states, so P(X2 = rain) = 1 - 0.9 = 0.1.",
  },
  {
    id: "c22-8",
    deck: "CS 156 Class 22 Poll",
    chapter: "Class 22 Poll",
    source: "CS 156 Class 22 iClicker, lecture slide 38",
    prompt:
      "The weather chain has P(X2 = sun) = 0.9 and P(X2 = rain) = 0.1, with P(sun | sun) = 0.9 and P(sun | rain) = 0.3. What is P(X3 = sun)?",
    answer: "0.84.",
    pattern:
      "P(X3 = sun) = 0.9 * 0.9 + 0.3 * 0.1 = 0.81 + 0.03 = 0.84.",
  },
];
