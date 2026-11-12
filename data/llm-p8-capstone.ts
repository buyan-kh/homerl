import type { Question } from "../lib/types";

export const LLM_P8_CAPSTONE: Question[] = [
  {
    "id": "llm-p8-01",
    "deck": "P8 Research taste and capstone",
    "source": "Plan reading: Chris Olah's notes on research taste; your own lab notebook",
    "chapter": "Research taste and experiment design",
    "prompt": "What is research taste, and how do you train it deliberately?",
    "answer": "Taste is the ability to choose problems and experiments that are both important and tractable, and to predict which directions will pay off before spending the compute.\nWays to train it deliberately (several are suggested in Chris Olah's research taste notes; read them directly):\n- keep a list of research ideas, and write for each why it matters, what would count as success, and the cheapest first experiment\n- before every experiment, write down your predicted result and confidence; afterwards, score yourself. Calibration is taste you can measure.\n- ask people with good taste to rate your ideas, and compare with your own ratings\n- reread papers you liked a year ago: which ideas lasted, and why?\n- study why famous results were surprising at the time\nThe feedback loop matters most: taste improves only when predictions are written down and checked.",
    "pattern": "Write ideas and predictions down, score yourself after experiments, get ideas rated by people with taste. Taste needs feedback."
  },
  {
    "id": "llm-ip-21",
    "deck": "P8 Research taste and capstone",
    "source": "Plan reading: Chris Olah's notes on research taste; your own lab notebook",
    "chapter": "Research taste and experiment design",
    "prompt": "How do you decide which experiment to run next when compute is limited?",
    "answer": "Pick the experiment whose result would most change what you do next, at the lowest cost.\n1. Write the hypothesis and the decision each outcome would trigger before running.\n2. Start at the smallest scale that can show the effect, with a known-good baseline run alongside.\n3. Prefer fast feedback loops: minutes or hours, not days.\n4. Change one thing at a time, and look at samples and curves, not just the final number.\n5. Kill runs early when they are clearly off-track.\nThis is research taste in practice: prioritization, rigor, and speed.",
    "pattern": "Run the cheapest experiment that would change your next decision."
  },
  {
    "id": "llm-p8-02",
    "deck": "P8 Research taste and capstone",
    "source": "Plan reading: Chris Olah's notes on research taste; your own lab notebook",
    "chapter": "Research taste and experiment design",
    "prompt": "How many seeds do you need, and how do you report results so they mean something?",
    "answer": "Seed variance in deep learning is often as large as the effects people report, especially at small scale and in RL.\nPractice:\n- run at least 3 seeds per arm for the main claims (5 or more for RL and for small effects); use the same seeds across arms where it makes sense, so comparisons are paired\n- report mean and a measure of spread (standard deviation across seeds, or a bootstrap confidence interval of the mean), and show all seeds in plots (thin lines) not just the mean\n- estimate noise first: run the baseline several times before testing changes, so you know the minimum effect you can detect\n- the same budget for tuning each arm; say how much tuning each received\n- for many comparisons, beware multiple testing: one of 20 tweaks will look significant by chance\nA useful rule: if the effect is smaller than the spread of baseline seeds, you have not shown anything yet.",
    "pattern": "3+ seeds (5+ for RL), paired seeds, mean with spread, all seeds plotted, baseline noise measured first, equal tuning."
  },
  {
    "id": "llm-p8-03",
    "deck": "P8 Research taste and capstone",
    "source": "Plan reading: Chris Olah's notes on research taste; your own lab notebook",
    "chapter": "Research taste and experiment design",
    "prompt": "How do you design an ablation study that someone else would trust?",
    "answer": "1. One change per arm, relative to a strong, reproduced baseline. If your method has 4 parts, run the baseline plus each part alone and all-minus-one.\n2. Match what matters: parameters, FLOPs, tokens, wall clock, tuning budget. State which you matched.\n3. Decide metrics and the eval set before running; keep a held-out set you do not look at until the end.\n4. Use seeds and report spread (previous card).\n5. Check scale: does the effect hold at 2 or 3 sizes, or shrink as models grow? Many tricks vanish with scale.\n6. Record negative results with the same care: a change that did not help, with error bars, is useful knowledge and protects you from fooling yourself later.\n7. Keep a lab notebook: config hash, git commit, data version, command, result, one-line interpretation, for every run.",
    "pattern": "One change per arm from a strong baseline, matched compute and tuning, pre-chosen metrics, seeds, multiple scales, log negatives."
  },
  {
    "id": "llm-ip-20",
    "deck": "P8 Research taste and capstone",
    "source": "Plan reading: Chris Olah's notes on research taste; your own lab notebook",
    "chapter": "Research taste and experiment design",
    "prompt": "A paper claims a new method gives +5 points on a benchmark. What do you check before believing it?",
    "answer": "1. Baseline strength: was the baseline tuned as hard as the method (same LR sweeps, same compute)?\n2. Compute matching: does the method use more FLOPs, data, or samples?\n3. Noise: number of seeds, confidence intervals, benchmark size.\n4. Generality: one benchmark and one model size, or several?\n5. Scale: does the gain shrink as models grow?\n6. Contamination and eval setup differences.\n7. Ablations: which part actually causes the gain?\nThen try to reproduce the smallest version yourself.",
    "pattern": "Tuned baseline, matched compute, error bars, multiple scales, ablations."
  },
  {
    "id": "llm-ip-22",
    "deck": "P8 Research taste and capstone",
    "source": "Plan reading: Chris Olah's notes on research taste; your own lab notebook",
    "chapter": "Research taste and experiment design",
    "prompt": "What is 'The Bitter Lesson' and how should it shape your engineering choices?",
    "answer": "Rich Sutton's 2019 essay: across AI history, general methods that scale with computation (search and learning) eventually beat methods built on hand-coded human knowledge.\nEngineering takeaway: prefer simple methods that improve with more compute and data, build infrastructure that makes scaling easy, and be suspicious of clever tricks that only help at small scale. It is a heuristic, not a law: data quality, good environments, and evals still take lots of human judgment.",
    "pattern": "Bet on methods that scale with compute. Keep tricks that survive scale."
  },
  {
    "id": "llm-p8-04",
    "deck": "P8 Research taste and capstone",
    "source": "Plan reading: Chris Olah's notes on research taste; your own lab notebook",
    "chapter": "Research taste and experiment design",
    "prompt": "How should you treat negative results and surprising results?",
    "answer": "Negative results: a clean, well-powered null result is information. Write it up in the notebook (and sometimes publicly): what you tried, why you expected it to work, how strong the test was (seeds, scale, tuning), and the plot. Most of what you learn as a researcher is from these.\nSurprising positive results: assume a bug first. Checks, in order:\n- train/test leakage or contamination\n- an evaluation bug (wrong metric, wrong split, extraction errors)\n- unequal baselines (less tuning, fewer tokens, a different data order)\n- a lucky seed\n- a change you did not intend (config drift)\nOnly after these does it become interesting. Then try to break it yourself: different data, scale, seeds.\nSurprising negative results (your baseline got worse) deserve the same audit.",
    "pattern": "Record nulls with their power. For surprises, hunt bugs first: leakage, eval bugs, unequal baselines, luck, config drift."
  },
  {
    "id": "llm-p8-05",
    "deck": "P8 Research taste and capstone",
    "source": "Plan reading: well-written arXiv papers in your area; Olah and Carter 2017, Research Debt (Distill)",
    "chapter": "Writing it up: the capstone",
    "prompt": "What structure should an arXiv-style research write-up have, and what makes each part good?",
    "answer": "- Title and abstract: the question, what you did, the main result with a number, and why it matters, in about 150 to 250 words.\n- Introduction: the problem, why existing work does not settle it, your contributions as a short list of claims you then support.\n- Background and related work: only what a reader needs, with fair credit.\n- Method: precise enough to reimplement; equations in a consistent notation.\n- Experimental setup: models, data, compute, hyperparameters, seeds, baselines and how they were tuned.\n- Results: each claim from the introduction gets a figure or table with spread across seeds.\n- Ablations and analysis: why it works, when it does not.\n- Limitations: honest scope (scale, tasks, compute).\n- Conclusion; reproducibility statement with code and configs.\nGood papers make one main claim easy to verify. Write the figures first, then the text around them.",
    "pattern": "Abstract with a number, contributions as claims, reimplementable method, full setup, a figure per claim, ablations, limitations."
  },
  {
    "id": "llm-p8-06",
    "deck": "P8 Research taste and capstone",
    "source": "Plan reading: well-written arXiv papers in your area; Olah and Carter 2017, Research Debt (Distill)",
    "chapter": "Writing it up: the capstone",
    "prompt": "What makes a good results figure in an ML paper?",
    "answer": "- One message per figure, stated in the caption's first sentence (\"X improves loss at all scales\", not \"Results\").\n- Show variation: seeds as thin lines or shaded bands, error bars on bars; say what they represent.\n- Comparable axes: log scales for compute, tokens and parameters; shared y-axis ranges across panels you want compared.\n- Label everything: units, arm names that match the text, readable font sizes.\n- Baselines visibly present and visually distinct; colors consistent across all figures; colorblind-safe palettes.\n- Avoid truncated y-axes that exaggerate gaps, unless clearly marked.\n- Make the data and plotting script available, so every figure can be regenerated from logs.",
    "pattern": "One message per figure, seeds shown, log axes for scale, consistent labeled arms, honest axes, regenerable from logs."
  },
  {
    "id": "llm-p8-07",
    "deck": "P8 Research taste and capstone",
    "source": "Plan reading: well-written arXiv papers in your area; Olah and Carter 2017, Research Debt (Distill)",
    "chapter": "Writing it up: the capstone",
    "prompt": "What does a reproducible ML project package look like?",
    "answer": "- Code in a public repo with a pinned environment (lock file or container) and a README that reproduces the main result with one command per experiment.\n- Configs for every run in the paper, versioned; a mapping from figure to config and command.\n- Data: scripts to download and preprocess, with checksums; dataset versions recorded.\n- Seeds set and recorded; note sources of nondeterminism you could not remove.\n- Logs and checkpoints for the key runs (or at least final metrics and curves) published.\n- Hardware and cost: GPU type, count, hours.\n- Tests for core components (the same discipline as CS336 A1).\nTest it: have someone else (or you, on a fresh machine) reproduce a figure from the README alone before you publish.",
    "pattern": "Pinned env, one command per result, versioned configs mapped to figures, data checksums, seeds, logs, hardware and cost."
  },
  {
    "id": "llm-p8-build-01",
    "deck": "P8 Research taste and capstone",
    "source": "Plan reading: well-written arXiv papers in your area; Olah and Carter 2017, Research Debt (Distill)",
    "chapter": "Writing it up: the capstone",
    "prompt": "Build this: Capstone: arXiv-style paper, repo and thread",
    "answer": "Spec: One research project that builds on your strongest thread from the plan (e.g. KDA-style gating, AttnRes at small scale, a GRPO variant, a research-eval), written as an arXiv-style PDF with a public repo and a thread.\n\nSteps:\n1. Write a one-page proposal: question, hypothesis, predicted result, minimal experiment, compute budget.\n2. Reproduce the baseline and measure its noise first.\n3. Run the main experiment and ablations with seeds; keep the lab notebook.\n4. Draft figures, then the paper (structure from the earlier card); get two people to review it.\n5. Release the repo (one command per figure), post the PDF, and write the thread around the main figure.\n\nSuccess looks like: A paper whose central claim is supported by a figure with seed spread, a repo that reproduces it from the README, and reviewers who could restate your contribution in one sentence.",
    "pattern": "Build this: Capstone: arXiv-style paper, repo and thread"
  }
];
