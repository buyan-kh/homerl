import type { Question } from "../lib/types";

export const LLM_P7_INTERPRETABILITY: Question[] = [
  {
    "id": "llm-p7-01",
    "deck": "P7 Interpretability",
    "source": "Plan reading: Neel Nanda, getting started in mechanistic interpretability; TransformerLens; ARENA; Elhage et al. 2021, A Mathematical Framework for Transformer Circuits",
    "chapter": "Circuits, TransformerLens and ARENA",
    "prompt": "What are the QK and OV circuits of an attention head (A Mathematical Framework for Transformer Circuits)?",
    "answer": "In the residual-stream view, a head reads from the stream, computes attention, and writes back. Its parameters factor into two independent low-rank matrices:\n- QK circuit: W_Q^T W_K (d_model x d_model, rank at most d_head). It decides where to attend: score between a destination token x_i and source token x_j is x_i^T W_Q^T W_K x_j (ignoring positions and scaling).\n- OV circuit: W_O W_V (d_model x d_model). It decides what gets moved: if the head attends to x_j, it adds W_O W_V x_j to the destination.\nComposing with the embedding and unembedding, W_E^T W_Q^T W_K W_E gives token-to-token attention preferences and W_U W_O W_V W_E gives how attending to token a changes logits for token b.\nThe paper analyzes attention-only transformers: zero-layer models implement bigram statistics, one-layer models implement skip-trigrams, and two-layer models can compose heads (Q-, K- and V-composition), which enables induction heads.",
    "pattern": "QK = W_Q^T W_K decides where to look; OV = W_O W_V decides what to copy. Low rank, independent, composable across layers."
  },
  {
    "id": "llm-p7-02",
    "deck": "P7 Interpretability",
    "source": "Plan reading: Neel Nanda, getting started in mechanistic interpretability; TransformerLens; ARENA; Elhage et al. 2021, A Mathematical Framework for Transformer Circuits",
    "chapter": "Circuits, TransformerLens and ARENA",
    "prompt": "What is an induction head, and what evidence links induction heads to in-context learning?",
    "answer": "Mechanism (two heads in different layers): on a sequence like ... A B ... A, a previous-token head in an earlier layer writes \"the token before me was A\" into each position (so B's position carries information about A). In a later layer, the induction head at the second A uses K-composition to attend to the position whose previous token matches the current token, which is B, and its OV circuit copies B into the logits. Result: predicts B after A, completing [A][B] ... [A] -> [B].\nEvidence (Olsson et al. 2022, In-context Learning and Induction Heads): during training there is a sudden phase change where induction heads form, and at the same time the model's in-context learning score (how much loss drops for later tokens in the context) jumps; architectural changes that shift when induction heads can form shift the phase change accordingly. In small attention-only models the causal evidence is strong; for large models it is more correlational.\nTest it yourself: feed a repeated random token sequence; induction heads show a characteristic diagonal stripe offset by one in their attention pattern on the second repeat, and loss on the second half drops sharply.",
    "pattern": "Previous-token head plus K-composition: attend to the token after the earlier copy of the current token, copy it. Forms in a phase change."
  },
  {
    "id": "llm-p7-03",
    "deck": "P7 Interpretability",
    "source": "Plan reading: Neel Nanda, getting started in mechanistic interpretability; TransformerLens; ARENA; Elhage et al. 2021, A Mathematical Framework for Transformer Circuits",
    "chapter": "Circuits, TransformerLens and ARENA",
    "prompt": "What are the logit lens and activation patching, and what does each tell you?",
    "answer": "Logit lens: apply the final norm and unembedding to the residual stream after each layer, to see what the model would predict if it stopped there. Shows when an answer becomes linearly readable through depth. Cheap, but early layers may not be in the unembedding's basis (the tuned lens trains a per-layer translator to fix this).\nActivation patching (causal tracing): run a clean prompt and a corrupted prompt that differ in one key fact (e.g. \"The Eiffel Tower is in\" vs \"The Colosseum is in\"). Cache clean activations. Run the corrupted prompt, but overwrite one activation (a layer's residual at one position, one head's output) with its clean value. Measure how much of the clean behavior returns, using a metric like the logit difference between the two answers, normalized so 0 = corrupted and 1 = clean.\nPatching gives causal evidence about which components carry the information; the logit lens gives only correlational read-outs. Attribution patching approximates many patches at once with a gradient (first-order Taylor) and is much cheaper but less exact.\nClassic use: the IOI (indirect object identification) circuit in GPT-2 small (Wang et al. 2022), found mostly by path patching.",
    "pattern": "Logit lens: unembed intermediate residuals. Patching: put clean activations into a corrupted run and measure logit-difference recovery."
  },
  {
    "id": "llm-p7-04",
    "deck": "P7 Interpretability",
    "source": "Plan reading: Neel Nanda, getting started in mechanistic interpretability; TransformerLens; ARENA; Elhage et al. 2021, A Mathematical Framework for Transformer Circuits",
    "chapter": "Circuits, TransformerLens and ARENA",
    "prompt": "How do you use TransformerLens for a first experiment?",
    "answer": "import transformer_lens as tl\nmodel = tl.HookedTransformer.from_pretrained(\"gpt2-small\")\nlogits, cache = model.run_with_cache(\"When Mary and John went to the store, John gave a drink to\")\ncache[\"blocks.5.attn.hook_pattern\"]                 # (batch, head, query_pos, key_pos)\ncache[tl.utils.get_act_name(\"resid_post\", 5)]       # residual stream after block 5\n\ndef zero_head(z, hook, head=9):\n    z[:, :, head, :] = 0.0                          # hook_z: (batch, pos, head, d_head)\n    return z\npatched_logits = model.run_with_hooks(prompt_tokens,\n    fwd_hooks=[(\"blocks.9.attn.hook_z\", zero_head)])\n\nEvery activation has a named hook point (hook_resid_pre, hook_q, hook_k, hook_v, hook_z, hook_pattern, hook_mlp_out, ...). run_with_cache returns all of them; run_with_hooks lets you edit them during the forward pass, which is how ablation and patching are implemented. Models are loaded with weight-processing conventions (e.g. folded LayerNorm) that make the circuit math cleaner; know what was folded before comparing with Hugging Face outputs.",
    "pattern": "HookedTransformer.from_pretrained, run_with_cache to read any hook point, run_with_hooks to ablate or patch."
  },
  {
    "id": "llm-p7-05",
    "deck": "P7 Interpretability",
    "source": "Plan reading: Neel Nanda, getting started in mechanistic interpretability; TransformerLens; ARENA; Elhage et al. 2021, A Mathematical Framework for Transformer Circuits",
    "chapter": "Circuits, TransformerLens and ARENA",
    "prompt": "How do linear probes fit into interpretability, and what are their pitfalls?",
    "answer": "A linear probe is a logistic regression (or linear regression) trained on frozen activations to predict a property (part of speech, truth of a statement, board state in Othello-GPT).\nWhat it tells you: the information is linearly decodable at that layer. It does not show the model uses it; for that you need interventions (steering along the probe direction, patching, ablation) that change behavior as predicted.\nPitfalls:\n- a powerful probe can learn the task itself; compare with control tasks or random-feature baselines (selectivity)\n- spurious correlates in the dataset can be what the probe finds\n- report held-out accuracy and compare across layers\nProbes are cheap and strong baselines; some 2025 work found simple probes competitive with or better than SAE-based features on downstream detection tasks, which is part of an ongoing debate about how to use SAEs.",
    "pattern": "Probes show linear decodability, not use. Validate with interventions and control tasks. Strong, cheap baseline."
  },
  {
    "id": "llm-p7-build-01",
    "deck": "P7 Interpretability",
    "source": "Plan reading: Neel Nanda, getting started in mechanistic interpretability; TransformerLens; ARENA; Elhage et al. 2021, A Mathematical Framework for Transformer Circuits",
    "chapter": "Circuits, TransformerLens and ARENA",
    "prompt": "Build this: A small circuit-finding notebook",
    "answer": "Spec: Find and verify a small circuit in a small model (induction heads in a 2-layer attention-only model, or a slice of IOI in GPT-2 small) with TransformerLens, ARENA-style.\n\nSteps:\n1. Pick the behavior and a metric (loss on repeated tokens, or the IO-minus-S logit difference).\n2. Localize: attention patterns, then activation patching per layer and position, then per head.\n3. Explain: read the QK and OV circuits of the key heads (e.g. eigenvalue or copying scores for OV).\n4. Verify: ablate the circuit's heads and show the behavior drops; ablate random heads of equal count and show it does not.\n\nSuccess looks like: Patching heatmaps, a named set of heads with a mechanistic story, and an ablation result that confirms the story with a control.",
    "pattern": "Build this: A small circuit-finding notebook"
  },
  {
    "id": "llm-p7-06",
    "deck": "P7 Interpretability",
    "source": "Plan reading: Bricken et al. 2023, Towards Monosemanticity (Anthropic); Elhage et al. 2022, Toy Models of Superposition",
    "chapter": "Superposition, Towards Monosemanticity and SAEs",
    "prompt": "What is superposition, and what did Toy Models of Superposition show?",
    "answer": "Superposition: a network represents more features than it has dimensions, by assigning features to non-orthogonal directions and tolerating interference. It pays off when features are sparse (rarely active at the same time), so collisions are rare.\nToy Models of Superposition (Elhage et al. 2022): small ReLU models trained to reconstruct n sparse synthetic features through m < n hidden dimensions. Findings:\n- with dense features, the model keeps the most important m features and drops the rest\n- as sparsity increases, it packs more features into superposition, with phase changes between regimes\n- features arrange into geometric structures (pairs as antipodes, triangles, pentagons and other polytopes)\nConsequence: individual neurons are often polysemantic (respond to several unrelated features), so neuron-by-neuron interpretation fails. That motivates dictionary learning: find an overcomplete basis of directions where each one is a single feature.",
    "pattern": "More sparse features than dimensions, stored in almost-orthogonal directions. Neurons become polysemantic, so learn a dictionary."
  },
  {
    "id": "llm-p7-07",
    "deck": "P7 Interpretability",
    "source": "Plan reading: Bricken et al. 2023, Towards Monosemanticity (Anthropic); Elhage et al. 2022, Toy Models of Superposition",
    "chapter": "Superposition, Towards Monosemanticity and SAEs",
    "prompt": "Define a sparse autoencoder (SAE) for interpretability: architecture, loss and what each term does.",
    "answer": "Input: activations x in R^d (e.g. an MLP layer's output or the residual stream), often centered.\nEncoder: f = ReLU(W_enc (x - b_dec) + b_enc), with f in R^m and m much larger than d (an expansion factor like 8x to 256x or more).\nDecoder: x_hat = W_dec f + b_dec, with decoder columns (feature directions) constrained or normalized to unit norm.\nLoss: |x - x_hat|^2 + lambda * sum_i f_i |W_dec[:, i]|  (an L1 sparsity penalty on activations, weighted by decoder norms)\n- reconstruction: features must explain the activation\n- sparsity: only a few features active per input, which pushes each feature toward a single interpretable meaning\nEach learned feature i is a direction W_dec[:, i] with an activation f_i. Interpretation: look at top-activating examples, the logit effect W_U W_dec[:, i], and interventions (clamping a feature on or off and watching behavior).",
    "pattern": "f = ReLU(W_enc (x - b_dec) + b_enc), x_hat = W_dec f + b_dec, loss = MSE + lambda L1 on f. Overcomplete, unit-norm decoder."
  },
  {
    "id": "llm-p7-08",
    "deck": "P7 Interpretability",
    "source": "Plan reading: Bricken et al. 2023, Towards Monosemanticity (Anthropic); Elhage et al. 2022, Toy Models of Superposition",
    "chapter": "Superposition, Towards Monosemanticity and SAEs",
    "prompt": "What setup and findings did Towards Monosemanticity (Anthropic, 2023) report?",
    "answer": "Model: a one-layer transformer with a 512-neuron MLP layer, trained on a large text dataset.\nSAEs trained on the MLP activations with dictionaries from 512 up to over 100,000 features (the largest around 131k).\nFindings:\n- many learned features are far more monosemantic than neurons: e.g. features for Arabic script, DNA sequences, base64, Hebrew, specific code contexts\n- features were evaluated by humans and automated interpretability, and by intervention: activating a feature changes the model's outputs in the interpretable direction\n- feature splitting: as the dictionary grows, a broad feature splits into finer related features, so there is no single correct number of features\n- some features are universal across different models trained with different seeds\nTraining lessons: resampling dead features helps; the decoder normalization and the L1 coefficient set the sparsity tradeoff.\nFollow-up (Scaling Monosemanticity, 2024) applied SAEs to Claude 3 Sonnet's residual stream with millions of features, including abstract and safety-relevant ones.",
    "pattern": "One-layer model, 512-neuron MLP, SAEs up to ~131k features: monosemantic features, feature splitting, interventions confirm."
  },
  {
    "id": "llm-p7-09",
    "deck": "P7 Interpretability",
    "source": "Plan reading: Bricken et al. 2023, Towards Monosemanticity (Anthropic); Elhage et al. 2022, Toy Models of Superposition",
    "chapter": "Superposition, Towards Monosemanticity and SAEs",
    "prompt": "How are SAEs evaluated, and what are dead and dense features?",
    "answer": "Quantitative metrics:\n- L0: the average number of active features per input (sparsity). Lower is sparser.\n- Reconstruction: MSE or fraction of variance explained.\n- Downstream loss: splice the SAE reconstruction into the model in place of the real activation and measure the language-modeling loss. Report it as \"CE loss recovered\" relative to zero-ablating the activation (0%) and the clean model (100%). This is the metric that matters most; small MSE can still damage behavior.\n- The L0 vs loss-recovered frontier across sparsity settings is the standard comparison plot.\nQualitative: interpretability of features (human or automated scoring of top examples), and whether interventions behave as predicted.\nDead features: never activate on a large sample of data (wasted capacity); fixed by resampling or reinitializing them, or by architectures like TopK. Dense features: fire on a large fraction of inputs, often uninterpretable; a sign the L1 coefficient is too low or of training issues.",
    "pattern": "L0, variance explained, CE loss recovered (spliced in), the L0 vs loss frontier, plus interpretability. Watch dead and dense features."
  },
  {
    "id": "llm-p7-10",
    "deck": "P7 Interpretability",
    "source": "Plan reading: Bricken et al. 2023, Towards Monosemanticity (Anthropic); Elhage et al. 2022, Toy Models of Superposition",
    "chapter": "Superposition, Towards Monosemanticity and SAEs",
    "prompt": "What are TopK and JumpReLU SAEs, and why did they replace the plain L1 version in much recent work?",
    "answer": "Problem with L1: it shrinks all active feature magnitudes toward zero (shrinkage), trading reconstruction for sparsity in a biased way, and L0 is only indirectly controlled.\nTopK SAEs (Gao et al. 2024, OpenAI, Scaling and Evaluating Sparse Autoencoders): keep only the k largest pre-activations per input and zero the rest. L0 is exactly k, no L1 penalty is needed, there is no shrinkage, and they report clean scaling laws and fewer dead latents with their training tricks. They trained a 16 million latent SAE on GPT-4 activations.\nJumpReLU SAEs (Rajamanoharan et al. 2024, Google DeepMind): a ReLU with a learned per-feature threshold; values below the threshold are set to 0, above it pass unchanged. Trained with an L0 penalty using straight-through estimators. Used for Gemma Scope, an open suite of SAEs on every layer of Gemma 2 models.\nOpen debate: how faithful and useful SAE features are relative to simpler tools; several 2025 results found SAEs underperform linear probes on some downstream tasks. Treat SAEs as one tool with known limits.",
    "pattern": "TopK: keep k largest, L0 = k exactly, no shrinkage. JumpReLU: learned thresholds, L0 penalty (Gemma Scope). Usefulness still debated."
  },
  {
    "id": "llm-p7-build-02",
    "deck": "P7 Interpretability",
    "source": "Plan reading: Bricken et al. 2023, Towards Monosemanticity (Anthropic); Elhage et al. 2022, Toy Models of Superposition",
    "chapter": "Superposition, Towards Monosemanticity and SAEs",
    "prompt": "Build this: A small SAE with its features posted",
    "answer": "Spec: Train a sparse autoencoder on one layer of a small model (your own GPT, or GPT-2 small via TransformerLens) and publish an annotated set of features.\n\nSteps:\n1. Collect activations from one layer over tens of millions of tokens (stream them; do not store everything).\n2. Train a TopK SAE (or L1 with decoder normalization) at 2 or 3 sparsity levels; track L0, variance explained, dead features.\n3. Evaluate CE loss recovered by splicing the SAE into the forward pass.\n4. Inspect 50 random features: top-activating contexts and logit effects; label each as interpretable, partly, or not.\n5. Intervene on 3 features (clamp on or off) and show the predicted behavior change.\n\nSuccess looks like: An L0 vs loss-recovered plot, a dead-feature rate under a few percent, an honest interpretability tally on random (not cherry-picked) features, and 3 working interventions, posted with code.",
    "pattern": "Build this: A small SAE with its features posted"
  }
];
