import type { Question } from "../lib/types";

export const LLM_P4_PRETRAINING: Question[] = [
  {
    "id": "llm-tf-19",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: Kaplan et al. 2020 (arXiv 2001.08361); Hoffmann et al. 2022, Chinchilla (arXiv 2203.15556)",
    "chapter": "W22 Scaling laws: Kaplan and Chinchilla",
    "prompt": "How many FLOPs per token does a forward pass take, and where does '6N per token for training' come from?",
    "answer": "Each parameter is used in one multiply-add per token in the forward pass: about 2N FLOPs per token (plus attention-score FLOPs that grow with context).\nBackward is about twice the forward (gradients for activations and for weights): about 4N.\nTotal training: about 6N FLOPs per token. Training compute C is about 6 * N * D for D tokens.\nInference (forward only): about 2N per generated token.",
    "pattern": "Forward 2N, backward 4N, training 6N per token. Inference 2N."
  },
  {
    "id": "llm-pt-05",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: Kaplan et al. 2020 (arXiv 2001.08361); Hoffmann et al. 2022, Chinchilla (arXiv 2203.15556)",
    "chapter": "W22 Scaling laws: Kaplan and Chinchilla",
    "prompt": "What did Kaplan et al. (2020) and Chinchilla (Hoffmann et al., 2022) each conclude about how to spend compute?",
    "answer": "Kaplan, 'Scaling Laws for Neural Language Models': loss is a power law in N, D, and C. Under a fixed budget, grow model size much faster than data (roughly N proportional to C^0.73). This led to GPT-3: 175B params on only 300B tokens.\nChinchilla, 'Training Compute-Optimal Large Language Models': with LR schedules matched to each run length, N and D should grow equally (each about C^0.5), about 20 tokens per parameter. Chinchilla 70B on 1.4T tokens beat Gopher 280B on the same compute.\nMain reason for the difference: Kaplan did not retune the cosine schedule length per run, which penalized long runs of small models.",
    "pattern": "Kaplan: mostly bigger model. Chinchilla: scale both, about 20 tokens per param.",
    "answerImage": "/llm/pretraining-scale/scaling-laws.png"
  },
  {
    "id": "llm-pt-06",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: Kaplan et al. 2020 (arXiv 2001.08361); Hoffmann et al. 2022, Chinchilla (arXiv 2203.15556)",
    "chapter": "W22 Scaling laws: Kaplan and Chinchilla",
    "prompt": "Use C = 6ND and the Chinchilla 20 tokens/param rule to find the compute-optimal model for a budget of 1e24 FLOPs.",
    "answer": "D = 20N, so C = 6 * N * 20N = 120 N^2.\nN = sqrt(1e24 / 120) = sqrt(8.33e21) = about 9.1e10, so about 91B params.\nD = 20 * 91B = about 1.8T tokens.\nCheck: 6 * 9.13e10 * 1.83e12 = 1.0e24.",
    "pattern": "Chinchilla-optimal: N = sqrt(C / 120), D = 20N.",
    "answerImage": "/llm/pretraining-scale/scaling-laws.png"
  },
  {
    "id": "llm-pt-07",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: Kaplan et al. 2020 (arXiv 2001.08361); Hoffmann et al. 2022, Chinchilla (arXiv 2203.15556)",
    "chapter": "W22 Scaling laws: Kaplan and Chinchilla",
    "prompt": "Llama 3 8B was trained on about 15T tokens, roughly 1,875 tokens per parameter. Why train so far past Chinchilla-optimal?",
    "answer": "Chinchilla minimizes training compute for a target loss. It ignores inference. A model that will serve billions of requests is cheaper overall if it is smaller and trained much longer: training cost is paid once, inference cost scales with every token served.\nLoss keeps improving (slowly) past 20 tokens/param, so overtraining a small model buys a stronger model at that inference size. This is now standard for deployed models.",
    "pattern": "Chinchilla optimizes training cost. Deployment favors small models trained long."
  },
  {
    "id": "llm-p4-01",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: Kaplan et al. 2020 (arXiv 2001.08361); Hoffmann et al. 2022, Chinchilla (arXiv 2203.15556)",
    "chapter": "W22 Scaling laws: Kaplan and Chinchilla",
    "prompt": "Describe Chinchilla's three approaches to finding the compute-optimal model size, especially the IsoFLOP method.",
    "answer": "Approach 1: train models of many sizes, each with several token budgets; for each compute value take the lowest loss envelope over all training curves and record which N achieved it. Fit N_opt against C.\nApproach 2 (IsoFLOP profiles): pick a handful of fixed compute budgets. For each budget, train a sweep of model sizes with D = C / (6N) tokens so every run costs the same. Plot final loss against log N: it is a U shape. Fit a parabola, take its minimum as N_opt(C). Then fit power laws N_opt proportional to C^a and D_opt proportional to C^b across budgets.\nApproach 3: fit a parametric loss L(N, D) = E + A / N^alpha + B / D^beta to all runs and minimize it under C = 6ND analytically.\nApproaches 1 and 2 gave a and b close to 0.5 (scale parameters and tokens equally), which is where the roughly 20 tokens per parameter rule comes from. Approach 2 is the one you can actually run on a small budget for your own setup.",
    "pattern": "IsoFLOP: fix C, sweep N with D = C / 6N, take the parabola minimum, then fit N_opt and D_opt as power laws in C."
  },
  {
    "id": "llm-p4-02",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: Kaplan et al. 2020 (arXiv 2001.08361); Hoffmann et al. 2022, Chinchilla (arXiv 2203.15556)",
    "chapter": "W22 Scaling laws: Kaplan and Chinchilla",
    "prompt": "Why did Kaplan and Chinchilla disagree, and what are the classic pitfalls when fitting your own scaling law?",
    "answer": "Reasons identified in later work:\n- learning-rate schedule: Kaplan's runs used a schedule not matched to each run's token budget, which penalizes long runs and biases toward bigger models trained on fewer tokens\n- parameter counting: Kaplan used non-embedding parameters and small models, where embeddings are a large fraction; Pearce and Song (2024) argue this explains much of the gap\n- range of scales and other setup details (warmup, batch size)\nPitfalls for your own fits:\n- each run must be tuned for its own horizon (cosine decayed to the end, or WSD with a cooldown)\n- fit in log space, and show the fit with confidence intervals (bootstrap over runs)\n- a few runs span too little range; extrapolating far is fragile\n- even published fits can be off: Besiroglu et al. (2024) re-fitted Chinchilla's Approach 3 from the paper's data and found the original constants inconsistent with Approaches 1 and 2; their refit agrees with roughly 20 tokens per parameter",
    "pattern": "Kaplan: schedule not matched to horizon, non-embedding counts at small scale. Tune each run for its horizon; bootstrap CIs."
  },
  {
    "id": "llm-pt-08",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: Kaplan et al. 2020 (arXiv 2001.08361); Hoffmann et al. 2022, Chinchilla (arXiv 2203.15556)",
    "chapter": "W22 Scaling laws: Kaplan and Chinchilla",
    "prompt": "How do labs actually use scaling laws in practice?",
    "answer": "1. Fit loss vs compute on a ladder of small runs (say 1e18 to 1e21 FLOPs) and extrapolate to pick model size and token count for the big run.\n2. Predict the final loss of the big run, and abort or debug if it drifts off the curve.\n3. Compare architectures or data recipes by their scaling curves, not one point: a trick that helps at small scale may vanish at large scale.\n4. Fit downstream metrics too (harder: task accuracy is less smooth than loss).\nThe GPT-4 technical report described predicting the final loss from runs using up to 10,000x less compute.",
    "pattern": "Fit small runs, extrapolate, then check the big run stays on the curve."
  },
  {
    "id": "llm-pt-09",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: Kaplan et al. 2020 (arXiv 2001.08361); Hoffmann et al. 2022, Chinchilla (arXiv 2203.15556)",
    "chapter": "W22 Scaling laws: Kaplan and Chinchilla",
    "prompt": "Train 70B params on 1.4T tokens. How many FLOPs, and how many days on 1,024 H100s at 40% MFU?",
    "answer": "C = 6 * 70e9 * 1.4e12 = 5.88e23 FLOPs.\nH100 dense bf16 peak is about 989 TFLOP/s; at 40% MFU that is about 396 TFLOP/s per GPU.\nCluster: 1024 * 3.96e14 = 4.05e17 FLOP/s.\nTime: 5.88e23 / 4.05e17 = 1.45e6 s = about 16.8 days.",
    "pattern": "Days = 6ND / (GPUs * peak * MFU) / 86,400."
  },
  {
    "id": "llm-pt-25",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: Kaplan et al. 2020 (arXiv 2001.08361); Hoffmann et al. 2022, Chinchilla (arXiv 2203.15556)",
    "chapter": "W22 Scaling laws: Kaplan and Chinchilla",
    "prompt": "Why do frontier runs keep a ladder of small 'proxy' models running alongside, and what are the traps?",
    "answer": "Changes to data, architecture, or optimizer are too expensive to test at full scale, so you test them on small models and trust scaling laws to carry the result up.\nTraps: some gains disappear or flip at scale; hyperparameters do not transfer unless you use something like muP; small models cannot show emergent skills, so evals at small scale need smooth proxy metrics (loss on targeted data, bits per byte) rather than accuracy cliffs.",
    "pattern": "Ablate small, confirm on a scaling curve, not on one point."
  },
  {
    "id": "llm-fd-25",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: Kaplan et al. 2020 (arXiv 2001.08361); Hoffmann et al. 2022, Chinchilla (arXiv 2203.15556)",
    "chapter": "W22 Scaling laws: Kaplan and Chinchilla",
    "prompt": "What is muP (maximal update parametrization) and why do labs care?",
    "answer": "muP (Yang et al., 'Tensor Programs V') sets per-layer init scales and learning rates as functions of width so that the best hyperparameters stay roughly the same as you scale the model wider.\nPayoff: tune LR and init on a small proxy model and transfer them to the big one, instead of sweeping at full scale. Labs use muP or their own variants; details differ and depth transfer needs extra tricks.",
    "pattern": "muP: tune small, transfer to big. Hyperparameters stay stable with width."
  },
  {
    "id": "llm-ip-16",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: Kaplan et al. 2020 (arXiv 2001.08361); Hoffmann et al. 2022, Chinchilla (arXiv 2203.15556)",
    "chapter": "W22 Scaling laws: Kaplan and Chinchilla",
    "prompt": "How long does it take to train an 8B model on 15T tokens on 1,024 H100s at 40% MFU? About how many GPU-hours is that?",
    "answer": "C = 6 * 8e9 * 15e12 = 7.2e23 FLOPs.\nThroughput: 1024 * 989e12 * 0.4 = 4.05e17 FLOP/s.\nTime: 7.2e23 / 4.05e17 = 1.78e6 s = about 20.6 days.\nGPU-hours: 1024 * 20.6 * 24 = about 506K. At an assumed 2 USD per GPU-hour that is about 1 million USD of compute, before failed runs and ablations, which usually cost more than the final run.",
    "pattern": "Time = 6ND / (GPUs * peak * MFU). Then multiply out GPU-hours."
  },
  {
    "id": "llm-p4-build-01",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: Kaplan et al. 2020 (arXiv 2001.08361); Hoffmann et al. 2022, Chinchilla (arXiv 2203.15556)",
    "chapter": "W22 Scaling laws: Kaplan and Chinchilla",
    "prompt": "Build this (W22): Fit a scaling law on 5 small runs",
    "answer": "Spec: An IsoFLOP-style experiment with your own GPT: at least 5 runs per compute budget at 2 or 3 budgets (or 5 sizes on a fixed tokens-per-parameter ladder if compute is tight), and a fitted law that predicts a held-out run.\n\nSteps:\n1. Choose budgets small enough to finish (e.g. 1e16 to 1e17 FLOPs) and model sizes spanning about 10x.\n2. For each run, set tokens D = C / (6N) and a schedule that decays to the end of that run; same data and tokenizer for all.\n3. Fit the parabola per budget and the power law for N_opt(C); bootstrap over runs for confidence intervals on the exponent.\n4. Use the fit to predict the optimal size and loss at a 3x larger budget; train that run and compare.\n\nSuccess looks like: Exponent with an honest confidence interval, a prediction made before the held-out run, and the held-out loss landing inside the predicted band (or a clear explanation of why it did not).",
    "pattern": "Build this: Fit a scaling law on 5 small runs"
  },
  {
    "id": "llm-pt-10",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: Hugging Face, The Ultra-Scale Playbook; Google DeepMind, How to Scale Your Model",
    "chapter": "W23 Ultra-Scale Playbook: precision and parallelism",
    "prompt": "Compare fp32, fp16, and bf16 formats, and say why bf16 is the default for training.",
    "answer": "fp32: 8 exponent bits, 23 mantissa bits.\nfp16: 5 exponent, 10 mantissa. Max about 65,504, so gradients underflow or activations overflow. Needs loss scaling.\nbf16: 8 exponent, 7 mantissa. Same range as fp32, less precision (relative step 2^-7 = 0.0078 vs 2^-10 = 0.00098 for fp16).\nRange matters more than precision for training, so bf16 needs no loss scaler. Keep master weights, optimizer state, and sensitive reductions (softmax, norms, loss) in fp32.",
    "pattern": "bf16 = fp32 range, low precision, no loss scaling. Master weights in fp32."
  },
  {
    "id": "llm-pt-11",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: Hugging Face, The Ultra-Scale Playbook; Google DeepMind, How to Scale Your Model",
    "chapter": "W23 Ultra-Scale Playbook: precision and parallelism",
    "prompt": "Why keep fp32 master weights if the forward pass runs in bf16?",
    "answer": "An update is lr * step, often around 1e-5 relative to the weight. bf16 can only represent relative changes of about 2^-8 near a value, so small updates round to zero and training stalls (the weight never moves).\nKeep an fp32 copy, apply updates there, and cast to bf16 for the next forward. Mixed precision paper: Micikevicius et al., 'Mixed Precision Training'.",
    "pattern": "Small updates vanish in bf16. Accumulate them in fp32."
  },
  {
    "id": "llm-pt-12",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: Hugging Face, The Ultra-Scale Playbook; Google DeepMind, How to Scale Your Model",
    "chapter": "W23 Ultra-Scale Playbook: precision and parallelism",
    "prompt": "What is FP8 training, and what makes it hard?",
    "answer": "Run the big matmuls in 8-bit floats on Hopper and newer GPUs, about 2x the bf16 throughput. Two formats: E4M3 (more precision, max 448) usually for forward, E5M2 (more range, max 57,344) sometimes for gradients.\nHard part: the tiny range means you need scaling factors per tensor or, better, per block or tile, and outlier activations can overflow. DeepSeek-V3 trained with FP8 using fine-grained block-wise scaling and higher-precision accumulation. Many labs now use FP8 for at least part of training; recipes are still evolving.",
    "pattern": "FP8 doubles matmul throughput but needs fine-grained scaling."
  },
  {
    "id": "llm-fd-19",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: Hugging Face, The Ultra-Scale Playbook; Google DeepMind, How to Scale Your Model",
    "chapter": "W23 Ultra-Scale Playbook: precision and parallelism",
    "prompt": "How much optimizer memory does AdamW need per parameter in typical mixed-precision training?",
    "answer": "Common recipe: bf16 weights (2 bytes) + bf16 grads (2) + fp32 master weights (4) + fp32 m (4) + fp32 v (4) = 16 bytes per parameter, before activations.\nFor a 7B model: 7e9 * 16 = 112 GB. For 70B: 1.12 TB, which is 14 H100s (80 GB) just for states.\nSome setups keep grads in fp32 (18 bytes) or use 8-bit optimizer states to cut this.",
    "pattern": "Mixed-precision AdamW is about 16 bytes/param before activations."
  },
  {
    "id": "llm-ip-15",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: Hugging Face, The Ultra-Scale Playbook; Google DeepMind, How to Scale Your Model",
    "chapter": "W23 Ultra-Scale Playbook: precision and parallelism",
    "prompt": "How much GPU memory does it take to train a 70B model with AdamW in mixed precision, ignoring activations? How many 80 GB GPUs at minimum?",
    "answer": "Weights bf16: 2 bytes * 70e9 = 140 GB.\nGradients bf16: 140 GB.\nfp32 master weights: 280 GB.\nAdam m and v in fp32: 560 GB.\nTotal: 16 bytes/param * 70e9 = 1.12 TB.\nMinimum: 1.12 TB / 80 GB = 14 GPUs, fully sharded (ZeRO-3 or FSDP), before activations, buffers, and fragmentation. In practice you use many more for throughput.",
    "pattern": "16 bytes/param: 70B is 1.12 TB of states, 14 H100s just to hold them."
  },
  {
    "id": "llm-pt-13",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: Hugging Face, The Ultra-Scale Playbook; Google DeepMind, How to Scale Your Model",
    "chapter": "W23 Ultra-Scale Playbook: precision and parallelism",
    "prompt": "Data parallelism: what is replicated, what is communicated, and how much per step?",
    "answer": "Every GPU holds a full copy of the model and optimizer, processes a different slice of the batch, then all-reduces gradients so every replica takes the same step.\nRing all-reduce sends about 2 * (n-1)/n times the gradient size per GPU. For 7B params in bf16 (14 GB of grads) that is about 24.5 GB per GPU per step on 8 GPUs, approaching 28 GB as n grows. Overlap communication with the backward pass by reducing in buckets as gradients become ready.\nLimit: the whole model must fit on one GPU.",
    "pattern": "DP replicates the model, all-reduces gradients. About 2x grad size per GPU.",
    "answerImage": "/llm/pretraining-scale/parallelism.png"
  },
  {
    "id": "llm-pt-14",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: Hugging Face, The Ultra-Scale Playbook; Google DeepMind, How to Scale Your Model",
    "chapter": "W23 Ultra-Scale Playbook: precision and parallelism",
    "prompt": "What does ZeRO shard at each stage, and what is per-GPU memory for model states with 7B params on 64 GPUs?",
    "answer": "Using 16 bytes/param (2 weights, 2 grads, 12 optimizer: fp32 master + m + v):\nNo sharding: 16 * 7B = 112 GB per GPU.\nZeRO-1 (shard optimizer states): 2 + 2 + 12/64 = 4.19 bytes/param, about 29 GB.\nZeRO-2 (+ shard gradients): 2 + 14/64 = 2.22 bytes/param, about 15.5 GB.\nZeRO-3 / FSDP (+ shard parameters): 16/64 = 0.25 bytes/param, about 1.75 GB, but parameters must be all-gathered before each layer's forward and backward.\nPaper: Rajbhandari et al., 'ZeRO'.",
    "pattern": "ZeRO 1, 2, 3 shard optimizer, then grads, then params.",
    "answerImage": "/llm/pretraining-scale/zero-stages.png"
  },
  {
    "id": "llm-p4-03",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: Hugging Face, The Ultra-Scale Playbook; Google DeepMind, How to Scale Your Model",
    "chapter": "W23 Ultra-Scale Playbook: precision and parallelism",
    "prompt": "Walk through one training step of FSDP (ZeRO-3) and its communication volume compared to plain data parallelism.",
    "answer": "Setup: N ranks. Each rank stores 1/N of every parameter, gradient and optimizer state (flattened shards).\nForward, per layer (or per wrapped unit): all-gather the full parameters for that unit, compute, free the gathered copy (keep only the shard).\nBackward, per unit in reverse: all-gather the parameters again (they were freed), compute gradients, reduce-scatter the gradients so each rank ends up with the summed gradient for its own shard, free the full gradient.\nOptimizer step: purely local, each rank updates its own shard with its own optimizer state.\nCommunication: plain DP all-reduces the gradients once, which costs about 2 x model size per rank (a reduce-scatter plus an all-gather). FSDP does two all-gathers plus one reduce-scatter, about 3 x model size, i.e. 1.5x DP's volume, in exchange for model-state memory dropping by about N.\nOverlap: prefetch the next unit's all-gather while computing the current one; the unit size trades memory against how well communication hides behind compute.",
    "pattern": "All-gather params per unit in forward and again in backward, reduce-scatter grads, local optimizer step. About 1.5x DP traffic."
  },
  {
    "id": "llm-pt-15",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: Hugging Face, The Ultra-Scale Playbook; Google DeepMind, How to Scale Your Model",
    "chapter": "W23 Ultra-Scale Playbook: precision and parallelism",
    "prompt": "How does Megatron-style tensor parallelism split an MLP, and why keep it inside a node?",
    "answer": "MLP: Y = GELU(X A) B. Split A by columns across GPUs, so each GPU computes its slice of X A and applies GELU locally (no communication, GELU is elementwise). Split B by rows, so each GPU produces a partial sum of the output. One all-reduce combines them. Attention is split by heads the same way.\nThat is an all-reduce in every layer's forward and backward, on the critical path, so it needs NVLink-class bandwidth. TP is usually 8 or less, within a node. Paper: Shoeybi et al., 'Megatron-LM'.",
    "pattern": "TP: column-split then row-split, one all-reduce per block. Stay on NVLink.",
    "answerImage": "/llm/pretraining-scale/parallelism.png"
  },
  {
    "id": "llm-pt-16",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: Hugging Face, The Ultra-Scale Playbook; Google DeepMind, How to Scale Your Model",
    "chapter": "W23 Ultra-Scale Playbook: precision and parallelism",
    "prompt": "What is pipeline parallelism, and what is the bubble fraction with 8 stages and 32 micro-batches?",
    "answer": "Split the layers into p stages on different GPUs and stream micro-batches through. At the start and end of each step some stages sit idle (the bubble).\nGPipe-style bubble fraction: (p - 1) / (m + p - 1) = 7 / 39 = about 18%.\nMore micro-batches shrink it; interleaved schedules (each GPU owns several non-adjacent chunks) and 1F1B scheduling reduce it and bound activation memory. Communication is only activations at stage boundaries, so PP works across nodes.",
    "pattern": "Bubble = (p-1)/(m+p-1). More micro-batches, smaller bubble.",
    "answerImage": "/llm/pretraining-scale/parallelism.png"
  },
  {
    "id": "llm-pt-17",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: Hugging Face, The Ultra-Scale Playbook; Google DeepMind, How to Scale Your Model",
    "chapter": "W23 Ultra-Scale Playbook: precision and parallelism",
    "prompt": "How do 3D parallelism layouts typically combine TP, PP, DP, and others on a large cluster?",
    "answer": "Typical: TP within a node (8 GPUs over NVLink), PP across a few nodes, DP (usually with ZeRO/FSDP sharding) across the remaining groups. Total GPUs = TP * PP * DP.\nAdd context or sequence parallelism for long sequences (split the sequence dim) and expert parallelism for MoE layers.\nExample from Llama 3 405B: 16K H100s with TP, PP, context, and data parallelism, reported 38 to 43% MFU.",
    "pattern": "TP in-node, PP across nodes, DP over the rest. Add CP for long context, EP for MoE.",
    "answerImage": "/llm/pretraining-scale/parallelism.png"
  },
  {
    "id": "llm-pt-18",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: Hugging Face, The Ultra-Scale Playbook; Google DeepMind, How to Scale Your Model",
    "chapter": "W23 Ultra-Scale Playbook: precision and parallelism",
    "prompt": "What is activation checkpointing, and what does it cost?",
    "answer": "Normally the forward pass stores every intermediate activation for backward, which at long sequence and large batch dwarfs the weights.\nCheckpointing stores only some activations (for example each block's input) and recomputes the rest during backward. Memory drops a lot; compute rises by about one extra forward pass (around 33% more total if you recompute everything). Selective checkpointing recomputes only cheap-to-recompute but memory-heavy parts like attention internals.",
    "pattern": "Trade about one extra forward for a big cut in activation memory."
  },
  {
    "id": "llm-pt-19",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: Hugging Face, The Ultra-Scale Playbook; Google DeepMind, How to Scale Your Model",
    "chapter": "W23 Ultra-Scale Playbook: precision and parallelism",
    "prompt": "Define MFU and compute it: 7B model, 64 H100s, 500K tokens/s throughput.",
    "answer": "MFU (model FLOPs utilization, introduced in the PaLM paper) = achieved model FLOPs / peak hardware FLOPs. Recomputation does not count toward achieved.\nAchieved: 6 * 7e9 * 5e5 = 2.1e16 FLOP/s.\nPeak: 64 * 989e12 = 6.33e16 FLOP/s.\nMFU = 33%. Good large runs land around 35 to 50% for dense models.",
    "pattern": "MFU = 6N * tokens/s / (GPUs * peak)."
  },
  {
    "id": "llm-p4-04",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: Hugging Face, The Ultra-Scale Playbook; Google DeepMind, How to Scale Your Model",
    "chapter": "W23 Ultra-Scale Playbook: precision and parallelism",
    "prompt": "How does the 'How to Scale Your Model' book frame parallelism decisions with rooflines?",
    "answer": "For every operation, compare two times: compute time = FLOPs / peak FLOP/s, and communication (or memory) time = bytes moved / bandwidth. The larger one is the runtime if they overlap perfectly; you want compute to dominate.\nApply it to each parallelism scheme:\n- data parallel / FSDP: per step, the gradient (and FSDP's parameter) traffic must hide behind the step's compute, which requires enough tokens per device; that sets a minimum per-device batch size\n- tensor parallel: activations are communicated every layer, so compute per layer per device must beat interconnect time, which needs a large enough hidden size per shard; this is why TP stays inside fast interconnect domains\n- pipeline: communication is small, the cost is the bubble\nThe same analysis applies to inference (decode is memory bound and needs batching). The book uses TPUs as the running example and also covers GPUs; the method transfers.",
    "pattern": "Compare FLOPs / peak with bytes / bandwidth for each scheme; choose batch and shard sizes so compute dominates."
  },
  {
    "id": "llm-pt-20",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: Hugging Face, The Ultra-Scale Playbook; Google DeepMind, How to Scale Your Model",
    "chapter": "W23 Ultra-Scale Playbook: precision and parallelism",
    "prompt": "Your large run has a loss spike. What are common causes and what do labs do about it?",
    "answer": "Causes: a bad data batch, attention logits growing without bound, output logits drifting large, Adam's second-moment estimate lagging when a rarely-updated parameter suddenly gets a big gradient, LR too high.\nResponses: rewind to a checkpoint before the spike and skip the offending batches (PaLM did this), lower the LR, lower Adam beta2 (0.95), clip gradients.\nArchitectural prevention: QK-norm, z-loss on the output softmax normalizer (PaLM), careful init, no biases. Mild spikes that recover on their own are often left alone.",
    "pattern": "Rewind and skip, lower LR or beta2. Prevent with QK-norm and z-loss."
  },
  {
    "id": "llm-pt-24",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: Hugging Face, The Ultra-Scale Playbook; Google DeepMind, How to Scale Your Model",
    "chapter": "W23 Ultra-Scale Playbook: precision and parallelism",
    "prompt": "What is the hardware failure reality of a 16K-GPU training run, and how do teams design for it?",
    "answer": "At that scale something breaks often: Llama 3 405B reported 466 job interruptions over a 54-day period, mostly hardware (GPUs, HBM, network).\nDesign: frequent asynchronous checkpointing, fast restart, automated health checks that drain bad nodes, spare capacity, and monitoring for silent data corruption and stragglers. Goodput (useful training time fraction) is a key metric next to MFU.",
    "pattern": "At scale, failure is routine. Checkpoint often, restart fast, track goodput."
  },
  {
    "id": "llm-ip-11",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: Hugging Face, The Ultra-Scale Playbook; Google DeepMind, How to Scale Your Model",
    "chapter": "W23 Ultra-Scale Playbook: precision and parallelism",
    "prompt": "Training on 8 GPUs gives worse loss than the same total batch on 1 GPU with accumulation. What do you check?",
    "answer": "1. Every rank getting the same data: missing DistributedSampler, or forgetting sampler.set_epoch, or all ranks seeded the same with a random sampler.\n2. Loss normalization: averaging per rank then across ranks differs from a true global token mean when ranks have different token counts.\n3. Gradient accumulation with DDP: use no_sync on non-final micro-steps, and check the division by accum.\n4. LR or warmup not adjusted for the global batch.\n5. Randomness: dropout seeds identical across ranks.\n6. Mixed precision or reduction dtype differences (reduce gradients in fp32 if numerics look off).",
    "pattern": "Distributed bugs: duplicated data, wrong normalization, accumulation and LR scaling."
  },
  {
    "id": "llm-p4-build-02",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: Hugging Face, The Ultra-Scale Playbook; Google DeepMind, How to Scale Your Model",
    "chapter": "W23 Ultra-Scale Playbook: precision and parallelism",
    "prompt": "Build this (W23): Multi-GPU FSDP run on rented GPUs",
    "answer": "Spec: Run your GPT on 2 to 8 rented GPUs with DDP and with FSDP (PyTorch FSDP2 fully_shard), and measure memory, throughput and scaling.\n\nSteps:\n1. Make a single-GPU reference run of a few hundred steps and save its loss curve.\n2. Launch with torchrun; run DDP and FSDP at 1, 2, 4 (and 8) GPUs with the same global batch.\n3. Confirm loss curves match the single-GPU reference within noise.\n4. Measure peak memory per GPU, tokens/s, MFU and scaling efficiency; capture one profiler trace showing communication overlap.\n5. Write down the cost in dollars per run.\n\nSuccess looks like: Matching loss curves, a memory table that drops with GPU count under FSDP, scaling efficiency numbers, and an explanation (from the trace) of where the time goes.",
    "pattern": "Build this: Multi-GPU FSDP run on rented GPUs"
  },
  {
    "id": "llm-in-01",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: How to Scale Your Model (inference chapters); vLLM and SGLang documentation",
    "chapter": "W23 Inference at scale",
    "prompt": "What does temperature do? Apply T=1 and T=0.5 to logits [2, 1, 0].",
    "answer": "Divide logits by T before softmax: p = softmax(z / T).\nT=1: softmax([2, 1, 0]) = [0.665, 0.245, 0.090].\nT=0.5: softmax([4, 2, 0]) = [0.867, 0.117, 0.016]. Sharper.\nT -> 0 approaches greedy argmax; T > 1 flattens toward uniform. Temperature does not change the ranking, only how peaked it is.",
    "pattern": "Logits / T. Low T sharpens, high T flattens, ranking unchanged."
  },
  {
    "id": "llm-in-02",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: How to Scale Your Model (inference chapters); vLLM and SGLang documentation",
    "chapter": "W23 Inference at scale",
    "prompt": "Apply top-p = 0.8 to probabilities [0.5, 0.2, 0.15, 0.1, 0.05]. Which tokens survive and with what probabilities?",
    "answer": "Sort descending and keep the smallest prefix whose cumulative mass reaches p.\nCumulative: 0.5, 0.7, 0.85. 0.85 >= 0.8, so keep the first three.\nRenormalize by 0.85: [0.588, 0.235, 0.176].\nTop-k instead keeps a fixed count k regardless of shape. Top-p adapts: a confident distribution keeps few tokens, a flat one keeps many.",
    "pattern": "Top-p keeps the smallest set with mass >= p, then renormalizes."
  },
  {
    "id": "llm-in-03",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: How to Scale Your Model (inference chapters); vLLM and SGLang documentation",
    "chapter": "W23 Inference at scale",
    "prompt": "Write top-p sampling for a batch of logits in PyTorch.",
    "answer": "def sample_top_p(logits, p, temperature=1.0):\n    probs = torch.softmax(logits / temperature, dim=-1)       # (B, V)\n    sorted_p, idx = torch.sort(probs, dim=-1, descending=True)\n    cum = torch.cumsum(sorted_p, dim=-1)\n    remove = cum - sorted_p > p        # mass before this token already exceeds p\n    sorted_p = sorted_p.masked_fill(remove, 0.0)\n    sorted_p = sorted_p / sorted_p.sum(dim=-1, keepdim=True)\n    choice = torch.multinomial(sorted_p, 1)                  # (B, 1)\n    return idx.gather(-1, choice)\nThe cum - sorted_p trick always keeps the top token and keeps the token that crosses p.",
    "pattern": "Sort, cumsum, mask tokens whose preceding mass exceeds p, renormalize, sample, map back."
  },
  {
    "id": "llm-in-04",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: How to Scale Your Model (inference chapters); vLLM and SGLang documentation",
    "chapter": "W23 Inference at scale",
    "prompt": "Greedy vs beam search vs sampling: what do chat and reasoning models use, and why?",
    "answer": "Greedy: always the argmax. Deterministic, but prone to repetition loops in long open-ended text.\nBeam search: keep the top-b partial sequences by total log-prob. Good for translation with short, well-defined outputs; for open-ended generation it produces bland, repetitive text.\nSampling with temperature and top-p (or min-p): what chat models use. Reasoning models usually sample at a moderate temperature (often around 0.6 to 1.0), and sampling multiple answers enables majority voting and pass@k.",
    "pattern": "Chat and reasoning = sampling. Beam search is for short constrained outputs."
  },
  {
    "id": "llm-in-05",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: How to Scale Your Model (inference chapters); vLLM and SGLang documentation",
    "chapter": "W23 Inference at scale",
    "prompt": "What is constrained (structured) decoding?",
    "answer": "At each step, mask out tokens that would make the output invalid for a grammar or JSON schema (set their logits to -inf), then sample from the rest. A state machine tracks where you are in the grammar.\nGuarantees parseable output for tool calls and JSON. Pitfalls: the token-to-character mismatch makes the masking tricky to compute efficiently, and forcing a format the model would not naturally produce can lower answer quality.",
    "pattern": "Mask invalid tokens per step with a grammar state machine."
  },
  {
    "id": "llm-tf-20",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: How to Scale Your Model (inference chapters); vLLM and SGLang documentation",
    "chapter": "W23 Inference at scale",
    "prompt": "Derive the KV cache size per token for a model, and compute it for Llama 3 8B (32 layers, 8 KV heads, head dim 128, bf16).",
    "answer": "Per token you store K and V for every layer: 2 * n_layers * n_kv_heads * head_dim * bytes.\nLlama 3 8B: 2 * 32 * 8 * 128 * 2 bytes = 131,072 bytes = 128 KiB per token.\nAn 8,192-token sequence: 128 KiB * 8192 = 1 GiB.\nWithout GQA (32 KV heads) it would be 4x that: 512 KiB per token.",
    "pattern": "KV bytes/token = 2 * layers * kv_heads * head_dim * bytes.",
    "answerImage": "/llm/transformers/kv-cache.png"
  },
  {
    "id": "llm-in-07",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: How to Scale Your Model (inference chapters); vLLM and SGLang documentation",
    "chapter": "W23 Inference at scale",
    "prompt": "Prefill vs decode: how do they differ in compute profile, and what latency metric does each drive?",
    "answer": "Prefill: process the whole prompt in one forward pass. Many tokens per weight read, so it is compute bound. Drives time to first token (TTFT).\nDecode: one token per sequence per step. Memory bound at small batch. Drives time per output token (TPOT, or inter-token latency).\nBecause they are so different, modern servers use chunked prefill (mix prompt chunks into decode batches) or disaggregate prefill and decode onto separate GPUs.",
    "pattern": "Prefill is compute bound (TTFT). Decode is memory bound (TPOT).",
    "answerImage": "/llm/transformers/kv-cache.png"
  },
  {
    "id": "llm-in-08",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: How to Scale Your Model (inference chapters); vLLM and SGLang documentation",
    "chapter": "W23 Inference at scale",
    "prompt": "Serve a Llama-2-70B-style model (80 layers, 8 KV heads, head dim 128, bf16) to 32 concurrent users with 4,096-token contexts. How much KV cache memory is that?",
    "answer": "Per token: 2 * 80 * 8 * 128 * 2 bytes = 327,680 bytes = 320 KiB.\nTokens: 32 * 4096 = 131,072.\nTotal: 131,072 * 320 KiB = 40 GiB.\nPlus 140 GB of bf16 weights. With full multi-head attention (64 KV heads) the cache would be 8x larger, 320 GiB, which is why GQA matters so much for serving.",
    "pattern": "KV cache = per-token bytes * batch * context. GQA cuts it by heads / kv_heads.",
    "answerImage": "/llm/transformers/kv-cache.png"
  },
  {
    "id": "llm-ip-17",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: How to Scale Your Model (inference chapters); vLLM and SGLang documentation",
    "chapter": "W23 Inference at scale",
    "prompt": "How much KV cache does a single 128K-token context take for a Llama-3-70B-style model (80 layers, 8 KV heads, head dim 128, bf16)?",
    "answer": "Per token: 2 * 80 * 8 * 128 * 2 = 327,680 bytes = 320 KiB.\n128K tokens = 131,072 tokens.\n131,072 * 320 KiB = 40 GiB for one sequence.\nSo one long-context user needs about half an H100 of cache on top of the weights. That is why long-context serving uses KV quantization, smaller caches (MLA), sliding-window layers, or offloading.",
    "pattern": "One 128K sequence on a 70B GQA model is about 40 GiB of KV cache."
  },
  {
    "id": "llm-in-09",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: How to Scale Your Model (inference chapters); vLLM and SGLang documentation",
    "chapter": "W23 Inference at scale",
    "prompt": "What is continuous batching and why does it beat static batching?",
    "answer": "Static batching: start a batch together and wait until the longest sequence finishes; short requests sit idle and new requests wait.\nContinuous (iteration-level) batching: at every decode step, finished sequences leave and waiting requests join. GPU stays full, throughput rises several-fold, and queueing latency drops.\nIntroduced in the Orca paper (Yu et al., 2022); standard in vLLM, SGLang, TensorRT-LLM.",
    "pattern": "Schedule per decode step, not per batch. Swap requests in and out."
  },
  {
    "id": "llm-in-10",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: How to Scale Your Model (inference chapters); vLLM and SGLang documentation",
    "chapter": "W23 Inference at scale",
    "prompt": "What problem does PagedAttention solve?",
    "answer": "Reserving a contiguous KV buffer for each request's maximum length wastes memory to fragmentation and over-reservation; the vLLM paper (Kwon et al., 2023) measured existing systems wasting most of their KV memory.\nPagedAttention stores the KV cache in fixed-size blocks (for example 16 tokens) allocated on demand, with a per-sequence block table, like virtual memory pages. Waste drops to a few percent, so you fit far more concurrent sequences. Blocks can also be shared, which enables prefix caching and cheap parallel sampling.",
    "pattern": "Page the KV cache into blocks. Less fragmentation, more concurrency, shared prefixes."
  },
  {
    "id": "llm-in-11",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: How to Scale Your Model (inference chapters); vLLM and SGLang documentation",
    "chapter": "W23 Inference at scale",
    "prompt": "What is prefix caching, and where does it pay off most?",
    "answer": "If many requests share the same prompt prefix (system prompt, few-shot examples, a long document, earlier turns of a chat), compute its KV cache once and reuse it. Those tokens skip prefill.\nPays off for long shared system prompts, multi-turn chat, agents that resend the growing transcript each step, and sampling many completions from one prompt (as in GRPO rollouts). SGLang's RadixAttention organizes cached prefixes in a radix tree.",
    "pattern": "Reuse KV for shared prefixes. Huge for agents and RL rollouts."
  },
  {
    "id": "llm-in-15",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: How to Scale Your Model (inference chapters); vLLM and SGLang documentation",
    "chapter": "W23 Inference at scale",
    "prompt": "How much memory do a 70B model's weights take in bf16, int8, and int4, and what does that mean for serving?",
    "answer": "bf16: 70e9 * 2 = 140 GB. Needs at least 2 80 GB GPUs, realistically more for KV cache.\nint8: 70 GB.\nint4: 35 GB, plus small overhead for scales (with one fp16 scale per 128 weights, about 36 GB). Fits on one 80 GB GPU with room for KV cache.\nSince decode is memory-bound, fewer weight bytes also means proportionally faster decode at small batch, if the kernels dequantize efficiently.",
    "pattern": "Bytes per param sets memory and batch-1 decode speed."
  },
  {
    "id": "llm-in-16",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: How to Scale Your Model (inference chapters); vLLM and SGLang documentation",
    "chapter": "W23 Inference at scale",
    "prompt": "Weight-only vs weight-and-activation quantization: what is the difference and when do you use each?",
    "answer": "Weight-only (for example int4 weights, bf16 activations): weights are dequantized on the fly inside the matmul. Saves memory and bandwidth, so it speeds up memory-bound decode, but the math still runs in bf16, so compute-bound prefill is not faster.\nWeight-and-activation (int8 W8A8 or FP8): the matmul itself runs in low precision on tensor cores, speeding up compute-bound work too. Harder because activations have outlier channels; SmoothQuant moves that difficulty into the weights. FP8 is now common for serving on Hopper and newer GPUs.",
    "pattern": "Weight-only helps decode bandwidth. W8A8 or FP8 helps compute."
  },
  {
    "id": "llm-in-17",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: How to Scale Your Model (inference chapters); vLLM and SGLang documentation",
    "chapter": "W23 Inference at scale",
    "prompt": "What is the core idea of GPTQ and of AWQ?",
    "answer": "Both are post-training methods for low-bit weights using a small calibration set.\nGPTQ (Frantar et al.): quantize weights one column at a time and update the not-yet-quantized weights to compensate for the error, using second-order (inverse Hessian of the layer's reconstruction loss) information.\nAWQ (Lin et al.): a small fraction of weight channels matter most, identified by large activation magnitudes. Scale those channels up before quantization (and the activations down) so their relative rounding error shrinks. No backprop or Hessian.",
    "pattern": "GPTQ compensates errors with second-order info. AWQ protects salient channels by scaling."
  },
  {
    "id": "llm-in-18",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: How to Scale Your Model (inference chapters); vLLM and SGLang documentation",
    "chapter": "W23 Inference at scale",
    "prompt": "Why are activation outliers a problem for int8 quantization?",
    "answer": "In large LLMs a few hidden dimensions carry activations 10 to 100 times larger than the rest. With one scale per tensor, the scale must cover the outlier, so all the normal values are crushed into a few int8 levels and lose precision.\nFixes: keep outlier dims in higher precision (LLM.int8(), Dettmers et al.), per-channel or per-token scales, finer group-wise scales, or SmoothQuant's rescaling. Rotation-based methods (like QuaRot) multiply by orthogonal matrices to spread outliers out before quantizing.",
    "pattern": "Outliers wreck per-tensor scales. Use finer scales, mixed precision, or rotations."
  },
  {
    "id": "llm-in-19",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: How to Scale Your Model (inference chapters); vLLM and SGLang documentation",
    "chapter": "W23 Inference at scale",
    "prompt": "How does speculative decoding work, and why does it keep the target model's output distribution exactly?",
    "answer": "A cheap draft model proposes k tokens. The big target model scores all k in one forward pass (same cost as a single step, since decode is memory bound).\nAccept draft token x with probability min(1, p_target(x) / p_draft(x)). On the first rejection, resample from the normalized max(0, p_target - p_draft) and stop. If all k are accepted, sample one bonus token from the target.\nThis rejection rule makes the output distribution identical to sampling from the target alone. Papers: Leviathan et al. and Chen et al., 2023.",
    "pattern": "Draft k, verify in one pass, accept with min(1, p/q). Output is exact.",
    "answerImage": "/llm/inference/speculative-decoding.png"
  },
  {
    "id": "llm-in-20",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: How to Scale Your Model (inference chapters); vLLM and SGLang documentation",
    "chapter": "W23 Inference at scale",
    "prompt": "With per-token acceptance rate 0.8 and k = 4 draft tokens, how many tokens do you get per target forward pass on average?",
    "answer": "Expected tokens = (1 - a^(k+1)) / (1 - a) = (1 - 0.8^5) / 0.2 = (1 - 0.32768) / 0.2 = 3.36.\nSo about 3.4 tokens per expensive pass instead of 1. Real speedup is lower because the draft model also costs time, and the gain shrinks at large batch sizes where decode is no longer memory bound.",
    "pattern": "Tokens per pass = (1 - a^(k+1)) / (1 - a).",
    "answerImage": "/llm/inference/speculative-decoding.png"
  },
  {
    "id": "llm-in-21",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: How to Scale Your Model (inference chapters); vLLM and SGLang documentation",
    "chapter": "W23 Inference at scale",
    "prompt": "Name the main kinds of draft mechanisms for speculative decoding.",
    "answer": "1. A separate small model from the same family (same tokenizer).\n2. Extra decoding heads on the target that predict several future tokens (Medusa), or a light draft head that reuses the target's hidden states (EAGLE).\n3. Multi-token prediction heads trained with the model (DeepSeek-V3 trained MTP modules and reported using them for speculative decoding).\n4. Prompt lookup or n-gram drafting: copy spans from the context, great for code edits and summarization.",
    "pattern": "Draft from a small model, extra heads, MTP, or the prompt itself."
  },
  {
    "id": "llm-in-22",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: How to Scale Your Model (inference chapters); vLLM and SGLang documentation",
    "chapter": "W23 Inference at scale",
    "prompt": "Latency vs throughput: what knob trades one for the other, and how do you choose?",
    "answer": "Batch size. Larger batches amortize each weight read over more sequences, raising tokens/s per GPU (throughput), but each step takes longer and requests queue, raising per-user latency.\nInteractive chat cares about TTFT and inter-token latency (fast reading speed is roughly 20 to 50 tokens/s per user); offline jobs like RL rollouts, synthetic data, and evals care about total throughput. Set an SLO for latency, then maximize throughput under it.",
    "pattern": "Batch size trades latency for throughput. Fix the SLO, then maximize throughput."
  },
  {
    "id": "llm-in-23",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: How to Scale Your Model (inference chapters); vLLM and SGLang documentation",
    "chapter": "W23 Inference at scale",
    "prompt": "How do you split a 70B model across GPUs for serving, and why does tensor parallelism dominate at low latency?",
    "answer": "Tensor parallelism splits each layer across GPUs (for example 4 or 8 on NVLink). Every GPU reads only its share of the weights per token, so per-token latency drops nearly linearly. 140 GB of bf16 weights over 4 H100s at 3.35 TB/s each gives at least 140 / 13,400 s = about 10.4 ms per token, about 96 tokens/s upper bound at batch 1.\nPipeline parallelism splits layers into stages; it helps fit the model and throughput, but does not cut single-request latency. MoE models add expert parallelism.",
    "pattern": "TP divides the weight reads per token, so it cuts latency. PP only helps fit and throughput."
  },
  {
    "id": "llm-in-24",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: How to Scale Your Model (inference chapters); vLLM and SGLang documentation",
    "chapter": "W23 Inference at scale",
    "prompt": "Name the main open-source LLM serving engines and the core features they share.",
    "answer": "vLLM, SGLang, TensorRT-LLM (NVIDIA), and llama.cpp for local CPU and Apple silicon.\nShared features: continuous batching, paged KV cache, prefix caching, fused attention kernels, quantization (FP8, int4 weight-only), speculative decoding, tensor parallelism, and an OpenAI-compatible API. SGLang is strong on prefix-heavy and structured workloads; vLLM is the most common default. RL training frameworks often run rollouts on one of these engines.",
    "pattern": "vLLM or SGLang: continuous batching, paged KV, prefix caching, quantization."
  },
  {
    "id": "llm-in-26",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: How to Scale Your Model (inference chapters); vLLM and SGLang documentation",
    "chapter": "W23 Inference at scale",
    "prompt": "What is disaggregated prefill and decode serving?",
    "answer": "Run prefill on one pool of GPUs and decode on another, transferring the KV cache between them.\nWhy: prefill is compute bound and bursty; decode is memory bound and steady. Sharing GPUs means long prefills stall other users' decoding (latency spikes). Separate pools can each use the best parallelism, batch size, and even hardware for their phase.\nCost: moving the KV cache over the network. Used in large production stacks; DeepSeek described this setup for V3 serving.",
    "pattern": "Separate compute-bound prefill from memory-bound decode."
  },
  {
    "id": "llm-ip-18",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: How to Scale Your Model (inference chapters); vLLM and SGLang documentation",
    "chapter": "W23 Inference at scale",
    "prompt": "At large batch (compute bound), roughly how many tokens/s can 8 H100s generate for a 70B dense model?",
    "answer": "Each generated token costs about 2N = 2 * 70e9 = 1.4e11 FLOPs.\nAssume 50% of peak while decoding at large batch: 8 * 989e12 * 0.5 = 3.96e15 FLOP/s.\nTokens/s = 3.96e15 / 1.4e11 = about 28,000 tokens/s total across all users.\nReal numbers are lower because attention over long KV caches adds memory traffic, but this sets the ceiling.",
    "pattern": "Compute-bound decode tokens/s = GPUs * peak * util / 2N."
  },
  {
    "id": "llm-pt-01",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: Penedo et al. 2024, The FineWeb Datasets (Hugging Face FineWeb and FineWeb-Edu)",
    "chapter": "W24 Data: FineWeb",
    "prompt": "Sketch a modern web pretraining data pipeline from raw crawl to training shards.",
    "answer": "1. Extract text from Common Crawl HTML (trafilatura-style extraction beats the raw WET files).\n2. Language ID and basic heuristic filters (length, symbol ratio, repeated lines, bad words lists).\n3. Deduplicate: exact (hashes) and near-duplicate (MinHash with LSH).\n4. Quality filtering, often a classifier trained on labels from a strong LLM (FineWeb-Edu did this).\n5. PII scrubbing and safety filtering.\n6. Decontaminate against eval sets.\n7. Mix with code, math, books, papers, multilingual data at chosen ratios.\n8. Tokenize, pack into fixed-length sequences, shuffle, shard.\nReference: Penedo et al., the FineWeb paper.",
    "pattern": "Extract, filter, dedup, quality-classify, decontaminate, mix, tokenize, pack."
  },
  {
    "id": "llm-pt-02",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: Penedo et al. 2024, The FineWeb Datasets (Hugging Face FineWeb and FineWeb-Edu)",
    "chapter": "W24 Data: FineWeb",
    "prompt": "Why does deduplication matter, and how does MinHash near-dup detection work?",
    "answer": "Duplicates waste compute, increase memorization (and regurgitation of training text), and skew the effective mixture. Lee et al., 'Deduplicating Training Data Makes Language Models Better', showed clear gains.\nMinHash: turn each doc into a set of n-gram shingles. Jaccard similarity |A and B| / |A or B| is approximated by the fraction of k random hash functions where both docs have the same minimum hash. LSH bands those signatures so only likely-similar pairs are compared, avoiding all-pairs comparison.",
    "pattern": "MinHash approximates Jaccard. LSH avoids comparing every pair."
  },
  {
    "id": "llm-p4-05",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: Penedo et al. 2024, The FineWeb Datasets (Hugging Face FineWeb and FineWeb-Edu)",
    "chapter": "W24 Data: FineWeb",
    "prompt": "How did the FineWeb team decide which data processing steps to keep?",
    "answer": "Data ablations: for each candidate pipeline variant, train the same small model (about 1.8B parameters) on a fixed number of tokens (about 28B) from that variant, then evaluate on a set of benchmarks chosen because they give signal early in training (for example HellaSwag, ARC, PIQA, MMLU-style tasks), averaged.\nKeep a step only if it improves the aggregate beyond the noise between runs (they estimated noise with different seeds and data samples).\nLessons they reported:\n- text extraction from WARC with a good extractor (trafilatura) beat the precomputed WET text\n- MinHash deduplication done per crawl dump worked better than deduplicating globally across all dumps, which removed too much and left a lower-quality remainder\n- some heuristic filters from earlier datasets (C4's rules) help, and new filters were chosen from statistics of good vs bad data\nThe method is the point: small-model data ablations with a fixed eval suite are how data decisions get made.",
    "pattern": "Train ~1.8B models on ~28B tokens per variant, score on early-signal benchmarks, keep steps that beat noise."
  },
  {
    "id": "llm-p4-06",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: Penedo et al. 2024, The FineWeb Datasets (Hugging Face FineWeb and FineWeb-Edu)",
    "chapter": "W24 Data: FineWeb",
    "prompt": "How was FineWeb-Edu built, and why did it help on knowledge and reasoning benchmarks?",
    "answer": "1. Llama-3-70B-Instruct annotated about 450k FineWeb samples with an educational quality score from 0 to 5.\n2. A small classifier (an embedding model with a regression head) was trained on those annotations.\n3. The classifier scored all of FineWeb; keeping documents with score at least 3 gave FineWeb-Edu, about 1.3T tokens.\nResult: models trained on FineWeb-Edu improved substantially on knowledge and reasoning heavy benchmarks such as MMLU and ARC compared to FineWeb at equal tokens.\nCaveats: the filter encodes one model's notion of \"educational\", reduces diversity, and benchmarks like MMLU reward exactly that content, so gains can partly reflect benchmark alignment. It is also why build-nanogpt and nanochat-era small runs use FineWeb-Edu style data.",
    "pattern": "LLM-annotated 450k samples, trained a classifier, kept score >= 3: about 1.3T tokens, big MMLU and ARC gains."
  },
  {
    "id": "llm-pt-03",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: Penedo et al. 2024, The FineWeb Datasets (Hugging Face FineWeb and FineWeb-Edu)",
    "chapter": "W24 Data: FineWeb",
    "prompt": "What is sequence packing, and what masking issue does it raise?",
    "answer": "Instead of padding each document to the context length, concatenate documents with an end-of-text token between them and cut into fixed-length chunks. No wasted compute on padding.\nIssue: tokens can attend across the document boundary into an unrelated previous document. Many setups accept this; others use document-aware attention masks (block-diagonal causal) so each document only sees itself, which Llama 3 reported doing.",
    "pattern": "Pack to avoid padding. Optionally mask attention across document boundaries."
  },
  {
    "id": "llm-pt-04",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: Penedo et al. 2024, The FineWeb Datasets (Hugging Face FineWeb and FineWeb-Edu)",
    "chapter": "W24 Data: FineWeb",
    "prompt": "What is data mixture tuning and annealing at the end of pretraining?",
    "answer": "Mixture: the fraction of web, code, math, books, multilingual and so on. It is chosen with small-scale ablations or learned mixing methods, and strongly affects downstream skills (more code tends to help reasoning).\nAnnealing: in the last part of training, while the LR decays to near zero, upsample the highest-quality data (curated math, code, instruction-like data). Llama 3 reported gains from this. Labs also use small annealing runs to judge the value of a new dataset cheaply.",
    "pattern": "Mixture sets skills. Anneal on the best data while LR decays."
  },
  {
    "id": "llm-pt-26",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: Penedo et al. 2024, The FineWeb Datasets (Hugging Face FineWeb and FineWeb-Edu)",
    "chapter": "W24 Data: FineWeb",
    "prompt": "What role does synthetic data play in pretraining now, and what is the risk?",
    "answer": "Labs generate rephrased web text, textbook-style explanations, math and code problems with verified solutions, and reasoning traces from stronger models, then mix them into pretraining or mid-training. The Phi models leaned on this heavily, and most labs use some.\nRisks: loss of diversity, amplified errors and biases from the generator, and model collapse if models train recursively on their own outputs with no fresh real data. Verified synthetic data (code that passes tests, math with checked answers) is the least risky kind. How much synthetic data helps at frontier scale is still debated.",
    "pattern": "Synthetic data helps most when it is verified. Keep real data in the mix."
  },
  {
    "id": "llm-ip-19",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: Penedo et al. 2024, The FineWeb Datasets (Hugging Face FineWeb and FineWeb-Edu)",
    "chapter": "W24 Data: FineWeb",
    "prompt": "Roughly how much disk is 15T tokens of text, and what does that imply for the data pipeline?",
    "answer": "English text with a modern tokenizer averages roughly 4 bytes per token, so 15T tokens is about 60 TB of raw text; stored as token ids (uint32 for a 128K vocab) it is also about 60 TB.\nThe raw crawl before filtering is many times larger, often petabytes. So filtering and dedup run as distributed jobs (Spark, Ray, or similar), and training reads pre-tokenized, shuffled shards streamed from object storage.",
    "pattern": "About 4 bytes per token. Trillions of tokens means tens of TB after filtering."
  },
  {
    "id": "llm-p4-build-03",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: Penedo et al. 2024, The FineWeb Datasets (Hugging Face FineWeb and FineWeb-Edu)",
    "chapter": "W24 Data: FineWeb",
    "prompt": "Build this (W24): Data quality ablation",
    "answer": "Spec: Measure how much data quality matters at your scale: the same model trained on equal tokens of several data sources.\n\nSteps:\n1. Pick 3 sources: a lightly filtered Common Crawl sample (or C4), FineWeb, FineWeb-Edu.\n2. Same tokenizer, model, tokens and schedule; 2 to 3 seeds each.\n3. Evaluate validation loss on a fixed neutral held-out set, plus HellaSwag and ARC-Easy (via lm-evaluation-harness).\n4. Bonus: vary the FineWeb-Edu threshold (2, 3, 4) and plot benchmark score against the fraction of data kept.\n\nSuccess looks like: A table with seed spread where the ranking is clear (or clearly within noise), and a short discussion of which benchmarks moved and why that might be partly benchmark alignment.",
    "pattern": "Build this: Data quality ablation"
  },
  {
    "id": "llm-p4-07",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: Karpathy, nanochat repository",
    "chapter": "W25 nanochat: the full pipeline",
    "prompt": "What is nanochat, and what does its pipeline cover?",
    "answer": "Per its README: a minimal, hackable harness that covers all major LLM stages (tokenization, pretraining, finetuning, evaluation, inference) on a single GPU node, ending in a model you can chat with through a CLI or web UI.\nOne script (runs/speedrun.sh) runs the reference pipeline on an 8 x H100 node: train a tokenizer, pretrain the base model, run the finetuning stages, evaluate, then serve.\nA single complexity dial, --depth (number of layers), sets the model; width, heads, learning rates, training horizon and weight decay are derived automatically to give a compute-optimal miniseries. GPT-2 capability is reached around depth 26.\nIt keeps a \"time to GPT-2\" leaderboard: wall-clock time on 8 x H100 to beat GPT-2's CORE score. In early 2026 the README lists runs around 2 hours or less (about 48 dollars at about 3 dollars per GPU hour).\nRead the current README; the repo changes quickly.",
    "pattern": "Tokenizer to pretrain to finetune to eval to chat on one 8xH100 node; one --depth dial; a time-to-GPT-2 leaderboard."
  },
  {
    "id": "llm-p4-08",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: Karpathy, nanochat repository",
    "chapter": "W25 nanochat: the full pipeline",
    "prompt": "What are bits per byte and the DCLM CORE metric, and why does nanochat use them?",
    "answer": "Bits per byte (bpb): validation loss converted to be tokenizer independent. Sum the negative log-likelihood (in nats) over a text, divide by ln 2 to get bits, divide by the number of UTF-8 bytes. Models with different tokenizers or vocab sizes can be compared on bpb but not on per-token loss.\nCORE: from the DataComp-LM (DCLM) work, an aggregate over a fixed set of in-context benchmarks (around 22 tasks), each scored as accuracy centered so that random guessing is 0 and perfect is 1, then averaged. Small models get meaningful signal from it, unlike from hard benchmarks where they sit at chance.\nnanochat uses val bpb to track pretraining and CORE as the target for the GPT-2 speedrun (GPT-2's CORE is about 0.2565).",
    "pattern": "bpb = total NLL in bits / bytes, tokenizer independent. CORE = centered accuracy averaged over ~22 DCLM tasks."
  },
  {
    "id": "llm-p4-build-04",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: Karpathy, nanochat repository",
    "chapter": "W25 nanochat: the full pipeline",
    "prompt": "Build this (W25): Your own small chat model",
    "answer": "Spec: Run the nanochat pipeline end to end (full speedrun if you can rent 8 x H100 for a few hours, otherwise a smaller depth), then change one thing and measure it.\n\nSteps:\n1. Run the reference script unmodified; record val bpb, CORE and the finetuning evals; save chat transcripts.\n2. Read every stage's code until you can explain it.\n3. Change exactly one thing (for example the pretraining data mix, the SFT data, or the depth) and rerun the affected stages.\n4. Compare before vs after on the same evals and a fixed set of 20 chat prompts.\n\nSuccess looks like: A reproduction within noise of the reference numbers for your config, a clean one-variable comparison, and a short write-up of what changed and why.",
    "pattern": "Build this: Your own small chat model"
  },
  {
    "id": "llm-p4-09",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: Kimi Team 2026, Kimi K3: Open Frontier Intelligence (arXiv 2607.24653)",
    "chapter": "W26 Reading a frontier report: Kimi K3",
    "prompt": "What does the Kimi K3 report's abstract say about the model and how it was built?",
    "answer": "From the abstract (read the full report for details):\n- 2.8T parameter MoE with 104B activated parameters, native vision, 1M-token context\n- architecture built on Kimi Delta Attention and Attention Residuals (information flow across sequence length and depth)\n- Stable LatentMoE, activating 16 of 896 routed experts per token\n- with refined training and data recipes, about 2.5x better overall scaling efficiency than Kimi K2\n- post-training with RL across general, agentic and coding domains and multiple reasoning-effort levels\n- infrastructure: algorithm-system co-design for KDA, balanced expert-parallel training, million-token agentic RL with persistent rollout and sandbox states, deployment work\n- open weights; the report says it still trails the strongest proprietary models it compared against\nNotice how much of P3 shows up directly: KDA (W19) and AttnRes (W20).",
    "pattern": "2.8T total / 104B active MoE, KDA plus AttnRes, 16 of 896 experts, about 2.5x scaling efficiency over K2, heavy agentic RL."
  },
  {
    "id": "llm-p4-10",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: Kimi Team 2026, Kimi K3: Open Frontier Intelligence (arXiv 2607.24653)",
    "chapter": "W26 Reading a frontier report: Kimi K3",
    "prompt": "How do you read a frontier lab's technical report critically?",
    "answer": "1. Separate claims by evidence: controlled ablation, scaling-law fit, benchmark table, or assertion. Most headline numbers are benchmark tables; most architecture claims are backed by smaller-scale ablations.\n2. For each ablation: same tokens, same compute, same tuning effort for baselines? How many seeds? At what scale?\n3. For benchmark tables: which numbers are their own runs vs reported by others, which evaluation settings (reasoning effort, tools, sampling), and is there contamination analysis?\n4. \"Scaling efficiency\" style claims: compute-equivalent gain against which baseline, measured how?\n5. Note what is missing: data details, compute totals, failed attempts.\n6. Extract what you can test at small scale (an architecture piece, a training trick, an RL detail) and what you cannot.\n7. Write down three questions you would ask the authors.",
    "pattern": "Classify each claim by evidence, check ablation fairness and eval settings, note omissions, extract testable pieces."
  },
  {
    "id": "llm-p4-build-05",
    "deck": "P4 Pretraining and scale (W22-26)",
    "source": "Plan reading: Kimi Team 2026, Kimi K3: Open Frontier Intelligence (arXiv 2607.24653)",
    "chapter": "W26 Reading a frontier report: Kimi K3",
    "prompt": "Build this (W26): Blog: what a frontier report actually tells you",
    "answer": "Spec: A post that dissects one frontier report (Kimi K3 is the natural choice after P3) claim by claim, with a small experiment testing one of its ideas.\n\nSteps:\n1. Make a table of every major claim: evidence type, scale, what would falsify it.\n2. Connect the architecture to the papers you studied (KDA, AttnRes, MoE) and explain each in a paragraph.\n3. Pick one idea you can test at small scale and run it with 3 seeds.\n4. End with what you would do differently or test next.\n\nSuccess looks like: A claims table that a reader could reuse, a small experiment with error bars, and no claims beyond what the report and your data support.",
    "pattern": "Build this: Blog: what a frontier report actually tells you"
  }
];
