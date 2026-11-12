import type { Question } from "../lib/types";

export const LLM_P5_POST_TRAINING: Question[] = [
  {
    "id": "llm-po-05",
    "deck": "P5 Post-training (W27-30)",
    "source": "Plan reading: Ouyang et al. 2022, InstructGPT (arXiv 2203.02155); Hugging Face TRL documentation",
    "chapter": "W27 InstructGPT, SFT and TRL",
    "prompt": "Describe the InstructGPT three-step RLHF pipeline.",
    "answer": "1. SFT on human-written demonstrations.\n2. Reward model: humans rank several responses per prompt; train a model (the SFT model with a scalar head) to score responses so preferred ones score higher.\n3. RL: optimize the policy with PPO to maximize reward minus a KL penalty to the SFT model.\nResult (Ouyang et al., 'Training language models to follow instructions with human feedback'): labelers preferred the 1.3B InstructGPT model over the 175B GPT-3.",
    "pattern": "SFT, then reward model from comparisons, then PPO with a KL leash.",
    "answerImage": "/llm/post-training/post-training.png"
  },
  {
    "id": "llm-p5-01",
    "deck": "P5 Post-training (W27-30)",
    "source": "Plan reading: Ouyang et al. 2022, InstructGPT (arXiv 2203.02155); Hugging Face TRL documentation",
    "chapter": "W27 InstructGPT, SFT and TRL",
    "prompt": "What are the details of InstructGPT worth remembering beyond the three-step pipeline?",
    "answer": "Data: prompts mostly from the OpenAI API plus labeler-written prompts. Roughly 13k prompts for SFT, 33k for reward model training and 31k for PPO.\nLabelers: about 40 contractors, screened for agreement on sensitive content. For the reward model they ranked K = 4 to 9 outputs per prompt, giving up to K choose 2 comparisons per prompt, all from one prompt kept in the same batch to avoid overfitting.\nReward model: 6B, initialized from the SFT model, trained with the pairwise (Bradley-Terry) loss.\nPPO-ptx: mixing pretraining gradients into PPO reduced the regressions on public NLP benchmarks (the alignment tax) without hurting labeler preference much.\nHeadline: outputs from the 1.3B InstructGPT model were preferred to those from the 175B GPT-3 by labelers.\nCaveats the paper itself states: aligned to the labelers and the instructions they were given, not to people in general.",
    "pattern": "13k SFT, 33k RM, 31k PPO prompts; K = 4 to 9 rankings; 6B RM; PPO-ptx limits the alignment tax; 1.3B beat 175B."
  },
  {
    "id": "llm-po-01",
    "deck": "P5 Post-training (W27-30)",
    "source": "Plan reading: Ouyang et al. 2022, InstructGPT (arXiv 2203.02155); Hugging Face TRL documentation",
    "chapter": "W27 InstructGPT, SFT and TRL",
    "prompt": "What is supervised fine-tuning (SFT) for a chat model, and how is the loss masked?",
    "answer": "Fine-tune the pretrained model on (prompt, ideal response) conversations formatted with a chat template (special tokens marking system, user, assistant turns).\nSame next-token cross-entropy as pretraining, but usually only on assistant tokens: prompt and user tokens get label -100 (ignored), so the model learns to respond, not to imitate users.\nTypical scale: tens of thousands to a few million examples, 1 to 3 epochs, LR around 1e-5 for full fine-tuning. Quality and diversity of the data matter more than volume.",
    "pattern": "SFT = next-token loss on assistant tokens only, with a fixed chat template."
  },
  {
    "id": "llm-po-02",
    "deck": "P5 Post-training (W27-30)",
    "source": "Plan reading: Ouyang et al. 2022, InstructGPT (arXiv 2203.02155); Hugging Face TRL documentation",
    "chapter": "W27 InstructGPT, SFT and TRL",
    "prompt": "Why does a mismatched chat template at inference time hurt a fine-tuned model so much?",
    "answer": "The model learned that a response starts after an exact token sequence (for example a role header plus newline) and ends with a specific end-of-turn token. If inference formats the prompt differently, the model is off-distribution: it may continue the user turn, never emit the stop token, or lose instruction following.\nAlways use the tokenizer's own chat template (apply_chat_template) for both training and serving, and check that BOS is not added twice.",
    "pattern": "Train and serve with the exact same chat template and stop token."
  },
  {
    "id": "llm-ip-10",
    "deck": "P5 Post-training (W27-30)",
    "source": "Plan reading: Ouyang et al. 2022, InstructGPT (arXiv 2203.02155); Hugging Face TRL documentation",
    "chapter": "W27 InstructGPT, SFT and TRL",
    "prompt": "Your SFT model answers well but never stops generating; it keeps writing new user turns. Why?",
    "answer": "It never learned to emit the end-of-turn or EOS token. Common causes: the EOS token was masked out of the loss along with the prompt, the chat template did not append it to assistant turns, the pad token was set equal to EOS and all EOS labels got ignored, or the server's stop tokens do not match the template.\nFix the template and labels so the assistant's end-of-turn token is a supervised target, and configure the same stop token in serving.",
    "pattern": "No stop = EOS never supervised. Check pad vs EOS and the label mask."
  },
  {
    "id": "llm-p5-02",
    "deck": "P5 Post-training (W27-30)",
    "source": "Plan reading: Ouyang et al. 2022, InstructGPT (arXiv 2203.02155); Hugging Face TRL documentation",
    "chapter": "W27 InstructGPT, SFT and TRL",
    "prompt": "How does TRL's SFTTrainer handle data, and what settings matter for a first SFT run?",
    "answer": "Dataset formats: plain text, prompt plus completion, or conversational (a list of messages with roles). For conversational data the tokenizer's chat template is applied for you; for prompt-completion data the loss can be restricted to completion tokens.\nSettings that matter:\n- loss masking: train only on assistant or completion tokens (check the current option names in the docs; they have changed across versions)\n- packing: concatenate examples to fill the context; faster, but make sure attention does not leak across examples if you care\n- max sequence length, learning rate (typically around 1e-5 to 2e-5 for full fine-tuning of small models, higher for LoRA), epochs (1 to 3), warmup and decay\n- the same chat template at training and inference, including the EOS token\n- PEFT config for LoRA if memory is tight\nAlways inspect a few tokenized, masked examples by decoding them back to text before training; most SFT bugs are visible there.",
    "pattern": "Prompt-completion or messages; chat template applied; mask to assistant tokens; check packing, LR, epochs; decode samples first."
  },
  {
    "id": "llm-po-03",
    "deck": "P5 Post-training (W27-30)",
    "source": "Plan reading: Ouyang et al. 2022, InstructGPT (arXiv 2203.02155); Hugging Face TRL documentation",
    "chapter": "W27 InstructGPT, SFT and TRL",
    "prompt": "What is rejection sampling fine-tuning (best-of-n, expert iteration), and why is it useful?",
    "answer": "Sample several responses per prompt from the current model, score them (reward model, unit tests, answer checker), keep the best, and SFT on those. Repeat.\nIt is simple, stable, and uses ordinary SFT infrastructure. It is a weak form of RL: you only learn from successes. STaR applied this to reasoning traces, and Llama 2 and Llama 3 post-training used rejection sampling rounds.",
    "pattern": "Sample many, keep the best, SFT on them, repeat."
  },
  {
    "id": "llm-po-25",
    "deck": "P5 Post-training (W27-30)",
    "source": "Plan reading: Ouyang et al. 2022, InstructGPT (arXiv 2203.02155); Hugging Face TRL documentation",
    "chapter": "W27 InstructGPT, SFT and TRL",
    "prompt": "How does LoRA work, and how many parameters does it train for r=16 on W_q and W_v of a 32-layer d=4096 model?",
    "answer": "Freeze W (d x k) and learn an update B A with A of shape r x k and B of shape d x r, r much smaller than d. Output: W x + (alpha / r) * B A x. B starts at zero so training starts exactly from the base model. After training you can merge B A into W, so there is no inference overhead.\nCount: each 4096 x 4096 matrix gets r(d + k) = 16 * 8192 = 131,072 params. Two matrices times 32 layers: 8.39M, about 0.12% of a 6.74B model.\nPaper: Hu et al., 'LoRA: Low-Rank Adaptation of Large Language Models'.",
    "pattern": "LoRA trains r(d+k) params per matrix, B init 0, mergeable after."
  },
  {
    "id": "llm-ip-08",
    "deck": "P5 Post-training (W27-30)",
    "source": "Plan reading: Ouyang et al. 2022, InstructGPT (arXiv 2203.02155); Hugging Face TRL documentation",
    "chapter": "W27 InstructGPT, SFT and TRL",
    "prompt": "Implement a LoRA wrapper around an nn.Linear.",
    "answer": "class LoRALinear(nn.Module):\n    def __init__(self, base: nn.Linear, r=16, alpha=32):\n        super().__init__()\n        self.base = base\n        for p in self.base.parameters():\n            p.requires_grad = False\n        self.A = nn.Parameter(torch.randn(r, base.in_features) * 0.01)\n        self.B = nn.Parameter(torch.zeros(base.out_features, r))\n        self.scale = alpha / r\n    def forward(self, x):\n        return self.base(x) + (x @ self.A.T @ self.B.T) * self.scale\nB starts at zero, so the wrapped layer initially equals the base. Merge for inference: W += scale * B @ A.",
    "pattern": "Frozen base + scale * x A^T B^T, with B = 0 at init."
  },
  {
    "id": "llm-po-26",
    "deck": "P5 Post-training (W27-30)",
    "source": "Plan reading: Ouyang et al. 2022, InstructGPT (arXiv 2203.02155); Hugging Face TRL documentation",
    "chapter": "W27 InstructGPT, SFT and TRL",
    "prompt": "What is QLoRA, and what are the limits of LoRA-style fine-tuning?",
    "answer": "QLoRA (Dettmers et al.): keep the frozen base model in 4-bit NF4 and train LoRA adapters in bf16 on top. A 7B base takes about 3.5 GB for weights, so fine-tuning fits on one consumer GPU.\nLimits: LoRA is great for style, format, and narrow tasks, but tends to learn less and forget less than full fine-tuning on big knowledge or capability shifts. Results depend on rank, which matrices you adapt (all linear layers usually beats attention only), and LR (LoRA wants higher LR than full fine-tuning).",
    "pattern": "QLoRA = 4-bit frozen base + LoRA. LoRA learns less, forgets less."
  },
  {
    "id": "llm-po-27",
    "deck": "P5 Post-training (W27-30)",
    "source": "Plan reading: Ouyang et al. 2022, InstructGPT (arXiv 2203.02155); Hugging Face TRL documentation",
    "chapter": "W27 InstructGPT, SFT and TRL",
    "prompt": "What is catastrophic forgetting (the 'alignment tax'), and how do teams limit it during post-training?",
    "answer": "Fine-tuning on a narrow distribution can degrade other skills the base model had, like knowledge or coding, because the weights move to fit the new data.\nLimit it: mix some pretraining-style or general data into fine-tuning (InstructGPT's PPO-ptx mixed in pretraining gradients), keep a KL penalty in RL, use lower LR and fewer epochs, use LoRA, and run a broad regression eval suite after every stage.",
    "pattern": "Narrow tuning erodes old skills. Mix general data and run regression evals."
  },
  {
    "id": "llm-p5-build-01",
    "deck": "P5 Post-training (W27-30)",
    "source": "Plan reading: Ouyang et al. 2022, InstructGPT (arXiv 2203.02155); Hugging Face TRL documentation",
    "chapter": "W27 InstructGPT, SFT and TRL",
    "prompt": "Build this (W27): SFT run with eval deltas",
    "answer": "Spec: Supervised fine-tune a small open base model (around 0.5B to 1.5B) on an instruction dataset with TRL, and measure exactly what changed.\n\nSteps:\n1. Evaluate the base model first: a few lm-evaluation-harness tasks (e.g. GSM8K, ARC, IFEval-style instruction following) plus 30 fixed chat prompts.\n2. SFT with assistant-only loss; decode and inspect masked examples before launching.\n3. Re-run the same evals with the same settings; compute deltas with confidence intervals.\n4. Ablate one thing: full fine-tune vs LoRA, or 1 vs 3 epochs.\n\nSuccess looks like: A before/after table with intervals, examples of improved and regressed behavior, and a note on which benchmarks moved because of format rather than ability.",
    "pattern": "Build this: SFT run with eval deltas"
  },
  {
    "id": "llm-po-11",
    "deck": "P5 Post-training (W27-30)",
    "source": "Plan reading: Rafailov et al. 2023, Direct Preference Optimization (arXiv 2305.18290)",
    "chapter": "W28 DPO",
    "prompt": "What is the key idea in Direct Preference Optimization (DPO)?",
    "answer": "For the KL-regularized RLHF objective, the optimal policy has a closed form: pi*(y|x) is proportional to pi_ref(y|x) * exp(r(x, y) / beta). Rearranged, the reward is r = beta * log(pi*/pi_ref) + beta * log Z(x).\nPlug that into the Bradley-Terry preference model; Z(x) cancels because both responses share the prompt. You get a classification loss directly on the policy, with no reward model and no RL loop.\nPaper: Rafailov et al., 'Direct Preference Optimization: Your Language Model is Secretly a Reward Model'.",
    "pattern": "DPO: the policy's log-ratio to the reference is the implicit reward.",
    "answerImage": "/llm/post-training/post-training.png"
  },
  {
    "id": "llm-po-12",
    "deck": "P5 Post-training (W27-30)",
    "source": "Plan reading: Rafailov et al. 2023, Direct Preference Optimization (arXiv 2305.18290)",
    "chapter": "W28 DPO",
    "prompt": "Write the DPO loss and compute it for beta = 0.1, chosen log-ratio +2.0, rejected log-ratio -1.0.",
    "answer": "L = -log sigmoid( beta * [ (log pi(y_w) - log pi_ref(y_w)) - (log pi(y_l) - log pi_ref(y_l)) ] )\nMargin inside: 0.1 * (2.0 - (-1.0)) = 0.3.\nsigmoid(0.3) = 0.574, loss = -ln(0.574) = 0.554.\nAt the start (policy = reference) the margin is 0 and loss = ln 2 = 0.693.",
    "pattern": "DPO loss starts at ln 2 = 0.693 and drops as the log-ratio margin grows."
  },
  {
    "id": "llm-po-13",
    "deck": "P5 Post-training (W27-30)",
    "source": "Plan reading: Rafailov et al. 2023, Direct Preference Optimization (arXiv 2305.18290)",
    "chapter": "W28 DPO",
    "prompt": "What are known failure modes of DPO, and name a few variants that address them.",
    "answer": "1. Both chosen and rejected likelihoods can go down together; only the margin grows, and the model can drift to odd outputs.\n2. Length exploitation: longer chosen answers lead to verbosity.\n3. Offline data: preferences were collected on another model's outputs, so the signal goes stale as the policy changes.\n4. Overfitting on small preference sets (beta too low).\nVariants: IPO (bounded objective against overfitting), KTO (works from thumbs up/down labels, no pairs), SimPO (length-normalized, no reference model), and online or iterative DPO (re-sample from the current policy and re-label each round). Many labs still use online RL for the final stages.",
    "pattern": "DPO is offline and can exploit length. Go online or iterative to fix staleness."
  },
  {
    "id": "llm-ip-12",
    "deck": "P5 Post-training (W27-30)",
    "source": "Plan reading: Rafailov et al. 2023, Direct Preference Optimization (arXiv 2305.18290)",
    "chapter": "W28 DPO",
    "prompt": "During DPO training the reward margin goes up but both chosen and rejected log-probs go down, and generations get weird. Explain and fix.",
    "answer": "DPO only optimizes the margin between chosen and rejected. The easiest way is often to push the rejected likelihood down fast while the chosen one also falls, moving probability mass to other text that neither response covers, so outputs drift off-distribution.\nFixes: raise beta (stay closer to reference), lower LR or train fewer steps, add an SFT (NLL) term on the chosen responses, use on-policy or fresher pairs, or switch to a variant designed for this. Watch chosen log-probs as a health metric, not just the margin.",
    "pattern": "Margin up but chosen likelihood down = DPO drift. Higher beta, add SFT loss."
  },
  {
    "id": "llm-po-14",
    "deck": "P5 Post-training (W27-30)",
    "source": "Plan reading: Rafailov et al. 2023, Direct Preference Optimization (arXiv 2305.18290)",
    "chapter": "W28 DPO",
    "prompt": "DPO vs PPO-style online RL: when would you pick each?",
    "answer": "DPO: simple, cheap, stable, just a loss on a fixed preference dataset. Good for style, tone, and safety preferences where you already have pairs.\nOnline RL (PPO, GRPO): samples from the current policy and gets fresh rewards, so it can keep improving and explore. Better for verifiable tasks (math, code, agents) and for pushing capability. More infrastructure and more ways to go wrong.\nCommon practice: SFT, then DPO-style preference tuning, then online RL for reasoning and agentic skills. Exact recipes differ by lab.",
    "pattern": "DPO for cheap preference shaping, online RL to push capabilities.",
    "answerImage": "/llm/post-training/post-training.png"
  },
  {
    "id": "llm-p5-build-02",
    "deck": "P5 Post-training (W27-30)",
    "source": "Plan reading: Rafailov et al. 2023, Direct Preference Optimization (arXiv 2305.18290)",
    "chapter": "W28 DPO",
    "prompt": "Build this (W28): DPO vs SFT comparison",
    "answer": "Spec: Starting from your W27 SFT model, compare continued SFT on chosen responses vs DPO on the same preference pairs.\n\nSteps:\n1. Pick a preference dataset (e.g. UltraFeedback-style pairs); hold out a test split.\n2. Arm A: SFT on the chosen responses only. Arm B: DPO with beta in {0.05, 0.1, 0.3}. Same data, similar compute.\n3. Log during DPO: reward margins, accuracies, and chosen and rejected log-probs separately.\n4. Evaluate with a pairwise judge on held-out prompts (with position swapping) plus your W27 benchmarks for regressions; measure response length.\n\nSuccess looks like: A table showing win rates with intervals, length changes, and benchmark regressions per arm, plus plots of chosen vs rejected log-probs showing whether both fell.",
    "pattern": "Build this: DPO vs SFT comparison"
  },
  {
    "id": "llm-p5-03",
    "deck": "P5 Post-training (W27-30)",
    "source": "Plan reading: Shao et al. 2024, DeepSeekMath (arXiv 2402.03300)",
    "chapter": "W29 DeepSeekMath and GRPO",
    "prompt": "What did the DeepSeekMath paper contribute besides GRPO?",
    "answer": "Data: the DeepSeekMath Corpus, about 120B math tokens mined from Common Crawl with an iterative pipeline (a fastText classifier seeded with OpenWebMath, then expanded by recalling more pages from math-heavy domains, repeated over several rounds).\nModel: DeepSeekMath 7B, continued pretraining from a code model, then math SFT and RL.\nFinding: carefully selected web data can produce strong math ability; they also found that code pretraining helps math reasoning.\nGRPO: a PPO variant without a value model, using group-relative advantages from several samples per prompt. It cuts memory and works well with outcome rewards.\nA unified view: the paper frames SFT, rejection sampling fine-tuning, DPO, PPO and GRPO as one gradient form differing in data source, reward function and gradient coefficient, and it discusses why RL mainly improved maj@K rather than pass@K (sharpening the distribution).",
    "pattern": "120B-token math corpus mined from Common Crawl, a 7B model, GRPO (no critic, group baseline), and a unified view of SFT/RFT/DPO/PPO."
  },
  {
    "id": "llm-po-16",
    "deck": "P5 Post-training (W27-30)",
    "source": "Plan reading: Shao et al. 2024, DeepSeekMath (arXiv 2402.03300)",
    "chapter": "W29 DeepSeekMath and GRPO",
    "prompt": "How does GRPO compute advantages? Compute them for a group of 4 samples with rewards [1, 0, 0, 1].",
    "answer": "GRPO (Group Relative Policy Optimization, from DeepSeekMath): sample G responses per prompt, score them, and use the group as the baseline instead of a learned critic.\nA_i = (r_i - mean(r)) / std(r), applied to every token of response i.\nRewards [1, 0, 0, 1]: mean 0.5, std 0.5, so A = [+1, -1, -1, +1].\nThen a PPO-style clipped objective with these advantages, plus (optionally) a KL penalty to the reference. No value model means much less memory.",
    "pattern": "GRPO advantage = reward z-scored within the group. No critic.",
    "answerImage": "/llm/post-training/post-training.png"
  },
  {
    "id": "llm-p5-build-03",
    "deck": "P5 Post-training (W27-30)",
    "source": "Plan reading: Shao et al. 2024, DeepSeekMath (arXiv 2402.03300)",
    "chapter": "W29 DeepSeekMath and GRPO",
    "prompt": "Build this (W29): GRPO on math with verifiable rewards",
    "answer": "Spec: Run GRPO on a small instruct model (0.5B to 1.5B) on GSM8K-style math with a deterministic answer checker, and make the reward curve mean something.\n\nSteps:\n1. Write the grader: extract the final answer, normalize, compare; unit-test it on 50 hand-checked cases including adversarial formats.\n2. Baseline: pass@1 and pass@8 on a held-out test set at fixed sampling settings.\n3. Train with TRL's GRPOTrainer (or your own loop): group size 8, a small format reward, the correctness reward; log reward mean and std, the fraction of groups with all-same reward, response length, entropy, KL to the reference.\n4. Evaluate checkpoints on the held-out set; read 20 rollouts at the start, middle and end.\n\nSuccess looks like: Held-out accuracy goes up beyond seed noise, the logs show no grader exploits (you checked transcripts), and you can explain the length and entropy curves.",
    "pattern": "Build this: GRPO on math with verifiable rewards"
  },
  {
    "id": "llm-p5-04",
    "deck": "P5 Post-training (W27-30)",
    "source": "Plan reading: DeepSeek-AI 2025, DeepSeek-R1 (arXiv 2501.12948)",
    "chapter": "W30 DeepSeek-R1 and reasoning RL",
    "prompt": "What is DeepSeek-R1-Zero, and what did it show?",
    "answer": "R1-Zero: pure RL from the DeepSeek-V3 base model, with no SFT first. Algorithm: GRPO. Rewards: rule-based only, an accuracy reward (verifiable math answers, code passing tests) and a format reward (put reasoning inside think tags). No neural reward model, to avoid reward hacking at scale.\nFindings:\n- accuracy on reasoning benchmarks rose steeply during RL (e.g. AIME 2024 pass@1 rose from about 16% to about 71% in the paper's report)\n- response length grew on its own: the model learned to spend more tokens thinking\n- behaviors like re-evaluating and backtracking emerged, including the paper's \"aha moment\" example\nProblems: poor readability and language mixing in the reasoning, which motivated the full R1 pipeline.\nSignificance: showed that outcome-reward RL alone, at scale, can produce long chain-of-thought reasoning.",
    "pattern": "GRPO from the base model with only rule-based accuracy and format rewards: long reasoning emerged; readability suffered."
  },
  {
    "id": "llm-p5-05",
    "deck": "P5 Post-training (W27-30)",
    "source": "Plan reading: DeepSeek-AI 2025, DeepSeek-R1 (arXiv 2501.12948)",
    "chapter": "W30 DeepSeek-R1 and reasoning RL",
    "prompt": "Describe the DeepSeek-R1 training pipeline.",
    "answer": "1. Cold start: SFT the base model on a few thousand long chain-of-thought examples with a readable format, to fix R1-Zero's readability problems and give RL a better starting point.\n2. Reasoning-oriented RL: GRPO with rule-based rewards on math, code, science and logic, plus a language consistency reward (fraction of target-language words) to reduce language mixing.\n3. Rejection sampling and SFT: sample from the RL checkpoint, keep correct and readable reasoning traces (about 600k), add about 200k non-reasoning samples (writing, QA, and so on), and fine-tune the base model again on about 800k samples.\n4. RL for all scenarios: a second RL stage combining rule-based rewards for reasoning with reward models for helpfulness and harmlessness on general data.\nDistillation: fine-tuning smaller Qwen and Llama models on the R1 generated data gave strong small reasoners, better than running RL directly on those small models in the paper's comparison.",
    "pattern": "Cold-start SFT, reasoning RL with language consistency, rejection sampling to ~800k SFT samples, then RL for all scenarios. Distill to small models."
  },
  {
    "id": "llm-po-04",
    "deck": "P5 Post-training (W27-30)",
    "source": "Plan reading: DeepSeek-AI 2025, DeepSeek-R1 (arXiv 2501.12948)",
    "chapter": "W30 DeepSeek-R1 and reasoning RL",
    "prompt": "What is distillation in post-training, and what did DeepSeek-R1 show about it?",
    "answer": "Train a smaller student on outputs (or full token distributions) from a stronger teacher. With only sampled outputs it is just SFT on teacher data; with logits you can match the full distribution with a KL loss.\nDeepSeek-R1 distilled its reasoning traces into smaller Qwen and Llama models with plain SFT, and those students beat the same small models trained with RL directly. For small models, distilling from a strong reasoner is often cheaper and better than RL from scratch.",
    "pattern": "Small model? Distill a strong teacher before trying RL."
  },
  {
    "id": "llm-po-20",
    "deck": "P5 Post-training (W27-30)",
    "source": "Plan reading: DeepSeek-AI 2025, DeepSeek-R1 (arXiv 2501.12948)",
    "chapter": "W30 DeepSeek-R1 and reasoning RL",
    "prompt": "Does RL teach the model new abilities or just sharpen what the base model could already do? What does pass@k tell you here?",
    "answer": "Contested. Several 2025 studies found RL-tuned models win at pass@1 but the base model catches up or wins at large k (for example pass@256), which suggests RL mostly reweights solutions the base model could already sample. Others argue that longer, larger-scale RL does expand what the model can solve.\nPractical takeaway: report pass@k curves, not just pass@1, and watch for entropy collapse narrowing the policy.",
    "pattern": "Plot pass@k across k. RL may sharpen more than it expands."
  },
  {
    "id": "llm-p5-build-04",
    "deck": "P5 Post-training (W27-30)",
    "source": "Plan reading: DeepSeek-AI 2025, DeepSeek-R1 (arXiv 2501.12948)",
    "chapter": "W30 DeepSeek-R1 and reasoning RL",
    "prompt": "Build this (W30): Reasoning RL write-up with reward curves",
    "answer": "Spec: Extend your W29 run into a small reasoning RL study and write it up like a paper section.\n\nSteps:\n1. Pick one question, e.g. \"does a cold-start SFT on 1k long chain-of-thought examples change what GRPO learns?\" or \"how does group size affect sample efficiency?\"\n2. Run the arms with 2 to 3 seeds each; fixed eval set, fixed sampling settings, pass@1 and pass@k.\n3. Plot reward, held-out accuracy, response length and entropy over steps for every arm.\n4. Read and categorize 50 rollouts per arm (correct reasoning, lucky guess, format hack, truncated).\n\nSuccess looks like: Curves with seed bands, a pass@k analysis that says whether RL sharpened or expanded the model, and a qualitative table of rollout categories.",
    "pattern": "Build this: Reasoning RL write-up with reward curves"
  }
];
