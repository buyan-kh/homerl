import type { Question } from "../lib/types";

export const LLM_P6_EVALS: Question[] = [
  {
    "id": "llm-p6-01",
    "deck": "P6 Evals and graders (W31-32)",
    "source": "Plan reading: EleutherAI lm-evaluation-harness (docs: new task guide, task configuration)",
    "chapter": "W31 lm-evaluation-harness, metrics and contamination",
    "prompt": "What is in an lm-evaluation-harness task definition?",
    "answer": "Tasks are YAML configs (with optional Python helpers). The key fields:\n- task: the name; dataset_path, dataset_name and the split fields (test_split, validation_split, fewshot_split) point at a Hugging Face dataset\n- doc_to_text: the prompt built from a document (a Jinja template or a function)\n- doc_to_target: the gold answer (string or index)\n- doc_to_choice: the answer options, for multiple choice\n- output_type: loglikelihood, multiple_choice, loglikelihood_rolling or generate_until\n- generation_kwargs (for generate_until): until stop sequences, max tokens, temperature\n- metric_list: e.g. acc, acc_norm, exact_match with aggregation and higher_is_better\n- num_fewshot, filters (e.g. regex extraction of a final answer), and a version field\nRun with lm_eval --model hf --model_args pretrained=... --tasks your_task --num_fewshot k --log_samples, and always read the logged samples. Check the current docs for exact field names.",
    "pattern": "YAML: dataset, doc_to_text, doc_to_target, doc_to_choice, output_type, generation_kwargs, metric_list, filters, version."
  },
  {
    "id": "llm-p6-02",
    "deck": "P6 Evals and graders (W31-32)",
    "source": "Plan reading: EleutherAI lm-evaluation-harness (docs: new task guide, task configuration)",
    "chapter": "W31 lm-evaluation-harness, metrics and contamination",
    "prompt": "loglikelihood multiple choice vs generate_until: how does each score a model, and what are acc and acc_norm?",
    "answer": "Multiple choice by loglikelihood: for each option, compute the log-probability of the option text given the prompt. The prediction is the option with the highest score; no text is generated.\n- acc: argmax of the raw summed log-probability; biased toward shorter options (fewer tokens, fewer negative terms)\n- acc_norm: normalize by length (the harness uses the option's byte length) before the argmax, which removes much of the length bias\nBase models are usually evaluated this way: it works even when the model cannot follow an answer format.\ngenerate_until: the model generates text until a stop sequence; a filter extracts the answer (e.g. a regex for the final number), then exact match or a custom scorer compares it to the gold. This is what chat and reasoning models need, and it depends on prompt format, stop sequences and extraction.\nConsequence: the same benchmark can give very different numbers under the two modes, so always state the mode, few-shot count and prompt when reporting.",
    "pattern": "MC: argmax option log-prob (acc raw, acc_norm by byte length). Generate: produce text, extract, exact match. Report the mode."
  },
  {
    "id": "llm-ev-01",
    "deck": "P6 Evals and graders (W31-32)",
    "source": "Plan reading: EleutherAI lm-evaluation-harness (docs: new task guide, task configuration)",
    "chapter": "W31 lm-evaluation-harness, metrics and contamination",
    "prompt": "What properties make a benchmark worth building and running?",
    "answer": "1. Validity: success actually requires the skill you care about.\n2. Headroom: the frontier is not near the ceiling, and scores spread models apart.\n3. Low noise: enough items, a deterministic or well-calibrated grader, stable environment.\n4. Correct labels: every item checked; a few percent label errors cap the score and add noise.\n5. Contamination resistance: private, fresh, or generated after training cutoffs.\n6. Cost: cheap enough to run on every checkpoint.\n7. Clear reporting: fixed prompt, harness, sampling settings, and scaffold.",
    "pattern": "Valid, unsaturated, low noise, correct labels, uncontaminated, cheap."
  },
  {
    "id": "llm-ev-02",
    "deck": "P6 Evals and graders (W31-32)",
    "source": "Plan reading: EleutherAI lm-evaluation-harness (docs: new task guide, task configuration)",
    "chapter": "W31 lm-evaluation-harness, metrics and contamination",
    "prompt": "A model scores 60% on a 500-question benchmark. What is the 95% confidence interval, and is a 2-point gain over another model meaningful?",
    "answer": "Standard error = sqrt(p(1 - p) / n) = sqrt(0.6 * 0.4 / 500) = 0.0219.\n95% CI: +/- 1.96 * 0.0219 = +/- 4.3 points, so about 55.7% to 64.3%.\nThe difference of two independent models has SE about sqrt(2) times larger, CI about +/- 6 points. A 2-point gain is noise.\nBetter: paired comparison on the same questions (much lower variance), more questions, or several samples per question.",
    "pattern": "SE = sqrt(p(1-p)/n). At n=500, plus or minus 4 points. Use paired tests."
  },
  {
    "id": "llm-ev-03",
    "deck": "P6 Evals and graders (W31-32)",
    "source": "Plan reading: EleutherAI lm-evaluation-harness (docs: new task guide, task configuration)",
    "chapter": "W31 lm-evaluation-harness, metrics and contamination",
    "prompt": "Why do benchmarks saturate, and what is the usual lifecycle?",
    "answer": "Models improve, labs optimize toward public numbers, and the remaining errors are often label noise or ambiguous items. Scores bunch near the top and stop separating models.\nLifecycle examples: GLUE to SuperGLUE, MMLU to MMLU-Pro and GPQA, then Humanity's Last Exam; HumanEval to LiveCodeBench and SWE-bench. Good practice: plan for saturation from day one with hard tiers, refreshable item pools, and a private held-out split.",
    "pattern": "Every public benchmark saturates. Build hard tiers and a private split."
  },
  {
    "id": "llm-ev-04",
    "deck": "P6 Evals and graders (W31-32)",
    "source": "Plan reading: EleutherAI lm-evaluation-harness (docs: new task guide, task configuration)",
    "chapter": "W31 lm-evaluation-harness, metrics and contamination",
    "prompt": "How much can prompt format change benchmark scores, and how do you report results responsibly?",
    "answer": "A lot. Few-shot count, answer format (letter vs full text), choice order, chat template vs raw completion, and answer extraction regex can each move scores by several points, and can flip the ranking of two close models.\nReport: the exact harness and version, prompt, number of shots, sampling settings (temperature, samples per item), answer extraction method, and scaffold for agentic tasks. Compare models only under the same setup.",
    "pattern": "Format moves scores. Fix and publish the harness."
  },
  {
    "id": "llm-ev-05",
    "deck": "P6 Evals and graders (W31-32)",
    "source": "Plan reading: EleutherAI lm-evaluation-harness (docs: new task guide, task configuration)",
    "chapter": "W31 lm-evaluation-harness, metrics and contamination",
    "prompt": "How do you detect benchmark contamination?",
    "answer": "1. N-gram overlap between test items and training data (the GPT-3 paper used 13-gram overlap).\n2. Memorization probes: give the first half of a test question and see if the model completes it verbatim, or check whether it assigns abnormally low perplexity to the exact test text.\n3. Performance gap on fresh equivalents: GSM1k (a new set written to match GSM8K) found some models dropped noticeably, a sign of overfitting.\n4. Time-based splits: compare scores on problems published before vs after the training cutoff (LiveCodeBench does this).\n5. Canary strings (BIG-bench) let you grep training data for leaked eval files.",
    "pattern": "Overlap, memorization probes, fresh-equivalent gaps, before-vs-after-cutoff splits."
  },
  {
    "id": "llm-ev-06",
    "deck": "P6 Evals and graders (W31-32)",
    "source": "Plan reading: EleutherAI lm-evaluation-harness (docs: new task guide, task configuration)",
    "chapter": "W31 lm-evaluation-harness, metrics and contamination",
    "prompt": "Your SWE-style environment uses real GitHub repos. Why is contamination a special risk, and how do you limit it?",
    "answer": "The fixing commit, the PR discussion, and often the exact patch are public and likely in pretraining data. A model can recall the solution instead of reasoning. Forks and mirrors spread it further.\nLimit it: use repos or issues created after the model's cutoff, private or synthetic repos, rewritten tasks (new bugs injected into code, renamed identifiers), and hidden tests the model has never seen. Measure recall directly by checking how often the model reproduces the upstream patch verbatim.",
    "pattern": "Public fixes leak. Use post-cutoff, private, or synthetic tasks with hidden tests."
  },
  {
    "id": "llm-ev-07",
    "deck": "P6 Evals and graders (W31-32)",
    "source": "Plan reading: EleutherAI lm-evaluation-harness (docs: new task guide, task configuration)",
    "chapter": "W31 lm-evaluation-harness, metrics and contamination",
    "prompt": "Write the unbiased pass@k estimator and compute pass@1 and pass@5 for n = 10 samples with c = 3 correct.",
    "answer": "pass@k = 1 - C(n - c, k) / C(n, k), averaged over problems (Chen et al., 'Evaluating Large Language Models Trained on Code').\npass@1 = 1 - C(7, 1) / C(10, 1) = 1 - 7/10 = 0.30.\npass@5 = 1 - C(7, 5) / C(10, 5) = 1 - 21/252 = 0.917.\nThe naive 1 - (1 - c/n)^k is biased. Sample n > k per problem and use the combinatorial form. Stable code: 1 - prod over i from n-c+1 to n of (1 - k/i).",
    "pattern": "pass@k = 1 - C(n-c, k)/C(n, k). Sample n > k."
  },
  {
    "id": "llm-ev-08",
    "deck": "P6 Evals and graders (W31-32)",
    "source": "Plan reading: EleutherAI lm-evaluation-harness (docs: new task guide, task configuration)",
    "chapter": "W31 lm-evaluation-harness, metrics and contamination",
    "prompt": "pass@k vs maj@k vs pass^k: what does each measure and when do you use it?",
    "answer": "pass@k: at least one of k samples is correct. Measures coverage or the ceiling with a perfect verifier. Useful for RL potential and search.\nmaj@k (self-consistency): the most common answer among k samples is correct. Measures what you get with voting and no verifier.\npass^k (from tau-bench): all k independent trials succeed. Measures reliability, which is what users of agents feel.\nExample: per-trial success 0.7 gives pass^4 = 0.7^4 = 0.24 but about 0.99 chance that at least one of 4 succeeds.",
    "pattern": "pass@k = coverage, maj@k = voting, pass^k = reliability."
  },
  {
    "id": "llm-ev-09",
    "deck": "P6 Evals and graders (W31-32)",
    "source": "Plan reading: EleutherAI lm-evaluation-harness (docs: new task guide, task configuration)",
    "chapter": "W31 lm-evaluation-harness, metrics and contamination",
    "prompt": "What is the METR 'time horizon' metric?",
    "answer": "METR ('Measuring AI Ability to Complete Long Tasks', 2025) timed humans on a set of software and research tasks, then found, for each model, the human task length at which the model succeeds 50% of the time.\nThey reported that this 50% time horizon has been doubling roughly every 7 months. It turns many tasks into one interpretable number about autonomy. Caveats: the task suite is specific, and 50% success is far from reliable.",
    "pattern": "Time horizon = human task length the model completes 50% of the time."
  },
  {
    "id": "llm-ev-10",
    "deck": "P6 Evals and graders (W31-32)",
    "source": "Plan reading: EleutherAI lm-evaluation-harness (docs: new task guide, task configuration)",
    "chapter": "W31 lm-evaluation-harness, metrics and contamination",
    "prompt": "List the main LLM-as-judge biases and a mitigation for each.",
    "answer": "Position bias: prefers the first (or second) answer. Run both orders and only count consistent wins.\nVerbosity bias: prefers longer answers. Length-controlled scoring or explicit rubric instructions.\nSelf-preference: favors outputs from its own model family. Use a different judge family or several judges.\nTone and confidence: swayed by assertive wording, even when wrong. Give the reference answer and ask for verification, not overall impression.\nDrift: judge model updates change scores. Pin the judge version.\nAlways measure judge agreement with human labels on a sample. Reference: Zheng et al., 'Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena'.",
    "pattern": "Swap order, control length, pin and vary the judge, calibrate against humans."
  },
  {
    "id": "llm-ev-11",
    "deck": "P6 Evals and graders (W31-32)",
    "source": "Plan reading: EleutherAI lm-evaluation-harness (docs: new task guide, task configuration)",
    "chapter": "W31 lm-evaluation-harness, metrics and contamination",
    "prompt": "When should you use a model judge, and when should you refuse to?",
    "answer": "Use one for open-ended quality where no program can check the answer: helpfulness, writing, explanation quality, rubric items like 'mentions the safety caveat'. Prefer narrow, binary rubric questions over one 1-to-10 score.\nAvoid it when a deterministic check exists (math answers, code tests, final environment state). A judge is noisier, more expensive, and hackable. Never use the same judge as an RL reward and as the only eval, because the policy will learn to exploit it and your eval will not catch it.",
    "pattern": "Deterministic check if possible. Judges only for the truly open-ended, with binary rubrics."
  },
  {
    "id": "llm-ev-12",
    "deck": "P6 Evals and graders (W31-32)",
    "source": "Plan reading: EleutherAI lm-evaluation-harness (docs: new task guide, task configuration)",
    "chapter": "W31 lm-evaluation-harness, metrics and contamination",
    "prompt": "What are the pitfalls of arena-style human preference leaderboards?",
    "answer": "Votes reward style (length, formatting, confidence) as much as correctness; prompts skew toward what the arena's users happen to ask; Elo or Bradley-Terry scores move with sampling and opponent mix; and providers can test many private variants and publish the best, which inflates scores. 'The Leaderboard Illusion' (2025) documented several of these issues for Chatbot Arena.\nArenas are a useful signal about user preference, not a capability measurement.",
    "pattern": "Arenas measure preference and style, and can be gamed. Not capability."
  },
  {
    "id": "llm-ip-14",
    "deck": "P6 Evals and graders (W31-32)",
    "source": "Plan reading: EleutherAI lm-evaluation-harness (docs: new task guide, task configuration)",
    "chapter": "W31 lm-evaluation-harness, metrics and contamination",
    "prompt": "A model gets 85% on your eval when run by you and 71% when run by a collaborator with the 'same' setup. How do you find the difference?",
    "answer": "Diff everything: model revision and dtype, tokenizer and chat template (system prompt, BOS), sampling settings (temperature, top-p, max tokens, number of samples), answer extraction code, eval data version, harness version, and few-shot examples.\nThen run both setups on the same 20 items and compare the raw prompts byte by byte and the raw outputs. The first item where outputs diverge points at the cause. Usually it is the template, max tokens truncating long reasoning, or the extraction regex.",
    "pattern": "Diff raw prompts and outputs on a few items. Usually template, max tokens, or parsing."
  },
  {
    "id": "llm-p6-build-01",
    "deck": "P6 Evals and graders (W31-32)",
    "source": "Plan reading: EleutherAI lm-evaluation-harness (docs: new task guide, task configuration)",
    "chapter": "W31 lm-evaluation-harness, metrics and contamination",
    "prompt": "Build this (W31): A custom task in lm-evaluation-harness",
    "answer": "Spec: Add a task you care about (for example, a small research-QA or math set you built) to the harness, in both loglikelihood and generative form, and validate it.\n\nSteps:\n1. Put the data on the Hugging Face hub (or a local dataset) with a clean schema and a test split.\n2. Write the YAML for a multiple-choice version and a generate_until version with an extraction filter.\n3. Run 3 or more models of different sizes; save logged samples; hand-check 30 scored samples per mode for extraction errors.\n4. Report scores with 95% confidence intervals and the exact command line; note where the two modes disagree.\n\nSuccess looks like: The task runs from a single command, scores increase with model size, extraction errors in your hand check are near zero, and intervals are reported.",
    "pattern": "Build this: A custom task in lm-evaluation-harness"
  },
  {
    "id": "llm-ev-13",
    "deck": "P6 Evals and graders (W31-32)",
    "source": "Plan reading: lm-evaluation-harness; your Neo Norma environments; SWE-bench Verified and tau-bench write-ups",
    "chapter": "W32 Deterministic graders and evaluating RL environments",
    "prompt": "How do you build a reliable deterministic grader for math answers?",
    "answer": "1. Require a fixed final-answer format (for example a boxed answer or a final line 'Answer: ...').\n2. Extract robustly: take the last match, handle missing format as wrong.\n3. Normalize: strip spaces and units, unify fractions and decimals, handle LaTeX.\n4. Check equivalence symbolically (sympy simplify of the difference) or numerically with a tolerance, not string equality.\n5. Validate the grader: hand-label a few hundred responses and measure false positives and false negatives.\nA 3% grader error rate is a 3-point ceiling and noise in every comparison, and in RL it is a reward the policy can exploit.",
    "pattern": "Fix the format, extract, normalize, check equivalence, then measure grader error."
  },
  {
    "id": "llm-ev-14",
    "deck": "P6 Evals and graders (W31-32)",
    "source": "Plan reading: lm-evaluation-harness; your Neo Norma environments; SWE-bench Verified and tau-bench write-ups",
    "chapter": "W32 Deterministic graders and evaluating RL environments",
    "prompt": "Design a test-based grader for a coding task that holds up under RL pressure.",
    "answer": "1. Run in a fresh sandboxed container with no network, CPU and memory limits, and a wall-clock timeout.\n2. Use hidden tests the model never sees, plus property-based or randomized tests so special-casing fails.\n3. Restore or checksum test files and the grading harness before grading; grade from a separate process the agent cannot touch.\n4. Treat timeouts, crashes, and missing outputs as failures, not passes.\n5. Check both directions: the reference solution passes, and trivial solutions (empty patch, hard-coded outputs) fail.\n6. Log full traces so you can audit passes.",
    "pattern": "Sandbox, hidden and randomized tests, tamper checks, fail-closed, oracle and null checks."
  },
  {
    "id": "llm-ev-15",
    "deck": "P6 Evals and graders (W31-32)",
    "source": "Plan reading: lm-evaluation-harness; your Neo Norma environments; SWE-bench Verified and tau-bench write-ups",
    "chapter": "W32 Deterministic graders and evaluating RL environments",
    "prompt": "Why grade the final environment state rather than the transcript?",
    "answer": "The transcript says what the agent claims; the state says what actually happened. Agents routinely claim success ('I have updated the record') when the tool call failed or did something else.\nState-based grading checks the database rows, files, git diff, or test results after the episode. It is deterministic, cheap, and hard to talk your way past. Use transcript checks only for things state cannot capture, like whether the agent asked for confirmation before an irreversible action.",
    "pattern": "Grade the world, not the agent's description of it."
  },
  {
    "id": "llm-ev-16",
    "deck": "P6 Evals and graders (W31-32)",
    "source": "Plan reading: lm-evaluation-harness; your Neo Norma environments; SWE-bench Verified and tau-bench write-ups",
    "chapter": "W32 Deterministic graders and evaluating RL environments",
    "prompt": "How do you measure whether a grader is good enough to use as an RL reward?",
    "answer": "Build a labeled set of real policy outputs (including borderline and adversarial ones), and compute precision and recall of the grader against careful human labels.\nFalse positives matter most for RL: the policy will find and amplify them. False negatives slow learning and bias the policy away from valid but unusual solutions.\nRe-audit as training goes on: sample passes from late checkpoints, because the outputs drift and new exploits appear that your original labeled set did not include.",
    "pattern": "Measure grader precision on policy outputs. False positives get amplified."
  },
  {
    "id": "llm-ev-17",
    "deck": "P6 Evals and graders (W31-32)",
    "source": "Plan reading: lm-evaluation-harness; your Neo Norma environments; SWE-bench Verified and tau-bench write-ups",
    "chapter": "W32 Deterministic graders and evaluating RL environments",
    "prompt": "What do SWE-bench, SWE-bench Verified, tau-bench, and Terminal-Bench each measure?",
    "answer": "SWE-bench (Jimenez et al.): real GitHub issues from Python repos; the agent writes a patch, graded by the repo's tests that the real fix made pass.\nSWE-bench Verified: a 500-task subset checked by human engineers to remove underspecified issues and broken tests.\ntau-bench (Sierra): tool-using customer-service agents talking to an LLM-simulated user under domain policies (retail, airline), graded by the final database state, with pass^k for reliability.\nTerminal-Bench: tasks completed in a real terminal (build, configure, debug), graded by checks on the resulting system state.",
    "pattern": "SWE-bench = patches vs tests. tau-bench = policy-following with a simulated user. Terminal-Bench = shell tasks."
  },
  {
    "id": "llm-ev-18",
    "deck": "P6 Evals and graders (W31-32)",
    "source": "Plan reading: lm-evaluation-harness; your Neo Norma environments; SWE-bench Verified and tau-bench write-ups",
    "chapter": "W32 Deterministic graders and evaluating RL environments",
    "prompt": "Why can the same model get very different scores on an agentic benchmark, and what should every agentic result report?",
    "answer": "The score belongs to model plus scaffold: the tool set, system prompt, context management, retry logic, turn and token budget, and whether you take the best of several attempts all matter, often by more than a model generation.\nEnvironment issues too: flaky tests, network access, container differences.\nReport: scaffold and tools, budgets, number of attempts and how the final one is selected, environment version, and cost per task. Compare models only within the same scaffold.",
    "pattern": "Agent score = model + scaffold + budget. Report all three."
  },
  {
    "id": "llm-ev-19",
    "deck": "P6 Evals and graders (W31-32)",
    "source": "Plan reading: lm-evaluation-harness; your Neo Norma environments; SWE-bench Verified and tau-bench write-ups",
    "chapter": "W32 Deterministic graders and evaluating RL environments",
    "prompt": "How do you handle nondeterminism and flakiness in agentic evals?",
    "answer": "Run each task several times and report the mean with a confidence interval, plus pass^k if reliability matters.\nMeasure environment flakiness directly: run the reference solution many times; any task where the oracle does not pass every time is broken and should be fixed or dropped.\nPin container images, dependency versions, and tool versions; mock time and external services; disable network unless the task needs it.",
    "pattern": "Repeat runs, test the oracle for flakiness, pin everything."
  },
  {
    "id": "llm-ev-26",
    "deck": "P6 Evals and graders (W31-32)",
    "source": "Plan reading: lm-evaluation-harness; your Neo Norma environments; SWE-bench Verified and tau-bench write-ups",
    "chapter": "W32 Deterministic graders and evaluating RL environments",
    "prompt": "How do you split training and evaluation for RL environments so that the eval measures generalization?",
    "answer": "Split by task family or source, not by random instance. If training tasks come from repo A, evaluate on repos the policy has never seen, not on other issues from repo A. Same for tool schemas, websites, or customer-service domains.\nAlso keep an external benchmark the training team does not optimize against, and check that gains there track gains on your in-distribution eval. If only the in-distribution number moves, you are fitting your environment, not building a skill.",
    "pattern": "Hold out whole families. Watch an external eval you never train on."
  },
  {
    "id": "llm-p6-03",
    "deck": "P6 Evals and graders (W31-32)",
    "source": "Plan reading: lm-evaluation-harness; your Neo Norma environments; SWE-bench Verified and tau-bench write-ups",
    "chapter": "W32 Deterministic graders and evaluating RL environments",
    "prompt": "How do you design a research-skill eval (for example 'can the model reproduce a paper's result?') with a deterministic grader?",
    "answer": "1. Pick tasks whose outcome is a number or artifact you can check: reproduce a table entry within tolerance, fix a broken training script so a test passes, find the bug that explains a known wrong figure.\n2. Freeze the environment: container image with data, code and dependencies; fixed seeds; resource limits; a time budget.\n3. Define the grader on outputs, not reasoning: e.g. reported metric within plus or minus x of the reference (and x set from the reference's own seed variance); a hidden test suite; a checksum of a produced file.\n4. Validate the grader: a reference solution scores 1, a do-nothing or trivially wrong solution scores 0, plausible cheats (copying the reference number, editing the test) score 0.\n5. Calibrate difficulty: run a few models; drop tasks no model can ever pass for setup reasons and tasks everyone trivially passes.\n6. Split: keep a held-out set of papers or repos for evaluation, never used for training environments.\n7. Report pass rates with intervals and the scaffold used, and publish failure categories.",
    "pattern": "Checkable outputs, frozen containers, graders on results with tolerances from seed variance, validated against reference and cheats."
  },
  {
    "id": "llm-ev-29",
    "deck": "P6 Evals and graders (W31-32)",
    "source": "Plan reading: lm-evaluation-harness; your Neo Norma environments; SWE-bench Verified and tau-bench write-ups",
    "chapter": "W32 Deterministic graders and evaluating RL environments",
    "prompt": "You are asked to design an eval or RL environment for skill X. What structure should the design follow?",
    "answer": "1. Define the skill and what success looks like in the real world.\n2. Task source: where tasks come from, how many, difficulty spread, contamination plan.\n3. Interface: tools, observations, budgets.\n4. Grader: deterministic if at all possible; how you validate it (oracle, null, exploit probes, human agreement).\n5. Metrics: pass@1 with CIs, pass^k for reliability, cost.\n6. Failure analysis plan: how you will read trajectories and categorize errors.\n7. For RL: target pass-rate band, reward hacks you expect and how the environment blocks them, train/eval split.\nGround every section in a concrete example from your own environments.",
    "pattern": "Skill, tasks, interface, validated grader, metrics with CIs, hacks, splits."
  },
  {
    "id": "llm-p6-build-02",
    "deck": "P6 Evals and graders (W31-32)",
    "source": "Plan reading: lm-evaluation-harness; your Neo Norma environments; SWE-bench Verified and tau-bench write-ups",
    "chapter": "W32 Deterministic graders and evaluating RL environments",
    "prompt": "Build this (W32): Deterministic graders and a research-eval prototype",
    "answer": "Spec: A small research-eval (the Neo Norma direction): 10 to 20 tasks where an agent must reproduce or fix an ML result, each with a deterministic grader, packaged so anyone can run it.\n\nSteps:\n1. Pick small, cheap results (CPU or one GPU, minutes each): a known training curve value, a scaling-fit exponent, a kernel's output.\n2. Build the container and grader per task; write a reference solution and 2 cheats per task.\n3. Verify: reference passes, cheats fail, nondeterminism is within tolerance across 5 reruns.\n4. Run 2 or 3 agent setups; report pass rates with intervals and categorize failures.\n\nSuccess looks like: Every task has a passing reference, failing cheats and a stable grader; results are reproducible from one command; the failure analysis says something specific about what agents cannot yet do.",
    "pattern": "Build this: Deterministic graders and a research-eval prototype"
  }
];
