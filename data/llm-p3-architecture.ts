import type { Question } from "../lib/types";

export const LLM_P3_ARCHITECTURE: Question[] = [
  {
    "id": "llm-nn-10",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Xiong et al. 2020, On Layer Normalization in the Transformer Architecture (arXiv 2002.04745)",
    "chapter": "W11 PreNorm and normalization",
    "prompt": "What is RMSNorm and why did it replace LayerNorm in most LLMs?",
    "answer": "RMSNorm(x) = x / sqrt(mean(x^2) + eps) * g. No mean subtraction and no bias, just rescaling by the root mean square, with a learned gain g.\nIt is cheaper (one fewer reduction) and works as well in practice. Llama, Mistral, Qwen and others use it. (Zhang and Sennrich, 'Root Mean Square Layer Normalization'.)",
    "pattern": "RMSNorm = LayerNorm minus centering and bias. Cheaper, same quality."
  },
  {
    "id": "llm-nn-11",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Xiong et al. 2020, On Layer Normalization in the Transformer Architecture (arXiv 2002.04745)",
    "chapter": "W11 PreNorm and normalization",
    "prompt": "Pre-norm vs post-norm transformer blocks: write both and say which modern LLMs use.",
    "answer": "Post-norm (original Transformer): x = Norm(x + Sublayer(x)).\nPre-norm (GPT-2 onward): x = x + Sublayer(Norm(x)), plus one final norm before the output head.\nPre-norm keeps a clean identity path through the residual stream, so gradients flow straight to early layers and deep models train without careful warmup. Nearly all current LLMs are pre-norm. Some add extra norms (for example QK-norm or a norm after the sublayer output) for stability.",
    "pattern": "Pre-norm: x + f(Norm(x)). Clean residual path, stable deep training.",
    "answerImage": "/llm/transformers/transformer-block.png"
  },
  {
    "id": "llm-p3-01",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Xiong et al. 2020, On Layer Normalization in the Transformer Architecture (arXiv 2002.04745)",
    "chapter": "W11 PreNorm and normalization",
    "prompt": "What did Xiong et al. (2020) show about Post-LN vs Pre-LN Transformers?",
    "answer": "Using mean field analysis at initialization, they showed that in the original Post-LN Transformer the expected gradients of parameters near the output layer are large. A large learning rate right away is then unstable, which is why Post-LN needs a learning-rate warmup stage.\nIn Pre-LN (normalize the input of each sublayer, keep a clean residual path) the gradients are well behaved at initialization. They trained Pre-LN Transformers without warmup, reaching comparable results with less training time and less hyperparameter tuning.\nThis is the theoretical backing for why GPT-2 onward and essentially every modern LLM use pre-norm (with RMSNorm), even though careful warmup is still used in practice for other reasons (Adam statistics, large batch).",
    "pattern": "Post-LN: large gradients near the output at init, so warmup is required. Pre-LN: well-behaved, warmup optional."
  },
  {
    "id": "llm-p3-02",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Xiong et al. 2020, On Layer Normalization in the Transformer Architecture (arXiv 2002.04745)",
    "chapter": "W11 PreNorm and normalization",
    "prompt": "What is the known cost of PreNorm that later architectures (including Attention Residuals) target?",
    "answer": "With pre-norm, the residual stream is h_L = h_0 + sum of every sublayer's output, all with weight 1. Nothing ever normalizes the stream itself, so its magnitude tends to grow with depth.\nEach sublayer reads a normalized copy, but its output is added to an ever larger sum. A layer deep in the network changes the stream by a relatively smaller fraction, so its contribution is diluted. Later layers can compensate only by producing larger outputs.\nSymptoms people report: deeper layers that matter less (they can be pruned with little loss), growing hidden-state norms, uneven gradient magnitudes across depth.\nResponses include scaled residual branches, extra norms (sandwich norm, QK-norm for the attention logits), and learned, input-dependent mixing of earlier layers instead of a plain sum, which is the Attention Residuals idea (W20).",
    "pattern": "Unit-weight sum of all layer outputs grows with depth, diluting each later layer. AttnRes replaces the plain sum."
  },
  {
    "id": "llm-pt-21",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Xiong et al. 2020, On Layer Normalization in the Transformer Architecture (arXiv 2002.04745)",
    "chapter": "W11 PreNorm and normalization",
    "prompt": "What is QK-norm and what problem does it solve?",
    "answer": "Apply a LayerNorm or RMSNorm to queries and keys (per head) before computing Q K^T.\nWithout it, attention logits can grow very large during training, softmax saturates to one-hot, and training becomes unstable (loss spikes or divergence). Normalizing q and k bounds the logit scale. Used in several recent models (for example OLMo 2 and Gemma 3) and in large vision transformers.",
    "pattern": "QK-norm bounds attention logits so softmax does not saturate."
  },
  {
    "id": "llm-nn-24",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Dao et al. 2022, FlashAttention (arXiv 2205.14135); Dao 2023, FlashAttention-2 (arXiv 2307.08691)",
    "chapter": "W11 FlashAttention 1 and 2",
    "prompt": "What does F.scaled_dot_product_attention give you over writing attention by hand?",
    "answer": "It computes softmax(Q K^T / sqrt(d) + mask) V and dispatches to a fused kernel (FlashAttention or memory-efficient attention) when it can. That means no T x T score matrix in memory, so it is much faster and uses far less memory at long context.\nUse is_causal=True for decoder self-attention instead of building a mask by hand.",
    "pattern": "Use SDPA with is_causal=True. Hand-rolled attention is for learning only."
  },
  {
    "id": "llm-in-12",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Dao et al. 2022, FlashAttention (arXiv 2205.14135); Dao 2023, FlashAttention-2 (arXiv 2307.08691)",
    "chapter": "W11 FlashAttention 1 and 2",
    "prompt": "Explain the FlashAttention idea in a few sentences.",
    "answer": "Standard attention writes the T x T score matrix to HBM, reads it back for softmax, writes it again, and reads it for the V multiply. At long T that memory traffic dominates.\nFlashAttention tiles Q, K, V into blocks that fit in on-chip SRAM, computes scores, softmax and the V product block by block, and never writes the full score matrix to HBM. An online softmax keeps a running max and sum so results are exact. Backward recomputes the scores instead of storing them.\nResult: exact attention, memory linear in T, several times faster. Dao et al., 'FlashAttention'; later FA2 and FA3 (Hopper-specific).",
    "pattern": "IO-aware tiling plus online softmax. Exact, never stores T x T in HBM.",
    "answerImage": "/llm/inference/flash-attention.png"
  },
  {
    "id": "llm-in-13",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Dao et al. 2022, FlashAttention (arXiv 2205.14135); Dao 2023, FlashAttention-2 (arXiv 2307.08691)",
    "chapter": "W11 FlashAttention 1 and 2",
    "prompt": "How does the online softmax work?",
    "answer": "Process scores in blocks. Keep a running max m, a running sum l of exp(s - m), and a running output o (the unnormalized weighted sum of V rows).\nFor each new block, compute M = max(m, max of the block's scores). Rescale the old l and o by exp(m - M), then add the block's terms exp(s - M) to l and exp(s - M) times V to o. Set m = M.\nAt the end, divide o by l. The result equals softmax(s) V exactly, without ever holding all scores at once.",
    "pattern": "Running max and sum, rescale old partials when the max changes.",
    "answerImage": "/llm/inference/flash-attention.png"
  },
  {
    "id": "llm-p3-03",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Dao et al. 2022, FlashAttention (arXiv 2205.14135); Dao 2023, FlashAttention-2 (arXiv 2307.08691)",
    "chapter": "W11 FlashAttention 1 and 2",
    "prompt": "State FlashAttention's IO complexity result and why it matters.",
    "answer": "Standard attention reads Q, K, V, writes the N x N score matrix S, reads it for softmax, writes P, reads P for P V: Theta(N d + N^2) HBM accesses, dominated by N^2 for long sequences.\nFlashAttention tiles Q, K, V so blocks fit in SRAM of size M, computes softmax online, and never writes S or P to HBM: Theta(N^2 d^2 / M) HBM accesses.\nWith head dim d = 64 to 128 and M of about 100 KB, d^2 is many times smaller than M, so this is far fewer accesses. The paper also proves that no exact attention algorithm can asymptotically beat this for every M in the relevant range.\nIt is still Theta(N^2 d) FLOPs. FlashAttention wins by being IO aware, not by doing less math, and the memory footprint is linear in N because P is never stored.",
    "pattern": "Standard Theta(Nd + N^2) HBM accesses vs Flash Theta(N^2 d^2 / M). Same FLOPs, far less IO, O(N) memory."
  },
  {
    "id": "llm-p3-04",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Dao et al. 2022, FlashAttention (arXiv 2205.14135); Dao 2023, FlashAttention-2 (arXiv 2307.08691)",
    "chapter": "W11 FlashAttention 1 and 2",
    "prompt": "Derive the FlashAttention backward pass. What is stored from the forward, and what is D?",
    "answer": "Forward stores only the output O and the per-row log-sum-exp L (one number per query), not P.\nBackward, per tile, recompute S = Q K^T / sqrt(d) and P = exp(S - L) from Q, K and L. Recomputing is cheaper than reading an N x N matrix from HBM.\nGiven dO:\ndV = P^T dO\ndP = dO V^T\nSoftmax backward per row i: dS_ij = P_ij (dP_ij - sum_k P_ik dP_ik).\nThe row sum simplifies: sum_k P_ik dP_ik = sum_k P_ik (dO_i . V_k) = dO_i . (sum_k P_ik V_k) = dO_i . O_i.\nSo D_i = rowsum(dO * O), computed once up front, and dS = P * (dP - D[:, None]).\ndQ = dS K / sqrt(d), dK = dS^T Q / sqrt(d).\nThat is why FlashAttention's backward needs only Q, K, V, O, dO and L.",
    "pattern": "Store O and logsumexp; recompute P per tile. dS = P * (dP - D) with D = rowsum(dO * O)."
  },
  {
    "id": "llm-p3-05",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Dao et al. 2022, FlashAttention (arXiv 2205.14135); Dao 2023, FlashAttention-2 (arXiv 2307.08691)",
    "chapter": "W11 FlashAttention 1 and 2",
    "prompt": "What did FlashAttention-2 change relative to FlashAttention-1?",
    "answer": "Three main changes, giving about 2x over FA1 and reaching 50 to 73% of theoretical peak FLOP/s on A100 in the forward pass:\n1. Fewer non-matmul FLOPs: tensor cores make matmuls far faster than other ops, so FA2 keeps the output unnormalized while iterating over K/V blocks and rescales once at the end, and stores only the log-sum-exp for backward.\n2. Parallelize over the sequence length too: FA1 parallelized over batch and heads, which underuses the GPU when batch x heads is small (long sequences). FA2 also assigns different query blocks to different thread blocks.\n3. Better work split inside a block: FA1 split K/V across warps, which needs shared-memory communication to combine partial results. FA2 splits Q across warps, and each warp works on its own rows with no cross-warp reduction.\nLater versions (FA3 for Hopper) use asynchrony and FP8, but FA2 is the algorithm to know cold.",
    "pattern": "FA2: rescale once at the end, parallelize over sequence too, split Q (not K/V) across warps. About 2x FA1."
  },
  {
    "id": "llm-p3-build-01",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Dao et al. 2022, FlashAttention (arXiv 2205.14135); Dao 2023, FlashAttention-2 (arXiv 2307.08691)",
    "chapter": "W11 FlashAttention 1 and 2",
    "prompt": "Build this (W11): Toy FlashAttention forward in Triton",
    "answer": "Spec: A Triton forward kernel for single-head (then multi-head) attention using tiling and online softmax, causal and non-causal, head dim 64, checked against a naive implementation.\n\nSteps:\n1. Write it in NumPy first: loop over K/V blocks with running max m, running sum l and an unnormalized accumulator; assert it equals naive softmax attention.\n2. Port to Triton: one program per (batch-head, query block); load the Q block once, loop over K/V blocks, use tl.dot, keep m, l and acc in registers, normalize at the end, store O and logsumexp.\n3. Add causal masking and skip fully masked blocks.\n4. Test against naive PyTorch attention in fp32 and bf16; benchmark against naive and F.scaled_dot_product_attention for T from 512 to 8192; measure peak memory.\n\nSuccess looks like: Outputs match within dtype tolerance, memory stays roughly linear in T while naive is quadratic, and you beat naive at long T. You will likely not match the SDPA flash kernel; explain the gap (pipelining, warp specialization, tuning).",
    "pattern": "Build this: Toy FlashAttention forward in Triton"
  },
  {
    "id": "llm-tf-14",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Chen et al. 2023, Positional Interpolation (arXiv 2306.15595); Peng et al. 2023, YaRN (arXiv 2309.00071)",
    "chapter": "W12 Context extension: PI and YaRN",
    "prompt": "How do labs extend a RoPE model's context length after pretraining?",
    "answer": "Directly running past the trained length fails because the model never saw those rotation angles.\nCommon fixes, followed by a short fine-tune on long documents:\n1. Position interpolation: scale positions down so the new range maps into the trained range.\n2. Raise the RoPE base (NTK-aware scaling) so low frequencies rotate slower.\n3. YaRN and similar: scale different frequency bands differently.\nLlama 3 style: train mostly at 8K, then a long-context stage up to 128K. Exact recipes vary by lab.",
    "pattern": "Extend context by rescaling RoPE frequencies, then fine-tune on long data."
  },
  {
    "id": "llm-p3-06",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Chen et al. 2023, Positional Interpolation (arXiv 2306.15595); Peng et al. 2023, YaRN (arXiv 2309.00071)",
    "chapter": "W12 Context extension: PI and YaRN",
    "prompt": "What is Position Interpolation (PI), and why does it work better than extrapolation?",
    "answer": "A RoPE model trained on context L sees only rotation angles m * theta_i for positions m < L. Running at L' > L means angles it never saw, and attention scores can blow up.\nPI rescales positions instead: use m * L / L' so every position in the long context maps into the trained range [0, L). Then fine-tune briefly at the new length.\nWhy it works: the paper shows the upper bound on attention-score error from interpolating between trained positions is much smaller than from extrapolating beyond them, so the model starts near a good solution.\nResult: LLaMA models extended to 32K context with about 1000 fine-tuning steps.\nWeakness: it compresses every frequency equally. High-frequency dimensions (which resolve nearby tokens) get squeezed so neighbors are harder to tell apart, which motivates NTK-aware and YaRN scaling.",
    "pattern": "Scale position m by L / L' to stay inside the trained range, then fine-tune briefly. It squeezes every frequency."
  },
  {
    "id": "llm-p3-07",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Chen et al. 2023, Positional Interpolation (arXiv 2306.15595); Peng et al. 2023, YaRN (arXiv 2309.00071)",
    "chapter": "W12 Context extension: PI and YaRN",
    "prompt": "What do NTK-aware scaling and YaRN change compared to PI?",
    "answer": "RoPE dimension pair i rotates with theta_i = b^(-2i/d); low i means high frequency (short wavelength), high i means low frequency.\nNTK-aware: instead of scaling positions, raise the base b (e.g. b' = b * s^(d / (d - 2)) for scale s), which barely changes high-frequency dims and interpolates low-frequency dims. It was proposed in community posts and works decently even without fine-tuning.\nYaRN combines two pieces:\n1. NTK-by-parts: per dimension, compare its wavelength to the original context length. Dimensions with wavelength much shorter than L are left alone (they never saw a full rotation problem), dimensions with wavelength longer than L are interpolated fully like PI, with a linear ramp between.\n2. Attention temperature: scale the logits by 1/t, with sqrt(1/t) = 0.1 ln(s) + 1, which counteracts the entropy increase of attention over more tokens.\nThe paper reports reaching long contexts with about 10x fewer tokens and 2.5x fewer training steps than previous methods.",
    "pattern": "NTK-aware raises the RoPE base. YaRN: interpolate only long-wavelength dims (ramp between) plus temperature 0.1 ln s + 1."
  },
  {
    "id": "llm-p3-08",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Chen et al. 2023, Positional Interpolation (arXiv 2306.15595); Peng et al. 2023, YaRN (arXiv 2309.00071)",
    "chapter": "W12 Context extension: PI and YaRN",
    "prompt": "How do you evaluate whether context extension actually worked?",
    "answer": "1. Perplexity by position: evaluate long documents and plot loss against token position (or sliding-window perplexity at several lengths). Loss should keep falling or stay flat past the old limit, not explode. Necessary but not sufficient: a model can have fine perplexity while ignoring distant context.\n2. Synthetic retrieval: passkey retrieval (find a number hidden in filler), needle in a haystack at many depths and lengths. Easy; treat as a smoke test.\n3. Harder synthetic suites such as RULER: multiple needles, multi-hop variable tracing, aggregation over the context. These separate real long-context use from simple lookup.\n4. Real tasks: long-document QA, summarization, repository-level code.\n5. Check that short-context benchmarks did not regress.",
    "pattern": "Perplexity by position, passkey and needles, harder suites like RULER, real long tasks, and no short-context regression."
  },
  {
    "id": "llm-p3-build-02",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Chen et al. 2023, Positional Interpolation (arXiv 2306.15595); Peng et al. 2023, YaRN (arXiv 2309.00071)",
    "chapter": "W12 Context extension: PI and YaRN",
    "prompt": "Build this (W12): Context extension experiment",
    "answer": "Spec: Take a RoPE model trained at context L (your own GPT at 1K, or a small open model) and extend it to 4x L with PI, NTK-aware scaling and YaRN under the same short fine-tuning budget.\n\nSteps:\n1. Implement the three schemes as functions that produce the RoPE frequency (and temperature) tables, with unit tests on the tables.\n2. Evaluate zero-shot (no fine-tune) and after N steps of fine-tuning at 4x L for each method, same data and seed.\n3. Measure loss by position out to 4x L, and passkey accuracy at several depths and lengths.\n4. Repeat fine-tuning with 2 more seeds for the best two methods.\n\nSuccess looks like: A loss-by-position plot where the unmodified model blows up past L and the methods do not; a passkey heatmap per method; and a clear statement of which method wins at your scale, with seed variation shown.",
    "pattern": "Build this: Context extension experiment"
  },
  {
    "id": "llm-tf-24",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Fedus et al. 2021, Switch Transformers (arXiv 2101.03961); Dai et al. 2024, DeepSeekMoE (arXiv 2401.06066)",
    "chapter": "W13 Mixture of Experts: Switch and DeepSeekMoE",
    "prompt": "How does a Mixture-of-Experts layer work, and what do 'total' vs 'active' parameters mean?",
    "answer": "Replace the dense MLP with E expert MLPs plus a router. For each token the router scores the experts and sends the token to the top-k (often k=2 of 8, or more fine-grained like 8 of 256), and the outputs are combined with the router weights.\nTotal params: all experts (sets memory). Active params: what one token uses (sets FLOPs per token).\nMixtral 8x7B: about 46.7B total, about 12.9B active. DeepSeek-V3: 671B total, 37B active.\nYou get more capacity per FLOP, but need all experts in memory and good load balancing.",
    "pattern": "MoE: params scale with experts, FLOPs scale with top-k. Memory still holds all."
  },
  {
    "id": "llm-tf-25",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Fedus et al. 2021, Switch Transformers (arXiv 2101.03961); Dai et al. 2024, DeepSeekMoE (arXiv 2401.06066)",
    "chapter": "W13 Mixture of Experts: Switch and DeepSeekMoE",
    "prompt": "What goes wrong in MoE training and how is it handled?",
    "answer": "Load imbalance: the router sends most tokens to a few experts, which get overloaded while others never learn (collapse).\nFixes: an auxiliary load-balancing loss (Switch Transformer style), capacity limits with token dropping, router z-loss for stability, or DeepSeek-V3's bias-based auxiliary-loss-free balancing.\nSystems side: expert parallelism needs all-to-all communication to route tokens to the GPU holding each expert, which is often the bottleneck.",
    "pattern": "MoE pain = routing balance and all-to-all communication."
  },
  {
    "id": "llm-p3-09",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Fedus et al. 2021, Switch Transformers (arXiv 2101.03961); Dai et al. 2024, DeepSeekMoE (arXiv 2401.06066)",
    "chapter": "W13 Mixture of Experts: Switch and DeepSeekMoE",
    "prompt": "What design choices made the Switch Transformer work?",
    "answer": "Top-1 routing: each token goes to a single expert, which halves routing compute and communication compared to top-2 and simplifies the implementation.\nExpert capacity: capacity = (tokens per batch / number of experts) * capacity factor. Tokens beyond an expert's capacity are dropped from that layer and pass through on the residual connection. A capacity factor a little above 1 trades memory and compute for fewer dropped tokens.\nLoad-balancing auxiliary loss: alpha * N * sum_i f_i * P_i, with f_i the fraction of tokens routed to expert i, P_i the mean router probability for expert i, N experts, alpha = 0.01.\nStability: router computation in float32 (selective precision) while the rest runs in bfloat16, and a smaller weight initialization scale.\nResult: large pretraining speedups over dense T5 baselines at the same FLOPs per token, scaling to over a trillion parameters.",
    "pattern": "Top-1 routing, capacity factor with dropped tokens, aux loss alpha N sum f_i P_i, fp32 router, smaller init."
  },
  {
    "id": "llm-p3-10",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Fedus et al. 2021, Switch Transformers (arXiv 2101.03961); Dai et al. 2024, DeepSeekMoE (arXiv 2401.06066)",
    "chapter": "W13 Mixture of Experts: Switch and DeepSeekMoE",
    "prompt": "Compute the Switch load-balancing loss term N * sum_i f_i P_i for 4 experts, when perfectly balanced and when f = [0.7, 0.1, 0.1, 0.1], P = [0.6, 0.13, 0.13, 0.14].",
    "answer": "Balanced: f_i = P_i = 0.25, so sum f_i P_i = 4 * 0.0625 = 0.25, times N = 4 gives 1.0.\nImbalanced: 0.7 * 0.6 + 0.1 * 0.13 + 0.1 * 0.13 + 0.1 * 0.14 = 0.42 + 0.013 + 0.013 + 0.014 = 0.46, times 4 gives 1.84.\nSo 1.0 is the value under uniform routing (the minimum when f and P are both uniform), and imbalance raises it. Multiply by alpha = 0.01 for the actual loss added.\nGradients only flow through P (f comes from an argmax and is not differentiable). Because experts with large f get a larger weight on their P_i, the gradient pushes router probability away from overloaded experts.",
    "pattern": "Balanced gives 1.0; the skewed example gives 1.84. Gradient flows through P, weighted by f."
  },
  {
    "id": "llm-p3-11",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Fedus et al. 2021, Switch Transformers (arXiv 2101.03961); Dai et al. 2024, DeepSeekMoE (arXiv 2401.06066)",
    "chapter": "W13 Mixture of Experts: Switch and DeepSeekMoE",
    "prompt": "What are DeepSeekMoE's two ideas? Work out the routing-combination example.",
    "answer": "1. Fine-grained expert segmentation: split each expert into m smaller experts (FFN hidden size / m) and activate m times as many per token. FLOPs and parameters stay the same, but the number of possible expert combinations explodes, so experts can specialize more finely.\nExample from the paper: 16 experts with top-2 gives C(16, 2) = 120 combinations. Splitting each into 4 gives 64 experts with top-8: C(64, 8) = 4,426,165,368 combinations.\n2. Shared expert isolation: a few experts are always active for every token. They capture common knowledge, so routed experts do not each have to relearn it, reducing redundancy among routed experts.\nThese became the template for DeepSeek-V2/V3 and many later MoEs (for example Kimi Linear uses 256 experts with 8 active including 1 shared).",
    "pattern": "Many small experts (C(16,2) = 120 vs C(64,8) = 4.4 billion combinations) plus always-on shared experts."
  },
  {
    "id": "llm-p3-build-03",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Fedus et al. 2021, Switch Transformers (arXiv 2101.03961); Dai et al. 2024, DeepSeekMoE (arXiv 2401.06066)",
    "chapter": "W13 Mixture of Experts: Switch and DeepSeekMoE",
    "prompt": "Build this (W13): Tiny MoE with load-balance plots",
    "answer": "Spec: Replace the MLP in your GPT with an MoE layer (8 experts, top-2, optionally 1 shared expert) and study routing, with and without the auxiliary loss.\n\nSteps:\n1. Implement the router (softmax over experts, top-k, renormalize the selected weights), expert dispatch with a capacity factor, and the aux loss.\n2. Log per-layer, per-expert token fractions every N steps, plus the number of dropped tokens.\n3. Runs: dense baseline with the same active parameters; MoE without aux loss; MoE with aux loss; MoE with aux loss plus a shared expert. Same tokens, 2 to 3 seeds each.\n4. Plot validation loss against tokens and a heatmap of expert load over training.\n\nSuccess looks like: Without the aux loss you see load collapse (a few experts take most tokens); with it the load is near uniform; the MoE beats the dense model at equal active FLOPs. Every claim comes with seed variation.",
    "pattern": "Build this: Tiny MoE with load-balance plots"
  },
  {
    "id": "llm-tf-27",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Katharopoulos et al. 2020, Transformers are RNNs (arXiv 2006.16236); Yang et al. 2023, Gated Linear Attention (arXiv 2312.06635)",
    "chapter": "W14 Linear attention and GLA",
    "prompt": "Name three alternatives to full softmax attention and how seriously each is taken in 2026.",
    "answer": "1. Sliding-window or local attention (Mistral 7B, Gemma interleaves local and global layers): cuts KV cache and cost at long context. Widely used in hybrids.\n2. State-space and linear-recurrent models (Mamba family, RWKV): constant memory per token. Used mostly in hybrids that mix some attention layers back in.\n3. Linear attention variants: replace softmax with a kernel so cost is linear in T. Quality has historically lagged.\nFull attention is still the core of frontier models; hybrids are an active area and results vary.",
    "pattern": "Local attention and SSM hybrids are real. Full attention still dominates."
  },
  {
    "id": "llm-p3-12",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Katharopoulos et al. 2020, Transformers are RNNs (arXiv 2006.16236); Yang et al. 2023, Gated Linear Attention (arXiv 2312.06635)",
    "chapter": "W14 Linear attention and GLA",
    "prompt": "Derive causal linear attention as an RNN (Katharopoulos et al. 2020).",
    "answer": "Softmax attention output for query t: o_t = sum_{j<=t} sim(q_t, k_j) v_j / sum_{j<=t} sim(q_t, k_j), with sim = exp(q . k / sqrt(d)).\nReplace sim with a kernel feature map: sim(q, k) = phi(q)^T phi(k), with phi(x) = elu(x) + 1 (positive) in the paper.\nThen o_t = phi(q_t)^T (sum_{j<=t} phi(k_j) v_j^T) / phi(q_t)^T (sum_{j<=t} phi(k_j)).\nDefine the state S_t = S_{t-1} + phi(k_t) v_t^T (a d_k x d_v matrix) and z_t = z_{t-1} + phi(k_t).\nOutput: o_t = S_t^T phi(q_t) / (z_t . phi(q_t)).\nSo it is an RNN with a matrix-valued state: O(1) time and memory per decoding step, O(T d^2) total, no KV cache that grows with T. Many later variants drop the normalizer z and add a norm on the output instead.",
    "pattern": "phi(q)^T phi(k) replaces exp; state S_t = S_{t-1} + phi(k_t) v_t^T; o_t = S_t^T phi(q_t) / normalizer."
  },
  {
    "id": "llm-p3-13",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Katharopoulos et al. 2020, Transformers are RNNs (arXiv 2006.16236); Yang et al. 2023, Gated Linear Attention (arXiv 2312.06635)",
    "chapter": "W14 Linear attention and GLA",
    "prompt": "Linear attention has a parallel form, a recurrent form and a chunkwise form. What is each, and what do they cost?",
    "answer": "Ignore the normalizer and take phi as identity for clarity: o_t = sum_{j<=t} (q_t . k_j) v_j.\nParallel: O = ((Q K^T) * M) V with M the causal mask. O(T^2 d) FLOPs, matmul friendly, used for training short sequences.\nRecurrent: S_t = S_{t-1} + k_t v_t^T, o_t = S_t^T q_t. O(T d^2) FLOPs but sequential in T and made of small outer products, so poor GPU utilization in training. Ideal for decoding.\nChunkwise: split into chunks of size C. Carry the state S at chunk boundaries (one matmul per chunk: S += K_c^T V_c). Inside a chunk, use the parallel form for intra-chunk terms plus Q_c S for the contribution of earlier chunks.\nO(T C d + T d^2) FLOPs, mostly matmuls, sequential only over T / C chunks. This is the form used by FLA kernels for training.\nAll three compute the same outputs, which is exactly what you test in the W14 build.",
    "pattern": "Parallel O(T^2 d), recurrent O(T d^2) but sequential, chunkwise O(T C d + T d^2) with matmuls. Same outputs."
  },
  {
    "id": "llm-p3-14",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Katharopoulos et al. 2020, Transformers are RNNs (arXiv 2006.16236); Yang et al. 2023, Gated Linear Attention (arXiv 2312.06635)",
    "chapter": "W14 Linear attention and GLA",
    "prompt": "Why did plain linear attention underperform softmax attention, especially on recall?",
    "answer": "1. No forgetting: S_t = S_{t-1} + k_t v_t^T only adds. Old associations are never removed, so the state accumulates interference.\n2. Fixed capacity: the state is d_k x d_v regardless of T. It can store roughly d_k near-orthogonal key-value pairs cleanly; beyond that, retrieval of a specific earlier token is noisy. Softmax attention keeps all T keys and can retrieve any of them exactly.\n3. Weak focus: kernel feature maps produce flatter, less selective weights than exp, so it is hard to attend sharply to one token.\nWork on associative recall (for example the Zoology study by Arora et al. 2023, with its multi-query associative recall task) showed this recall gap clearly.\nThe fixes define the next weeks: data-dependent gates for forgetting (GLA, Mamba), the delta rule for targeted overwriting (DeltaNet), both (Gated DeltaNet, KDA), and hybrids that keep a few full-attention layers.",
    "pattern": "Adds only (no forgetting), fixed-size state, flat weights. Recall suffers; gates and the delta rule fix it."
  },
  {
    "id": "llm-p3-15",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Katharopoulos et al. 2020, Transformers are RNNs (arXiv 2006.16236); Yang et al. 2023, Gated Linear Attention (arXiv 2312.06635)",
    "chapter": "W14 Linear attention and GLA",
    "prompt": "What does Gated Linear Attention (GLA) add, and how is it trained efficiently?",
    "answer": "Update: S_t = Diag(alpha_t) S_{t-1} + k_t v_t^T, output o_t = S_t^T q_t, with S_t of shape d_k x d_v.\nalpha_t is in (0, 1)^d_k, computed from the input x_t through a low-rank projection and a sigmoid. It is data dependent and per channel (each key dimension forgets at its own rate).\nEffect: the model decides, per token and per channel, how much of the old memory to keep, which addresses linear attention's lack of forgetting.\nTraining: the paper gives a hardware-efficient chunkwise algorithm (FlashLinearAttention), folding cumulative products of the gates into the chunk computation and using tensor-core matmuls, and implemented it in Triton. That kernel work grew into the flash-linear-attention (FLA) library.",
    "pattern": "S_t = Diag(alpha_t) S_{t-1} + k_t v_t^T with a data-dependent per-channel gate; chunkwise Triton kernels."
  },
  {
    "id": "llm-p3-build-04",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Katharopoulos et al. 2020, Transformers are RNNs (arXiv 2006.16236); Yang et al. 2023, Gated Linear Attention (arXiv 2312.06635)",
    "chapter": "W14 Linear attention and GLA",
    "prompt": "Build this (W14): Recurrent vs parallel forms, checked equal",
    "answer": "Spec: Implement linear attention and GLA in three forms each (parallel masked, recurrent loop, chunkwise) and prove numerically that they compute the same function.\n\nSteps:\n1. Write the recurrent form first; it is the definition.\n2. Write the parallel form (for GLA, build the decay matrix from cumulative log gates; do the math in log space for stability).\n3. Write the chunkwise form with chunk size C as a parameter.\n4. Test: random inputs, several T and C (including T not divisible by C), assert max difference below 1e-5 in fp32, and gradients equal too.\n5. Time all three on GPU as T grows; compare with FLA's kernels if available.\n\nSuccess looks like: All forms agree for outputs and gradients; your plot shows the parallel form growing quadratically, the recurrent form slow but linear, and the chunkwise form fastest at long T.",
    "pattern": "Build this: Recurrent vs parallel forms, checked equal"
  },
  {
    "id": "llm-p3-16",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Gu and Dao 2023, Mamba (arXiv 2312.00752); Dao and Gu 2024, Mamba-2 / SSD (arXiv 2405.21060)",
    "chapter": "W15 State space models: Mamba and Mamba-2",
    "prompt": "What is a state space model layer, and how is it discretized?",
    "answer": "Continuous SSM for each input channel: h'(t) = A h(t) + B x(t), y(t) = C h(t), with state h of size N.\nDiscretize with step size Delta. Zero-order hold gives:\nA_bar = exp(Delta A), B_bar = (Delta A)^-1 (exp(Delta A) - I) Delta B\nRecurrence: h_t = A_bar h_{t-1} + B_bar x_t, y_t = C h_t.\nIf A, B, C, Delta do not depend on the input (S4 and similar), the whole map is a convolution of x with the kernel (C B_bar, C A_bar B_bar, C A_bar^2 B_bar, ...), so training can use FFT convolutions, and inference uses the recurrence.\nStructured A (diagonal or diagonal plus low rank) keeps this cheap. Diagonal A makes exp(Delta A) elementwise.",
    "pattern": "h_t = exp(Delta A) h_{t-1} + B_bar x_t, y_t = C h_t. Time-invariant parameters give a convolution."
  },
  {
    "id": "llm-p3-17",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Gu and Dao 2023, Mamba (arXiv 2312.00752); Dao and Gu 2024, Mamba-2 / SSD (arXiv 2405.21060)",
    "chapter": "W15 State space models: Mamba and Mamba-2",
    "prompt": "What does 'selective' mean in Mamba, and what did it cost and gain?",
    "answer": "Mamba makes Delta, B and C functions of the current input x_t (linear projections), so the recurrence varies over time. A stays a learned diagonal parameter, but A_bar = exp(Delta_t A) now depends on the input through Delta_t.\nGain: content-based selection. Large Delta_t means A_bar near 0 (reset the state, focus on the current input); small Delta_t means A_bar near I (ignore this token, keep the memory). Delta acts like an input-dependent forget and input gate, which time-invariant SSMs cannot do. This fixes tasks like selective copying and induction heads that S4 fails.\nCost: no longer a convolution, so no FFT training. Mamba uses a hardware-aware parallel scan that keeps the expanded state in SRAM and recomputes it in the backward pass instead of storing it.\nBlock: one homogeneous block combining the SSM with a gated MLP-like path and a short causal convolution; no attention and no separate MLP block.",
    "pattern": "Delta, B, C depend on the input; Delta acts as a gate. No convolution, so a fused scan in SRAM."
  },
  {
    "id": "llm-p3-18",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Gu and Dao 2023, Mamba (arXiv 2312.00752); Dao and Gu 2024, Mamba-2 / SSD (arXiv 2405.21060)",
    "chapter": "W15 State space models: Mamba and Mamba-2",
    "prompt": "What is the structured state space duality (SSD) in Mamba-2?",
    "answer": "Restrict A_t to a scalar times identity per head (a_t I). Then unroll the recurrence:\ny_t = sum_{s<=t} C_t^T (a_t a_{t-1} ... a_{s+1}) B_s x_s\nIn matrix form: Y = (L * (C B^T)) X, where L_ts = product of a from s+1 to t for s <= t, and 0 above the diagonal.\nThat is masked linear attention with C playing the query, B the key, X the value, and L a data-dependent decay mask. The matrix is semiseparable, so it has both a quadratic (attention-like) form and a linear (recurrent) form.\nPayoff: a chunkwise algorithm using matmuls (tensor cores) inside chunks and the recurrence across chunks, allowing much larger state sizes than Mamba-1, with the paper reporting a 2 to 8x faster core layer. The scalar decay is the same as the head-wise gate in Gated DeltaNet's convention: S_t = a_t S_{t-1} + k_t v_t^T.",
    "pattern": "Scalar A per head makes the SSM equal to masked linear attention with a decay mask: Y = (L * C B^T) X."
  },
  {
    "id": "llm-p3-build-05",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Gu and Dao 2023, Mamba (arXiv 2312.00752); Dao and Gu 2024, Mamba-2 / SSD (arXiv 2405.21060)",
    "chapter": "W15 State space models: Mamba and Mamba-2",
    "prompt": "Build this (W15): SSM explainer post",
    "answer": "Spec: A post that explains SSMs, selectivity and SSD to someone who knows attention, backed by a minimal implementation.\n\nSteps:\n1. Implement a selective SSM recurrence in plain PyTorch (sequential loop) for one head with scalar decay.\n2. Implement the SSD quadratic form Y = (L * C B^T) X and a chunked version; assert all three match.\n3. Visualize the L mask for a sequence where Delta spikes on a few tokens, showing resets.\n4. Write the post: continuous SSM, discretization, why selectivity matters, the duality picture with your figures.\n\nSuccess looks like: All implementations agree, the figures make the decay mask intuitive, and a reader can see in one picture why Mamba-2 is masked linear attention.",
    "pattern": "Build this: SSM explainer post"
  },
  {
    "id": "llm-p3-19",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Yang et al. 2024, Parallelizing Linear Transformers with the Delta Rule (arXiv 2406.06484); Songlin Yang's DeltaNet blog posts",
    "chapter": "W16 DeltaNet and the delta rule",
    "prompt": "Derive the DeltaNet update as one step of online gradient descent on a regression loss.",
    "answer": "Treat the state S (d_k x d_v) as an associative memory that maps keys to values: read with S^T k.\nAt step t we want S^T k_t to equal v_t. Loss: L_t(S) = 1/2 |S^T k_t - v_t|^2.\nGradient: grad L_t = k_t (S^T k_t - v_t)^T.\nOne gradient step with learning rate beta_t:\nS_t = S_{t-1} - beta_t k_t (S_{t-1}^T k_t - v_t)^T\n    = S_{t-1} - beta_t k_t k_t^T S_{t-1} + beta_t k_t v_t^T\n    = (I - beta_t k_t k_t^T) S_{t-1} + beta_t k_t v_t^T\nOutput o_t = S_t^T q_t.\nLinear attention is the same thing minimizing a different, linear loss (-<S^T k, v>), whose gradient ignores what is already stored; the delta rule first subtracts the current prediction. beta_t in (0, 1) comes from a sigmoid of the input.",
    "pattern": "Online GD on 1/2 |S^T k - v|^2: S_t = (I - beta k k^T) S_{t-1} + beta k v^T."
  },
  {
    "id": "llm-p3-20",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Yang et al. 2024, Parallelizing Linear Transformers with the Delta Rule (arXiv 2406.06484); Songlin Yang's DeltaNet blog posts",
    "chapter": "W16 DeltaNet and the delta rule",
    "prompt": "Why does the delta rule fix linear attention's retrieval problem? Show what happens when you write the same key twice.",
    "answer": "Write as read-then-correct: v_old = S_{t-1}^T k_t (what the memory currently returns for k_t), then S_t = S_{t-1} + beta_t k_t (v_t - v_old)^T.\nOnly the error is written. If the key is already stored with the right value, nothing changes. If it is stored with a stale value, it is overwritten rather than summed.\nWith |k_t| = 1 and beta_t = 1: S_t^T k_t = S_{t-1}^T k_t - k_t^T k_t S_{t-1}^T k_t + v_t (k_t^T k_t) = v_old - v_old + v_t = v_t. The memory returns exactly the new value.\nPlain linear attention after writing (k, v1) then (k, v2) returns about v1 + v2: interference. DeltaNet returns v2.\nThat is why DeltaNet does much better than linear attention on associative recall tasks like MQAR, and why L2-normalizing keys (part of the DeltaNet design) matters: the update is a Householder-like projection only when |k| = 1.",
    "pattern": "It writes only the error v - S^T k. With |k| = 1, beta = 1 the memory returns exactly the new value."
  },
  {
    "id": "llm-p3-21",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Yang et al. 2024, Parallelizing Linear Transformers with the Delta Rule (arXiv 2406.06484); Songlin Yang's DeltaNet blog posts",
    "chapter": "W16 DeltaNet and the delta rule",
    "prompt": "The delta rule looks sequential. How is DeltaNet trained in parallel over the sequence?",
    "answer": "Unrolling S_t = (I - beta_t k_t k_t^T) S_{t-1} + beta_t k_t v_t^T over a chunk gives products of matrices of the form (I - beta k k^T), which are generalized Householder transformations.\nYang et al. (2024) use the WY representation: a product of such matrices can be written compactly as I - W^T K (low-rank in the chunk), so within a chunk the state update and outputs can be computed with matmuls after building W (and a similar U for the values).\nBuilding W and U requires solving a small lower-triangular system per chunk (the UT transform), done once per chunk.\nThen the chunkwise algorithm is like linear attention's: matmuls inside chunks, a state passed between chunks, with memory-efficient Triton kernels.\nThis is the result that made DeltaNet practical at scale, and Gated DeltaNet and KDA reuse the same machinery with gates added.",
    "pattern": "Products of (I - beta k k^T) compress via the WY representation (UT transform per chunk), so chunks become matmuls."
  },
  {
    "id": "llm-p3-22",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Yang et al. 2024, Parallelizing Linear Transformers with the Delta Rule (arXiv 2406.06484); Songlin Yang's DeltaNet blog posts",
    "chapter": "W16 DeltaNet and the delta rule",
    "prompt": "What does a DeltaNet layer look like in practice, beyond the update rule?",
    "answer": "Typical layer (as implemented in FLA and described in the DeltaNet and Kimi Linear papers):\n- q, k, v from linear projections of x, each passed through a short causal depthwise convolution and a SiLU\n- q and k L2-normalized per head (keeps the update a stable projection and bounds the state)\n- beta_t = sigmoid(linear(x_t)), one scalar per head\n- recurrence or chunkwise kernel per head\n- output normalized (e.g. RMSNorm per head), often multiplied by an output gate from x, then projected\nThe short convolution gives cheap local token mixing and noticeably helps recall; normalization keeps training stable. When you compare variants, keep these pieces fixed and change only the update rule, or you are ablating more than one thing.",
    "pattern": "Short conv plus SiLU on q, k, v; L2-norm q and k; sigmoid beta; output norm and gate."
  },
  {
    "id": "llm-p3-build-06",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Yang et al. 2024, Parallelizing Linear Transformers with the Delta Rule (arXiv 2406.06484); Songlin Yang's DeltaNet blog posts",
    "chapter": "W16 DeltaNet and the delta rule",
    "prompt": "Build this (W16): DeltaNet explainer",
    "answer": "Spec: A post that derives DeltaNet, shows why it beats linear attention on recall, and verifies a naive implementation against an FLA kernel.\n\nSteps:\n1. Write a naive recurrent DeltaNet in PyTorch (loop over t, per head).\n2. If you have a GPU, compare outputs and gradients with FLA's chunk kernel for DeltaNet on random inputs (check the current function names in the repo).\n3. Build a tiny MQAR (multi-query associative recall) task; train 2-layer models with linear attention vs DeltaNet at the same width; plot accuracy vs number of key-value pairs.\n4. Post: online-regression derivation, the overwrite example, the MQAR plot.\n\nSuccess looks like: Naive and kernel outputs match within tolerance, and the MQAR plot shows DeltaNet holding accuracy at numbers of pairs where linear attention collapses.",
    "pattern": "Build this: DeltaNet explainer"
  },
  {
    "id": "llm-p3-23",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: the flash-linear-attention (FLA) repository",
    "chapter": "W17 FLA internals and your first PR",
    "prompt": "How is the flash-linear-attention (FLA) library organized, and how do you find your way around a kernel?",
    "answer": "Rough layout (check the current repo; it evolves):\n- fla/ops/<method>/: Triton kernels per method (gla, delta_rule, gated_delta_rule, kda and many others). Most provide a chunkwise kernel for training and a fused recurrent kernel for decoding, often with a naive PyTorch reference.\n- fla/layers/: nn.Module token-mixing layers that wrap the ops with projections, short convolutions, norms and gates.\n- fla/models/: full model definitions with Hugging Face style configs.\n- tests/ and benchmarks/: correctness against references, and speed.\nReading a kernel: start from the Python entry function, find its autograd.Function, read the forward launch sites, then each Triton kernel. Map every tensor's shape and which grid axis is which (batch, head, chunk). Compare with the naive reference line by line.",
    "pattern": "ops (chunk and fused_recurrent Triton kernels, naive refs), layers, models, tests. Read entry function, then Function, then kernels."
  },
  {
    "id": "llm-p3-24",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: the flash-linear-attention (FLA) repository",
    "chapter": "W17 FLA internals and your first PR",
    "prompt": "How do you make a first useful open-source contribution to a kernel library like FLA?",
    "answer": "1. Run the test suite and benchmarks locally first; note anything failing on your hardware or versions.\n2. Read open issues; good first targets are reproducible bugs on edge shapes (odd lengths, head dims, variable-length inputs), missing or weak tests, missing naive references, or documentation of a layer's math.\n3. For a bug: write a failing test first, then the fix, then show it passes and nothing else regresses.\n4. For performance: include before and after benchmarks on named hardware and confirm numerics did not change.\n5. Keep the PR small and focused, follow the repo's style and contributing guide, explain the math in the description, and respond quickly to review.\nSmall, correct, well-tested PRs build trust; a large unsolicited refactor usually does not get merged.",
    "pattern": "Failing test first, small focused fix, benchmarks for perf claims, follow the repo's conventions."
  },
  {
    "id": "llm-p3-build-07",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: the flash-linear-attention (FLA) repository",
    "chapter": "W17 FLA internals and your first PR",
    "prompt": "Build this (W17): First FLA PR",
    "answer": "Spec: One merged (or at least reviewed) pull request to flash-linear-attention: a bug fix, a test, a reference implementation or documentation that someone needed.\n\nSteps:\n1. Set up the repo, run tests, read issues for a week's worth of candidates.\n2. Pick something you can finish in a few days; comment on the issue to say you are working on it.\n3. Write the test, then the change; run the related tests and benchmarks.\n4. Open the PR with a clear description, math if relevant, and results; iterate on review.\n\nSuccess looks like: A PR link with green CI and a maintainer review. You can explain the code path you touched from Python entry point to Triton kernel.",
    "pattern": "Build this: First FLA PR"
  },
  {
    "id": "llm-p3-25",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Yang, Kautz, Hatamizadeh 2024, Gated Delta Networks (arXiv 2412.06464)",
    "chapter": "W18 Gated DeltaNet",
    "prompt": "Write the Gated DeltaNet update and explain why combining a gate with the delta rule helps.",
    "answer": "S_t = alpha_t (I - beta_t k_t k_t^T) S_{t-1} + beta_t k_t v_t^T, o_t = S_t^T q_t, with alpha_t in (0, 1) a scalar per head (data dependent) and beta_t in (0, 1).\nThe two mechanisms are complementary:\n- the gate alpha_t (as in Mamba-2) can rapidly erase or decay the whole memory, useful at context switches and for keeping the state from filling with stale content\n- the delta rule makes targeted updates to specific key-value associations without disturbing the rest\nGating alone forgets indiscriminately; the delta rule alone cannot quickly clear memory. Together they gave better language modeling, recall and length extrapolation than Mamba-2 and DeltaNet in the paper, and hybrids with some attention layers improved further.\nGated DeltaNet is used in production hybrid models (for example Qwen3-Next), and Kimi Linear's KDA refines its gate.",
    "pattern": "S_t = alpha_t (I - beta k k^T) S_{t-1} + beta k v^T: a scalar gate for fast erasing plus the delta rule for targeted writes."
  },
  {
    "id": "llm-p3-26",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Yang, Kautz, Hatamizadeh 2024, Gated Delta Networks (arXiv 2412.06464)",
    "chapter": "W18 Gated DeltaNet",
    "prompt": "Line up the update rules: linear attention, GLA, Mamba-2, DeltaNet, Gated DeltaNet, KDA (state S is d_k x d_v, output S^T q).",
    "answer": "Linear attention: S_t = S_{t-1} + k_t v_t^T\nMamba-2 (SSD): S_t = alpha_t S_{t-1} + k_t v_t^T (scalar decay per head)\nGLA: S_t = Diag(alpha_t) S_{t-1} + k_t v_t^T (per-channel decay)\nDeltaNet: S_t = (I - beta_t k_t k_t^T) S_{t-1} + beta_t k_t v_t^T\nGated DeltaNet: S_t = alpha_t (I - beta_t k_t k_t^T) S_{t-1} + beta_t k_t v_t^T (scalar gate plus delta)\nKDA: S_t = (I - beta_t k_t k_t^T) Diag(alpha_t) S_{t-1} + beta_t k_t v_t^T (per-channel gate plus delta)\nTwo axes: how forgetting works (none, scalar, per channel) and how writing works (additive vs delta rule). KDA is the corner with both the finest gate and the delta rule. Learning this table is half of P3.",
    "pattern": "Two axes: forgetting (none, scalar, per-channel) and writing (add vs delta). KDA = per-channel gate plus delta."
  },
  {
    "id": "llm-p3-build-08",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Yang, Kautz, Hatamizadeh 2024, Gated Delta Networks (arXiv 2412.06464)",
    "chapter": "W18 Gated DeltaNet",
    "prompt": "Build this (W18): SSM vs DeltaNet vs Gated DeltaNet comparison",
    "answer": "Spec: A controlled small-scale comparison of Mamba-2, DeltaNet and Gated DeltaNet token mixers (FLA layers) inside the same model and training setup.\n\nSteps:\n1. Fix everything except the token mixer: width, depth, MLP, norms, tokenizer, data, tokens, LR schedule (tune LR per arm briefly and say so).\n2. Match parameter counts within a few percent.\n3. Train each at 2 sizes for the same tokens, 3 seeds at the smaller size.\n4. Evaluate validation loss, an MQAR-style recall task, and throughput (tokens/s train, decode speed).\n\nSuccess looks like: A table with mean and spread over seeds, a loss-vs-tokens plot, a recall plot, and a conclusion that is honest about which differences are inside the noise.",
    "pattern": "Build this: SSM vs DeltaNet vs Gated DeltaNet comparison"
  },
  {
    "id": "llm-p3-27",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Kimi Team 2025, Kimi Linear (arXiv 2510.26692) and its repo",
    "chapter": "W19 Kimi Linear and Kimi Delta Attention",
    "prompt": "What is Kimi Delta Attention (KDA), and how does it differ from Gated DeltaNet?",
    "answer": "KDA update: S_t = (I - beta_t k_t k_t^T) Diag(alpha_t) S_{t-1} + beta_t k_t v_t^T, o_t = S_t^T q_t.\nDifference from Gated DeltaNet: the forget gate is per channel (Diag(alpha_t), a vector) instead of one scalar per head, so each key dimension decays at its own rate. That gives finer control over the finite memory, and in the hybrid it is what supplies positional information (see the NoPE card).\nEfficiency: the transition is a constrained diagonal-plus-low-rank (DPLR) matrix (in the paper's notation a = beta k and b = k * alpha). Tying these lets the chunkwise algorithm avoid much of the general DPLR computation, which the paper reports as roughly 2x faster than a general DPLR kernel. It reuses the WY representation and UT transform machinery from DeltaNet.",
    "pattern": "KDA = Gated DeltaNet with a per-channel Diag(alpha_t) gate; a constrained DPLR form makes the kernel about 2x faster than general DPLR."
  },
  {
    "id": "llm-p3-28",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Kimi Team 2025, Kimi Linear (arXiv 2510.26692) and its repo",
    "chapter": "W19 Kimi Linear and Kimi Delta Attention",
    "prompt": "Describe the Kimi Linear architecture and its headline results.",
    "answer": "Hybrid: 3 KDA layers for every 1 full global attention layer (MLA, multi-head latent attention). The MLA layers use no positional encoding (NoPE); KDA carries position and recency information.\nMoE: 48B total and 3B active parameters, 256 experts with 8 active per token, including 1 shared expert.\nFair comparison: trained on 1.4T tokens against full-attention MLA and Gated DeltaNet hybrid baselines with the same recipe; Kimi Linear did better across short-context, long-context and RL-style evaluations in the paper.\nEfficiency: up to 75% less KV cache and up to about 6x higher decoding throughput at 1M context.\nAblation: among KDA:MLA ratios the paper tried (including 0:1, 3:1, 7:1 and 15:1), 3:1 gave the best validation perplexity.\nTraining details from the report worth noting: the MuonClip optimizer and a WSD schedule; in RL, truncated importance sampling to handle train/inference mismatch.",
    "pattern": "3:1 KDA to NoPE MLA, 48B/3B MoE, 1.4T-token fair comparison, up to 75% less KV cache and about 6x decode at 1M."
  },
  {
    "id": "llm-p3-29",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Kimi Team 2025, Kimi Linear (arXiv 2510.26692) and its repo",
    "chapter": "W19 Kimi Linear and Kimi Delta Attention",
    "prompt": "Why does Kimi Linear use NoPE in its full-attention layers, and what does that buy?",
    "answer": "In a hybrid, the linear layers (KDA) process tokens in order with decaying gates, so position and recency are already encoded in their states; the design relies on KDA to supply positional information.\nSo the global MLA layers can drop RoPE entirely (NoPE) and act as pure content-based retrieval across the whole context.\nBenefits: no RoPE frequency choices to tune, and long-context extension does not need PI or YaRN style rescaling for those layers, since there are no rotation angles to go out of distribution. It also simplifies converting MLA to efficient inference forms.\nThe general lesson: in a hybrid, decide which layer type owns which job (local order and recency vs exact global retrieval).",
    "pattern": "KDA already encodes order, so global MLA layers do pure content retrieval without RoPE: nothing to rescale for long context."
  },
  {
    "id": "llm-p3-build-09",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Kimi Team 2025, Kimi Linear (arXiv 2510.26692) and its repo",
    "chapter": "W19 Kimi Linear and Kimi Delta Attention",
    "prompt": "Build this (W19): Gating ablation: Gated DeltaNet vs KDA-style gate",
    "answer": "Spec: Isolate the effect of gate granularity: scalar per head (GDN) vs per channel (KDA-style), with everything else identical.\n\nSteps:\n1. Use FLA layers or your own naive implementation; make the only difference the shape of alpha_t (scalar vs d_k vector, low-rank projected).\n2. Match parameters (the per-channel gate adds a small projection; compensate or report it).\n3. Train both at one or two small sizes, 3 seeds, same tokens; evaluate validation loss, MQAR recall, and loss by position on long documents.\n4. Optionally add a 3:1 hybrid with full attention for both variants.\n\nSuccess looks like: A clean table with seed spread showing whether the per-channel gate helps at your scale, and on which metric. A null result, clearly measured, counts.",
    "pattern": "Build this: Gating ablation: Gated DeltaNet vs KDA-style gate"
  },
  {
    "id": "llm-p3-30",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Kimi Team 2026, Attention Residuals (arXiv 2603.15031) and its repo; modded-nanogpt",
    "chapter": "W20 Attention Residuals",
    "prompt": "What problem does Attention Residuals (AttnRes) address, and what is the core idea?",
    "answer": "Problem (from the paper's abstract): with PreNorm, residual connections add every layer's output with fixed unit weights. This uniform aggregation lets the hidden state grow with depth and progressively dilutes each layer's contribution.\nIdea: replace the fixed sum with softmax attention over the outputs of preceding layers. Each layer forms its input as a learned, input-dependent weighted combination of earlier layer outputs, so it can select which earlier representations it needs (attention across depth rather than across tokens).\nThe paper reports that the improvement holds across model sizes in scaling-law experiments, that ablations support content-dependent depth-wise selection, and that it yields more uniform output magnitudes and gradient distribution across depth.\nFor the exact parameterization (what forms the queries and keys over layers, normalization), read the paper and the official repo; do not guess when you reproduce it.",
    "pattern": "Fixed unit-weight residual sums dilute layers; AttnRes lets each layer softmax-attend over earlier layer outputs."
  },
  {
    "id": "llm-p3-31",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Kimi Team 2026, Attention Residuals (arXiv 2603.15031) and its repo; modded-nanogpt",
    "chapter": "W20 Attention Residuals",
    "prompt": "What is Block AttnRes, and where has AttnRes been used at scale?",
    "answer": "Full AttnRes must keep all preceding layer outputs and attend over them, which costs memory and, under pipeline parallelism, communication between stages.\nBlock AttnRes partitions the layers into blocks and attends over block-level representations instead of every layer, reducing the memory footprint while keeping most of the gains (per the abstract). With cache-based pipeline communication and a two-phase computation strategy, the paper presents it as a practical drop-in replacement for standard residuals with minimal overhead.\nScale: integrated into the Kimi Linear architecture (48B total, 3B active) and pre-trained on 1.4T tokens, improving downstream performance across the evaluated tasks. The Kimi K3 report (2026) lists Attention Residuals, alongside KDA, as part of its architecture.",
    "pattern": "Attend over block summaries, not every layer, to save memory and pipeline traffic. Used in a 48B/3B Kimi Linear run and in Kimi K3."
  },
  {
    "id": "llm-p3-build-10",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: Kimi Team 2026, Attention Residuals (arXiv 2603.15031) and its repo; modded-nanogpt",
    "chapter": "W20 Attention Residuals",
    "prompt": "Build this (W20): AttnRes reproduction on modded-nanogpt",
    "answer": "Spec: Implement Attention Residuals (full, then block) in a modded-nanogpt style baseline and measure the effect at speedrun scale.\n\nSteps:\n1. Reproduce the baseline record (or a fixed-steps version of it) first, so you know its noise level over 3 or more seeds.\n2. Implement AttnRes exactly as the paper and repo specify; unit-test that it reduces to the standard residual under the right fixed weights.\n3. Compare validation loss at fixed steps (and at fixed wall clock) against the baseline, 3+ seeds each.\n4. Plot per-layer output norms and gradient norms across depth for both, to check the paper's dilution claim at small scale.\n\nSuccess looks like: Baseline reproduced within its known variance, a measured effect size with error bars, and depth-wise norm plots. Report honestly if the gain does not show up at this scale.",
    "pattern": "Build this: AttnRes reproduction on modded-nanogpt"
  },
  {
    "id": "llm-tf-22",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: modded-nanogpt (Keller Jordan and contributors); review of P3 papers",
    "chapter": "W21 Architecture map, attention variants and modded-nanogpt",
    "prompt": "MHA vs MQA vs GQA: what changes and what is the tradeoff?",
    "answer": "MHA: every query head has its own K and V head.\nMQA (Shazeer, 'Fast Transformer Decoding: One Write-Head is All You Need'): all query heads share one K and one V head. KV cache shrinks by the number of heads, but quality can drop.\nGQA (Ainslie et al.): query heads are split into groups, each group shares one K/V head. Llama 2 70B and Llama 3 use 8 KV heads; for 64 query heads that is an 8x smaller cache, with quality close to MHA.\nAttention params also shrink: for d=8192, 64 heads, 8 KV heads, per layer W_q and W_o are 8192^2 each, W_k and W_v are 8192 x 1024 each: 151M vs 268M for MHA.",
    "pattern": "GQA: share K/V across groups of query heads. Smaller cache, near-MHA quality."
  },
  {
    "id": "llm-tf-23",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: modded-nanogpt (Keller Jordan and contributors); review of P3 papers",
    "chapter": "W21 Architecture map, attention variants and modded-nanogpt",
    "prompt": "What is Multi-head Latent Attention (MLA), at a high level?",
    "answer": "Used in DeepSeek-V2 and V3. Instead of caching full per-head K and V, cache one compressed low-rank latent vector per token and project it up to K and V at attention time (with a small separate component for RoPE).\nResult: a KV cache much smaller than GQA at similar or better quality, at the cost of extra compute and implementation complexity.",
    "pattern": "MLA caches a low-rank latent instead of full K and V."
  },
  {
    "id": "llm-fd-23",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: modded-nanogpt (Keller Jordan and contributors); review of P3 papers",
    "chapter": "W21 Architecture map, attention variants and modded-nanogpt",
    "prompt": "What is Muon, and how settled is it?",
    "answer": "Muon (Keller Jordan, 2024; scaled up in Moonshot's 2025 'Muon is Scalable for LLM Training') applies to 2D weight matrices: take the momentum matrix and approximately orthogonalize it with a few Newton-Schulz iterations, so all singular directions get similar step sizes. Embeddings, the output head, and norms still use AdamW.\nReported results show better token efficiency than AdamW at some scales. It is promising but not yet a universal default across labs, so treat it as an active area.",
    "pattern": "Muon = orthogonalized momentum for matrices. Promising, not yet universal."
  },
  {
    "id": "llm-p3-32",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: modded-nanogpt (Keller Jordan and contributors); review of P3 papers",
    "chapter": "W21 Architecture map, attention variants and modded-nanogpt",
    "prompt": "What is modded-nanogpt, and why is it worth studying as a researcher?",
    "answer": "A community speedrun: train a GPT-2 small scale model on FineWeb to a fixed validation loss (3.28) on 8 x H100 as fast as possible. It started from Karpathy's llm.c GPT-2 baseline of about 45 minutes, and records have since dropped to a few minutes.\nEach record is a small, documented change with a measured time, for example the Muon optimizer, rotary embeddings, QK-norm, ReLU squared activations, architecture shortcuts and many systems tricks (read the record log in the README for the current list).\nWhy study it:\n- it is an unusually honest benchmark: fixed target, wall clock, public code, and rules about what counts\n- most changes are small enough to understand completely\n- it teaches the noise problem: record claims need multiple runs because gains of a few seconds are within run-to-run variation\nIt is also the base for the W20 AttnRes reproduction.",
    "pattern": "Speedrun to val loss 3.28 on 8xH100; each record is a small measured change (Muon, rotary, QK-norm, ReLU^2...)."
  },
  {
    "id": "llm-p3-33",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: modded-nanogpt (Keller Jordan and contributors); review of P3 papers",
    "chapter": "W21 Architecture map, attention variants and modded-nanogpt",
    "prompt": "Draw the architecture map: what are the main axes of LLM architecture choice in 2026, and what sits on each?",
    "answer": "Token mixing across the sequence:\n- softmax attention (MHA, then MQA/GQA and MLA to shrink the KV cache), made fast by IO-aware kernels (FlashAttention)\n- linear and recurrent mixers: linear attention, then gates (GLA, Mamba, Mamba-2), the delta rule (DeltaNet), both (Gated DeltaNet, KDA)\n- hybrids: a few full-attention layers among many linear ones (e.g. 3:1)\nChannel mixing per token: MLP, then GELU and SwiGLU, then MoE (Switch top-1, then fine-grained plus shared experts as in DeepSeekMoE)\nPositions: sinusoidal, learned, RoPE, then RoPE scaling (PI, NTK-aware, YaRN), and NoPE in hybrid global layers\nDepth and stability: post-norm, then pre-norm with RMSNorm, QK-norm, then learned depth mixing (Attention Residuals)\nOptimizer and schedule as part of the architecture: AdamW, Muon and MuonClip, WSD schedules, muP-style transfer\nFor each, know the problem it fixed, its cost, and one paper.",
    "pattern": "Token mixing, channel mixing, positions, depth/stability, optimizer. For each: problem fixed, cost, one paper."
  },
  {
    "id": "llm-p3-build-11",
    "deck": "P3 Architecture frontier (W11-21)",
    "source": "Plan reading: modded-nanogpt (Keller Jordan and contributors); review of P3 papers",
    "chapter": "W21 Architecture map, attention variants and modded-nanogpt",
    "prompt": "Build this (W21): Architecture map post",
    "answer": "Spec: A long-form post with one diagram that places every P3 paper on the map (token mixing, channel mixing, positions, depth), with one equation and one figure from your own experiments for each.\n\nSteps:\n1. Draw the map; for each node write the update rule or formula in the same notation.\n2. Link each node to your own W11 to W20 artifacts (kernels, plots, PRs).\n3. Write a section on open questions you would test next and why.\n4. Ask two people who know the field to check it for errors before posting.\n\nSuccess looks like: One consistent notation across all mixers, every claim either cited or backed by your own plot, and a reader comes away knowing why KDA and AttnRes exist.",
    "pattern": "Build this: Architecture map post"
  }
];
