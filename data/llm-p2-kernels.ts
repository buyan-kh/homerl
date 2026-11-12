import type { Question } from "../lib/types";

export const LLM_P2_KERNELS: Question[] = [
  {
    "id": "llm-p2-01",
    "deck": "P2 Kernels and GPUs",
    "source": "Plan reading: Edward Yang, PyTorch internals; PyTorch profiler and torch.compile tutorials",
    "chapter": "PyTorch internals, profiler and torch.compile",
    "prompt": "A PyTorch tensor is storage plus metadata. What are sizes, strides and storage offset? Give the strides for a contiguous (3, 4) float tensor, its transpose, and x[1:, :2].",
    "answer": "Storage: a flat 1D buffer of elements. The tensor is a view into it described by:\n- sizes: the shape\n- strides: how many elements to jump in storage to move one step along each dim\n- storage offset: where element [0, 0] lives\nElement [i, j] is at storage[offset + i * stride0 + j * stride1].\nContiguous (3, 4): strides (4, 1), offset 0.\nx.T: shape (4, 3), strides (1, 4), same storage, no copy. It is no longer contiguous (strides are not decreasing row-major).\nx[1:, :2]: shape (2, 2), strides (4, 1), offset 4. Also a view, also non-contiguous because rows skip 2 elements.\n.contiguous() copies into a fresh row-major buffer. .view() needs strides compatible with the new shape; .reshape() copies when it must. Many kernels are fastest (or only correct) on contiguous inputs, which is where hidden copies come from.",
    "pattern": "Index = offset + sum(i_k * stride_k). Transpose and slicing change metadata only; contiguous() copies."
  },
  {
    "id": "llm-p2-02",
    "deck": "P2 Kernels and GPUs",
    "source": "Plan reading: Edward Yang, PyTorch internals; PyTorch profiler and torch.compile tutorials",
    "chapter": "PyTorch internals, profiler and torch.compile",
    "prompt": "What happens, at a high level, when you call torch.add(a, b) on CUDA tensors that require grad?",
    "answer": "1. The Python call goes into C++ through the generated bindings.\n2. The dispatcher looks at the dispatch keys of the inputs (for example Autograd, Autocast, CUDA) and routes the call through a stack of handlers, highest priority first.\n3. The Autograd handler records a node in the graph (AddBackward0, with whatever it needs saved), sets the output's grad_fn, then redispatches below autograd.\n4. Autocast (if active) may cast inputs. Eventually the CUDA backend kernel is selected for the dtypes.\n5. The kernel is launched asynchronously on the current CUDA stream; Python gets a tensor back before the GPU has finished.\nTwo consequences you feel in practice: every op has fixed CPU overhead (dispatch plus launch, a few microseconds), so many tiny ops are CPU bound; and timing without synchronization measures launch time, not GPU time.",
    "pattern": "Dispatcher routes through keys (Autograd, Autocast, backend). Autograd records grad_fn; kernel launches async."
  },
  {
    "id": "llm-p2-03",
    "deck": "P2 Kernels and GPUs",
    "source": "Plan reading: Edward Yang, PyTorch internals; PyTorch profiler and torch.compile tutorials",
    "chapter": "PyTorch internals, profiler and torch.compile",
    "prompt": "How does autograd build and run its graph? What are grad_fn, next_functions and saved tensors, and why does an in-place op sometimes raise an error?",
    "answer": "Every non-leaf tensor produced by a differentiable op has a grad_fn node (e.g. MulBackward0). Each node's next_functions point to the nodes of its inputs, so the graph is built backwards from the output during the forward pass. Leaf tensors that require grad end in AccumulateGrad nodes, which write into .grad.\nNodes save what their backward needs (for mul, the other input; for many activations, the output). That saved memory is most of your activation memory.\nloss.backward() runs the graph from loss in dependency order and frees it afterwards unless retain_graph=True.\nIn-place error: each tensor has a version counter. If you modify in place a tensor that a node saved, the counter changes and backward raises \"one of the variables needed for gradient computation has been modified by an inplace operation\". The fix is to make that op out-of-place or clone before modifying.",
    "pattern": "grad_fn nodes linked by next_functions; saved tensors are activation memory; version counters catch in-place edits."
  },
  {
    "id": "llm-nn-14",
    "deck": "P2 Kernels and GPUs",
    "source": "Plan reading: Edward Yang, PyTorch internals; PyTorch profiler and torch.compile tutorials",
    "chapter": "PyTorch internals, profiler and torch.compile",
    "prompt": "Write a minimal correct PyTorch training step.",
    "answer": "model.train()\nfor x, y in loader:\n    x, y = x.to(dev), y.to(dev)\n    logits = model(x)\n    loss = F.cross_entropy(logits.view(-1, logits.size(-1)), y.view(-1))\n    opt.zero_grad(set_to_none=True)\n    loss.backward()\n    torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)\n    opt.step()\n    sched.step()\nOrder matters: zero grads, backward, clip, step. Missing zero_grad makes gradients accumulate across steps.",
    "pattern": "zero_grad, backward, clip, step, schedule. In that order."
  },
  {
    "id": "llm-nn-15",
    "deck": "P2 Kernels and GPUs",
    "source": "Plan reading: Edward Yang, PyTorch internals; PyTorch profiler and torch.compile tutorials",
    "chapter": "PyTorch internals, profiler and torch.compile",
    "prompt": "What does requires_grad do, and what do torch.no_grad() and .detach() do?",
    "answer": "requires_grad=True tells autograd to track operations on a tensor so it can compute gradients for it. Parameters have it on.\ntorch.no_grad() is a context where no graph is recorded. Use it for eval and generation: less memory and faster.\nx.detach() returns a tensor sharing the same data but cut out of the graph, so gradients do not flow back through it. Used for targets computed from the model itself (for example a frozen reference model's log-probs or a value target).",
    "pattern": "no_grad for eval, detach to stop gradient through a value."
  },
  {
    "id": "llm-nn-16",
    "deck": "P2 Kernels and GPUs",
    "source": "Plan reading: Edward Yang, PyTorch internals; PyTorch profiler and torch.compile tutorials",
    "chapter": "PyTorch internals, profiler and torch.compile",
    "prompt": "How do you write a custom layer as an nn.Module, and why register parameters the right way?",
    "answer": "class MyLinear(nn.Module):\n    def __init__(self, d_in, d_out):\n        super().__init__()\n        self.w = nn.Parameter(torch.randn(d_in, d_out) * d_in ** -0.5)\n        self.b = nn.Parameter(torch.zeros(d_out))\n    def forward(self, x):\n        return x @ self.w + self.b\nWrapping in nn.Parameter (or assigning a submodule) registers it, so model.parameters(), .to(device), state_dict, and the optimizer all see it. A plain tensor attribute is silently not trained. For non-trained state (like a causal mask) use self.register_buffer.",
    "pattern": "nn.Parameter to train, register_buffer for fixed state."
  },
  {
    "id": "llm-nn-17",
    "deck": "P2 Kernels and GPUs",
    "source": "Plan reading: Edward Yang, PyTorch internals; PyTorch profiler and torch.compile tutorials",
    "chapter": "PyTorch internals, profiler and torch.compile",
    "prompt": "Your loss is not going down at all. List the first checks you would run.",
    "answer": "1. Overfit one small batch. If loss cannot go near 0 on 1 to 10 examples, there is a bug, not a tuning issue.\n2. Check the step-0 loss is about ln(vocab).\n3. Check zero_grad, and that the optimizer got model.parameters() (not a stale copy).\n4. Check labels are aligned and shifted correctly (targets = inputs shifted by one).\n5. Check LR is not 0 or absurd and the scheduler is not stuck in warmup.\n6. Check gradients are nonzero and not NaN for each layer.\n7. Check model.train() and that nothing is wrapped in no_grad.",
    "pattern": "First, overfit one batch. If you cannot, it is a bug."
  },
  {
    "id": "llm-nn-18",
    "deck": "P2 Kernels and GPUs",
    "source": "Plan reading: Edward Yang, PyTorch internals; PyTorch profiler and torch.compile tutorials",
    "chapter": "PyTorch internals, profiler and torch.compile",
    "prompt": "What is the bug in: loss = F.cross_entropy(logits, targets) where logits is (B, T, V) and targets is (B, T)?",
    "answer": "F.cross_entropy expects the class dim second: input (N, C) or (N, C, d1, ...). Passing (B, T, V) makes it treat T as the class dim, which either errors or computes nonsense if shapes happen to fit.\nFix: F.cross_entropy(logits.view(-1, V), targets.view(-1)), or logits.transpose(1, 2).\nAlso use ignore_index=-100 (the default) for padding or prompt tokens you do not want in the loss.",
    "pattern": "cross_entropy wants (N, C). Flatten B and T first."
  },
  {
    "id": "llm-nn-19",
    "deck": "P2 Kernels and GPUs",
    "source": "Plan reading: Edward Yang, PyTorch internals; PyTorch profiler and torch.compile tutorials",
    "chapter": "PyTorch internals, profiler and torch.compile",
    "prompt": "Why does .view() sometimes fail where .reshape() works, and what does .contiguous() do?",
    "answer": "view only reinterprets the existing memory layout, so it needs a contiguous tensor. After transpose or permute the tensor is a strided view and view may raise an error.\nreshape returns a view when possible and copies otherwise.\n.contiguous() makes a compact copy in the current logical order. In attention code you often see out.transpose(1, 2).contiguous().view(B, T, d) when merging heads.",
    "pattern": "transpose breaks contiguity. contiguous() then view, or just reshape."
  },
  {
    "id": "llm-nn-20",
    "deck": "P2 Kernels and GPUs",
    "source": "Plan reading: Edward Yang, PyTorch internals; PyTorch profiler and torch.compile tutorials",
    "chapter": "PyTorch internals, profiler and torch.compile",
    "prompt": "What is gradient accumulation, and what is the classic scaling bug?",
    "answer": "To simulate a batch of K * b with memory for b, run K micro-batches, call backward each time (gradients add up), then step once.\nBug: gradients sum, so the effective gradient is K times too large unless you divide each micro-batch loss by K before backward.\nSubtler bug: if micro-batches have different numbers of non-padding tokens, averaging per micro-batch then dividing by K is not the same as averaging over all tokens. Normalize by total token count across the accumulation window to match a true big batch.",
    "pattern": "Divide loss by K, or better, by total tokens across the window."
  },
  {
    "id": "llm-nn-21",
    "deck": "P2 Kernels and GPUs",
    "source": "Plan reading: Edward Yang, PyTorch internals; PyTorch profiler and torch.compile tutorials",
    "chapter": "PyTorch internals, profiler and torch.compile",
    "prompt": "What are torch.compile and mixed-precision autocast for, in one line each, and what goes wrong most often?",
    "answer": "torch.compile(model): traces and fuses ops into faster kernels. Watch for recompiles caused by changing shapes (pad to fixed lengths or mark dynamic dims).\ntorch.autocast(device_type='cuda', dtype=torch.bfloat16): runs matmuls in bf16 while keeping sensitive ops (softmax, norms, losses) in fp32.\nCommon problem: doing reductions or the loss in low precision by hand, or using fp16 without a GradScaler (bf16 does not need one).",
    "pattern": "compile for speed, autocast bf16 for memory and speed. fp16 needs a scaler."
  },
  {
    "id": "llm-nn-22",
    "deck": "P2 Kernels and GPUs",
    "source": "Plan reading: Edward Yang, PyTorch internals; PyTorch profiler and torch.compile tutorials",
    "chapter": "PyTorch internals, profiler and torch.compile",
    "prompt": "Your GPU runs out of memory during training. What are the options, roughly in order of how often you reach for them?",
    "answer": "1. Smaller micro-batch plus gradient accumulation.\n2. Activation checkpointing (recompute activations in backward).\n3. bf16 autocast if not already on.\n4. Fused or memory-efficient attention (FlashAttention via F.scaled_dot_product_attention).\n5. Shard optimizer state, grads, and params (FSDP or ZeRO).\n6. 8-bit optimizer states or a parameter-efficient method like LoRA when fine-tuning.\nAlso check for leaks: accumulating loss tensors in a Python list without .item() keeps whole graphs alive.",
    "pattern": "Micro-batch, checkpoint, bf16, flash attention, shard. And .item() your logs."
  },
  {
    "id": "llm-nn-23",
    "deck": "P2 Kernels and GPUs",
    "source": "Plan reading: Edward Yang, PyTorch internals; PyTorch profiler and torch.compile tutorials",
    "chapter": "PyTorch internals, profiler and torch.compile",
    "prompt": "Why call loss.item() when logging, and what does a mysterious slowdown from it tell you?",
    "answer": "loss is a GPU tensor attached to the graph. Storing it keeps the graph and its activations alive (memory leak). .item() copies the scalar to the CPU and drops the reference.\nBut .item() forces a CPU-GPU sync: the CPU waits for all queued GPU work to finish. Calling it every step can hurt throughput. Log every N steps, or accumulate on the GPU and sync rarely.",
    "pattern": ".item() frees the graph but syncs the GPU. Log sparingly."
  },
  {
    "id": "llm-nn-25",
    "deck": "P2 Kernels and GPUs",
    "source": "Plan reading: Edward Yang, PyTorch internals; PyTorch profiler and torch.compile tutorials",
    "chapter": "PyTorch internals, profiler and torch.compile",
    "prompt": "Your training loss turns NaN at step 4,000. How do you investigate?",
    "answer": "1. Find the first NaN: log grad norm, loss, and max activation per layer. Was there a grad-norm spike first?\n2. Check the data batch at that step: empty sequences, all-padding rows, division by a token count of zero.\n3. Look for unsafe ops: log(0), sqrt of a negative, dividing by a norm with no eps, softmax done in fp16 without max subtraction.\n4. Check LR schedule at that step.\n5. Turn on torch.autograd.set_detect_anomaly(True) on a reproduction (slow, debugging only).\n6. Reload the last good checkpoint, skip that batch, and see whether it recurs.",
    "pattern": "Find the first NaN, check the batch, then unsafe ops. Rewind and skip to test."
  },
  {
    "id": "llm-p2-04",
    "deck": "P2 Kernels and GPUs",
    "source": "Plan reading: Edward Yang, PyTorch internals; PyTorch profiler and torch.compile tutorials",
    "chapter": "PyTorch internals, profiler and torch.compile",
    "prompt": "How do you collect and read a torch.profiler trace for a training step? What patterns tell you what is wrong?",
    "answer": "from torch.profiler import profile, schedule, ProfilerActivity\nwith profile(activities=[ProfilerActivity.CPU, ProfilerActivity.CUDA],\n             schedule=schedule(wait=1, warmup=2, active=3),\n             on_trace_ready=torch.profiler.tensorboard_trace_handler(\"./prof\"),\n             record_shapes=True, profile_memory=True) as prof:\n    for step in range(6):\n        train_step()\n        prof.step()\nprint(prof.key_averages().table(sort_by=\"cuda_time_total\", row_limit=15))\n\nOpen the trace (Perfetto or TensorBoard). Read it like this:\n- Gaps on the GPU stream with busy CPU threads: CPU bound (Python overhead, many tiny kernels, data loading). Fix with bigger ops, torch.compile, CUDA graphs, more loader workers.\n- cudaStreamSynchronize or cudaMemcpy DtoH in the middle of a step: a hidden sync (.item(), printing a tensor, boolean indexing, nonzero).\n- Top kernels by GPU time: matmuls should dominate. If elementwise or norm kernels are a large share, fusion will help.\n- In multi-GPU runs, NCCL kernels that do not overlap with compute: communication bound.\nSkip the first steps (warmup and compile) and profile only a few steps; traces get huge.",
    "pattern": "Profile a few steady steps. GPU gaps = CPU bound; syncs = .item() and friends; non-matmul kernels = fuse."
  },
  {
    "id": "llm-p2-05",
    "deck": "P2 Kernels and GPUs",
    "source": "Plan reading: Edward Yang, PyTorch internals; PyTorch profiler and torch.compile tutorials",
    "chapter": "PyTorch internals, profiler and torch.compile",
    "prompt": "What do Dynamo and Inductor do in torch.compile, and what are graph breaks and recompiles?",
    "answer": "Dynamo: hooks Python frame evaluation, traces the bytecode of your function into an FX graph of tensor ops, and installs guards (conditions like shapes, dtypes and Python values) that must hold for the compiled code to be reused.\nInductor: the default backend; lowers the graph, fuses pointwise and reduction ops, and generates Triton kernels for GPU (C++ for CPU), calling vendor libraries for big matmuls.\nGraph break: Dynamo hits something it cannot trace (printing, .item() feeding Python control flow, data-dependent branches, unsupported libraries). It splits into several graphs and runs the rest eagerly, losing fusion across the break.\nRecompile: a guard fails (new shape, new dtype, a changed Python constant), so it compiles again; too many and it falls back. Varying sequence lengths are a common cause; mark dynamic dims or pad to buckets.\nDebug: TORCH_LOGS=\"graph_breaks,recompiles\" python train.py, or torch._dynamo.explain(fn)(inputs).\nModes: default; \"reduce-overhead\" adds CUDA graphs (cuts launch overhead, needs static shapes); \"max-autotune\" searches kernel configs.",
    "pattern": "Dynamo traces bytecode to FX with guards; Inductor fuses and emits Triton. Watch graph breaks and recompiles."
  },
  {
    "id": "llm-pt-23",
    "deck": "P2 Kernels and GPUs",
    "source": "Plan reading: Edward Yang, PyTorch internals; PyTorch profiler and torch.compile tutorials",
    "chapter": "PyTorch internals, profiler and torch.compile",
    "prompt": "Training throughput is far below expected. What do you profile and in what order?",
    "answer": "1. Check GPU utilization and the profiler trace (PyTorch profiler or Nsight). Are there gaps between kernels?\n2. Data loader: is the GPU waiting on input? Add workers, prefetch, pre-tokenize.\n3. Communication: is all-reduce or all-gather exposed instead of overlapped? Check bucket sizes and that TP stays on NVLink.\n4. Kernels: unfused elementwise ops, attention not using a fused kernel, matmul shapes that are not multiples of 64 or 128.\n5. Host overhead: Python per-step work, .item() syncs, small batch per GPU. CUDA graphs or torch.compile help.\nCompute MFU before and after each fix.",
    "pattern": "Profile first: data, comms, kernels, host overhead. Measure MFU each time."
  },
  {
    "id": "llm-p2-build-01",
    "deck": "P2 Kernels and GPUs",
    "source": "Plan reading: Edward Yang, PyTorch internals; PyTorch profiler and torch.compile tutorials",
    "chapter": "PyTorch internals, profiler and torch.compile",
    "prompt": "Build this: Profiling write-up of your GPT",
    "answer": "Spec: Take your GPT-2 small training script and write a profiling report: a baseline, a trace, and a sequence of optimizations, each with a measured effect.\n\nSteps:\n1. Baseline: fp32, eager, naive attention. Measure tokens/s and MFU (6N plus attention FLOPs per token, divided by peak) over 20 steady steps with torch.cuda.synchronize timing.\n2. Capture a torch.profiler trace; identify the top kernels and any CPU-bound gaps or syncs.\n3. Apply one change at a time and remeasure: TF32, bf16 autocast, SDPA flash attention, torch.compile, fused AdamW, vocab padded to a multiple of 128, larger micro-batch.\n4. For each change, explain from the trace why it helped (or did not).\n\nSuccess looks like: A table: change, tokens/s, MFU, memory, with a trace screenshot before and after. Speedups compound to several x over the naive baseline, and you can say for each line which resource (compute, memory bandwidth, CPU overhead) it relieved.",
    "pattern": "Build this: Profiling write-up of your GPT"
  },
  {
    "id": "llm-p2-06",
    "deck": "P2 Kernels and GPUs",
    "source": "Plan reading: Sasha Rush, GPU Puzzles; GPU MODE lectures",
    "chapter": "GPU Puzzles and GPU MODE",
    "prompt": "Explain the CUDA execution model: grids, blocks, threads, warps and SMs.",
    "answer": "You launch a kernel over a grid of thread blocks; each block has up to 1024 threads.\nBlocks are scheduled onto streaming multiprocessors (SMs); an H100 SXM has 132. A block stays on one SM until it finishes; blocks cannot rely on running at the same time as other blocks.\nThreads in a block share fast on-chip shared memory and can synchronize with __syncthreads().\nThe SM runs threads in warps of 32 that execute the same instruction together (SIMT). If threads in a warp branch differently, both paths run with lanes masked (divergence).\nEach thread computes its global index, e.g. i = blockIdx.x * blockDim.x + threadIdx.x, and must bounds-check i < n.\nLatency hiding: when one warp waits on memory, the SM switches to another ready warp, so you want enough warps resident (occupancy) and enough independent work.",
    "pattern": "Grid of blocks on SMs; block threads share shared memory; warps of 32 run in lockstep."
  },
  {
    "id": "llm-p2-07",
    "deck": "P2 Kernels and GPUs",
    "source": "Plan reading: Sasha Rush, GPU Puzzles; GPU MODE lectures",
    "chapter": "GPU Puzzles and GPU MODE",
    "prompt": "Lay out the GPU memory hierarchy with rough sizes for an H100, and say what that implies for kernel design.",
    "answer": "Fastest to slowest:\n- registers: per thread, the fastest storage\n- shared memory / L1: on each SM, up to about 228 KB configurable as shared memory, programmer managed\n- L2 cache: about 50 MB, shared across SMs\n- HBM: 80 GB at about 3.35 TB/s on H100 SXM\nPeak dense bf16 tensor-core compute is about 990 TFLOP/s, so you need roughly 300 FLOPs per byte loaded from HBM to be compute bound.\nImplication: almost every fast kernel is about moving data from HBM once, reusing it many times from shared memory and registers, and writing results once. Tiling (matmul, FlashAttention) and fusion (doing several ops per load) are the two main tools.",
    "pattern": "Registers > shared memory (per SM) > L2 > HBM. Load from HBM once, reuse on chip."
  },
  {
    "id": "llm-pt-22",
    "deck": "P2 Kernels and GPUs",
    "source": "Plan reading: Sasha Rush, GPU Puzzles; GPU MODE lectures",
    "chapter": "GPU Puzzles and GPU MODE",
    "prompt": "What does 'compute bound' vs 'memory bound' mean, and what is the H100's crossover arithmetic intensity?",
    "answer": "Arithmetic intensity = FLOPs per byte moved from memory.\nH100 SXM: about 989 TFLOP/s bf16 dense and 3.35 TB/s HBM bandwidth, so the crossover is 989e12 / 3.35e12 = about 295 FLOPs per byte.\nBig matmuls in training have high intensity, so they are compute bound. Elementwise ops (activations, norms, adds) have intensity around 1, so they are memory bound, which is why kernel fusion matters. Decoding at small batch is memory bound too.",
    "pattern": "Below about 300 FLOPs/byte on H100, you are memory bound."
  },
  {
    "id": "llm-in-06",
    "deck": "P2 Kernels and GPUs",
    "source": "Plan reading: Sasha Rush, GPU Puzzles; GPU MODE lectures",
    "chapter": "GPU Puzzles and GPU MODE",
    "prompt": "Why is decoding at batch size 1 memory-bandwidth bound? Give the upper bound on tokens/s for a 7B bf16 model on one H100.",
    "answer": "Each new token requires reading every weight once from HBM but does only about 2 FLOPs per weight, an arithmetic intensity near 1 FLOP/byte, far below the H100's ~295 crossover.\nWeights: 7e9 * 2 bytes = 14 GB. HBM: 3.35 TB/s. Time per token >= 14 / 3350 s = 4.2 ms, so at most about 240 tokens/s, ignoring KV cache reads and overheads.\nBatching helps: the same weight read serves every sequence in the batch.",
    "pattern": "Batch-1 decode speed is about bandwidth / model bytes."
  },
  {
    "id": "llm-in-25",
    "deck": "P2 Kernels and GPUs",
    "source": "Plan reading: Sasha Rush, GPU Puzzles; GPU MODE lectures",
    "chapter": "GPU Puzzles and GPU MODE",
    "prompt": "At what batch size does decoding stop being memory bound on an H100, roughly?",
    "answer": "Per decode step, each weight is read once (2 bytes in bf16) and used in 2 FLOPs per sequence in the batch. Intensity is about B FLOPs per byte for batch B (ignoring KV cache reads).\nCrossover is about 295 FLOPs/byte, so roughly B in the low hundreds. In practice KV cache reads grow with batch and context and push the crossover higher, which is why serving large batches at long context remains memory-bound and why GQA, MLA, and KV quantization matter.",
    "pattern": "Decode intensity is about batch size. H100 crossover is about 300."
  },
  {
    "id": "llm-p2-08",
    "deck": "P2 Kernels and GPUs",
    "source": "Plan reading: Sasha Rush, GPU Puzzles; GPU MODE lectures",
    "chapter": "GPU Puzzles and GPU MODE",
    "prompt": "What is memory coalescing? Give an example of a coalesced and an uncoalesced access pattern.",
    "answer": "When the 32 threads of a warp load memory, the hardware combines their addresses into as few wide transactions as possible. If consecutive threads read consecutive addresses, one warp load touches a few 32-byte sectors: coalesced, full bandwidth.\nCoalesced: thread i reads x[row * n + i] (walking along a row of a row-major matrix).\nUncoalesced: thread i reads x[i * n + col] (walking down a column). Each thread hits a different row, so the warp needs up to 32 separate transactions and most of each fetched sector is wasted.\nFixes: change which index maps to threadIdx.x, transpose through shared memory (load coalesced, then read in the other order from shared memory), or change the data layout.",
    "pattern": "Adjacent threads, adjacent addresses. Walking rows is coalesced; walking columns is not."
  },
  {
    "id": "llm-p2-09",
    "deck": "P2 Kernels and GPUs",
    "source": "Plan reading: Sasha Rush, GPU Puzzles; GPU MODE lectures",
    "chapter": "GPU Puzzles and GPU MODE",
    "prompt": "How does shared-memory tiling speed up a matmul C = A B? What is the arithmetic intensity as a function of tile size?",
    "answer": "Naive: each thread computes one C[i, j] and reads a whole row of A and column of B from HBM. Every element of A and B is reloaded many times.\nTiled: a block computes a T x T tile of C. It loops over K in steps of T: load a T x T tile of A and of B into shared memory (coalesced), __syncthreads(), each thread accumulates its dot-product piece from shared memory, __syncthreads(), next tile.\nPer K-step the block loads 2 T^2 elements and does 2 T^3 FLOPs (T^2 outputs, T multiply-adds each). Intensity = 2 T^3 / (2 T^2 * bytes per element) = T / bytes per element FLOPs per byte, growing linearly with T.\nLimits on T: shared memory size and registers per SM. Real kernels add register tiling (each thread computes a small sub-tile), tensor cores and double buffering (prefetch the next tile while computing).",
    "pattern": "Load T x T tiles to shared memory and reuse them T times: intensity grows linearly with tile size."
  },
  {
    "id": "llm-p2-10",
    "deck": "P2 Kernels and GPUs",
    "source": "Plan reading: Sasha Rush, GPU Puzzles; GPU MODE lectures",
    "chapter": "GPU Puzzles and GPU MODE",
    "prompt": "How is a parallel reduction (sum of n numbers) written on a GPU, and why are float sums on GPUs not bitwise reproducible by default?",
    "answer": "Within a block: each thread loads (and pre-sums a few) elements into shared memory, then a tree: at stride s = blockDim/2, blockDim/4, ..., threads with tid < s do buf[tid] += buf[tid + s], with __syncthreads() between rounds. The last 32 values can be reduced inside a warp with shuffle instructions (__shfl_down_sync) and no shared memory.\nAcross blocks: each block writes a partial sum, then a second kernel (or atomicAdd) combines them.\nReproducibility: float addition is not associative, so a different grouping gives a slightly different result. Tree shape depends on block size and launch config, and atomics finish in whatever order blocks complete, so results can change run to run. Deterministic modes fix the order at some speed cost. This matters for RL and evals: two \"identical\" forward passes can produce different logits in the last bits, which is one source of train/inference mismatch.",
    "pattern": "Tree in shared memory, warp shuffles for the last 32, then combine blocks. Non-associative float adds break bitwise determinism."
  },
  {
    "id": "llm-p2-11",
    "deck": "P2 Kernels and GPUs",
    "source": "Plan reading: Sasha Rush, GPU Puzzles; GPU MODE lectures",
    "chapter": "GPU Puzzles and GPU MODE",
    "prompt": "What is occupancy, what limits it, and is higher always better?",
    "answer": "Occupancy = active warps on an SM / maximum warps an SM can hold.\nLimited by per-block resources: registers per thread (the SM register file is split across resident threads), shared memory per block, and threads per block.\nWhy it matters: memory latency is hundreds of cycles; with more resident warps, the scheduler can switch to ready warps and keep the units busy.\nNot always better: kernels like FlashAttention and big matmuls deliberately use many registers and lots of shared memory per block (low occupancy) to get high data reuse and instruction-level parallelism. Aim for enough parallelism to hide latency, then optimize reuse; measure, do not maximize occupancy blindly.",
    "pattern": "Active warps / max warps, limited by registers and shared memory. Enough to hide latency; reuse matters more."
  },
  {
    "id": "llm-in-14",
    "deck": "P2 Kernels and GPUs",
    "source": "Plan reading: Sasha Rush, GPU Puzzles; GPU MODE lectures",
    "chapter": "GPU Puzzles and GPU MODE",
    "prompt": "Why does kernel fusion speed things up, and which ops benefit most?",
    "answer": "Elementwise and reduction ops (add bias, activation, residual add, norm, dropout) do very few FLOPs per byte, so their time is reading and writing HBM. Running them as separate kernels moves the same tensor in and out of memory several times.\nFusing them into one kernel (or into the matmul epilogue) reads once and writes once. Biggest wins: norm + residual, activation functions like SwiGLU, attention, and the softmax + cross-entropy at the output layer (which otherwise materializes a huge B x T x V logits tensor). Triton is the usual tool for writing these.",
    "pattern": "Memory-bound ops win from fusion. Fewer HBM round trips."
  },
  {
    "id": "llm-p2-build-02",
    "deck": "P2 Kernels and GPUs",
    "source": "Plan reading: Sasha Rush, GPU Puzzles; GPU MODE lectures",
    "chapter": "GPU Puzzles and GPU MODE",
    "prompt": "Build this: Solved GPU Puzzles repo",
    "answer": "Spec: Solve every GPU Puzzle (Numba CUDA in Python) and add one kernel of your own: a tiled matmul benchmarked against torch.matmul.\n\nSteps:\n1. Solve the puzzles in order (map, zip, guards, broadcast, blocks, shared memory, pooling, dot product, prefix sum, axis sum, matmul) without peeking.\n2. For each one, write two lines in the README: which threads read which addresses, and how many global reads it does.\n3. Write a tiled shared-memory matmul (Numba CUDA or CUDA C), test it against torch.matmul, and benchmark across sizes.\n4. Plot achieved TFLOP/s for naive, tiled and torch.matmul.\n\nSuccess looks like: All puzzles pass their tests, each has a short explanation of its access pattern, and your tiled matmul is clearly faster than naive (still well below cuBLAS, and you can say why).",
    "pattern": "Build this: Solved GPU Puzzles repo"
  },
  {
    "id": "llm-p2-12",
    "deck": "P2 Kernels and GPUs",
    "source": "Plan reading: Triton tutorials (vector add, fused softmax, layer norm); Triton Puzzles",
    "chapter": "Triton kernels",
    "prompt": "What is the Triton programming model, and how does it differ from CUDA? Write a vector add kernel.",
    "answer": "In Triton you write a program that runs once per grid index and operates on whole blocks of elements, not single threads. The compiler decides thread mapping, coalescing, vectorization and shared-memory use within the block.\n\nimport triton, triton.language as tl\n\n@triton.jit\ndef add_kernel(x_ptr, y_ptr, out_ptr, n, BLOCK: tl.constexpr):\n    pid = tl.program_id(0)\n    offs = pid * BLOCK + tl.arange(0, BLOCK)\n    mask = offs < n\n    x = tl.load(x_ptr + offs, mask=mask)\n    y = tl.load(y_ptr + offs, mask=mask)\n    tl.store(out_ptr + offs, x + y, mask=mask)\n\ndef add(x, y):\n    out = torch.empty_like(x)\n    n = x.numel()\n    grid = (triton.cdiv(n, 1024),)\n    add_kernel[grid](x, y, out, n, BLOCK=1024)\n    return out\n\nKey ideas: pointers plus offset blocks, masks for the ragged edge, BLOCK as a compile-time constant (a power of 2), and no explicit threads or __syncthreads.",
    "pattern": "One program per block of elements: offsets = pid * BLOCK + arange, masked load, compute, masked store."
  },
  {
    "id": "llm-p2-13",
    "deck": "P2 Kernels and GPUs",
    "source": "Plan reading: Triton tutorials (vector add, fused softmax, layer norm); Triton Puzzles",
    "chapter": "Triton kernels",
    "prompt": "Write a fused row-wise softmax kernel in Triton. Why is it faster than torch eager softmax built from separate ops?",
    "answer": "@triton.jit\ndef softmax_kernel(out_ptr, in_ptr, in_stride, out_stride, n_cols, BLOCK: tl.constexpr):\n    row = tl.program_id(0)\n    offs = tl.arange(0, BLOCK)\n    mask = offs < n_cols\n    x = tl.load(in_ptr + row * in_stride + offs, mask=mask, other=-float(\"inf\"))\n    x = x - tl.max(x, axis=0)\n    num = tl.exp(x)\n    y = num / tl.sum(num, axis=0)\n    tl.store(out_ptr + row * out_stride + offs, y, mask=mask)\n\ndef softmax(x):\n    n_rows, n_cols = x.shape\n    y = torch.empty_like(x)\n    softmax_kernel[(n_rows,)](y, x, x.stride(0), y.stride(0), n_cols,\n                              BLOCK=triton.next_power_of_2(n_cols))\n    return y\n\nWhy faster: a naive softmax from separate ops (max, subtract, exp, sum, divide) reads and writes the matrix to HBM several times. The fused kernel reads each row once into on-chip memory, does everything there and writes once, so it moves about 2 x the matrix size in bytes instead of many times that. Softmax is memory bound, so bytes moved is the runtime. Masked lanes load -inf so they contribute exp(-inf) = 0. This simple version needs a whole row to fit in one block; very long rows need a looped (online) version.",
    "pattern": "One program per row: masked load with -inf, subtract max, exp, divide by sum, one store. Bytes moved drop several x."
  },
  {
    "id": "llm-p2-14",
    "deck": "P2 Kernels and GPUs",
    "source": "Plan reading: Triton tutorials (vector add, fused softmax, layer norm); Triton Puzzles",
    "chapter": "Triton kernels",
    "prompt": "Write an RMSNorm forward kernel in Triton.",
    "answer": "@triton.jit\ndef rmsnorm_fwd(X, Y, W, Rstd, stride, N, eps, BLOCK: tl.constexpr):\n    row = tl.program_id(0)\n    cols = tl.arange(0, BLOCK)\n    mask = cols < N\n    x = tl.load(X + row * stride + cols, mask=mask, other=0.0).to(tl.float32)\n    ms = tl.sum(x * x, axis=0) / N\n    rstd = 1.0 / tl.sqrt(ms + eps)\n    tl.store(Rstd + row, rstd)                       # saved for backward\n    w = tl.load(W + cols, mask=mask, other=0.0).to(tl.float32)\n    y = x * rstd * w\n    tl.store(Y + row * stride + cols, y.to(Y.dtype.element_ty), mask=mask)\n\nLaunch with one program per row (grid = (n_rows,)), BLOCK = next_power_of_2(N). Accumulate in fp32 even for bf16 inputs. Masked lanes load 0 so they do not change the sum of squares, but divide by the true N.",
    "pattern": "Per row: load in fp32, rstd = 1 / sqrt(mean(x^2) + eps), save rstd, y = x * rstd * w."
  },
  {
    "id": "llm-p2-15",
    "deck": "P2 Kernels and GPUs",
    "source": "Plan reading: Triton tutorials (vector add, fused softmax, layer norm); Triton Puzzles",
    "chapter": "Triton kernels",
    "prompt": "Derive the RMSNorm backward pass: given y_i = g_i x_i r with r = (mean(x^2) + eps)^(-1/2), find dx and dg.",
    "answer": "Let d = number of features, dy the upstream gradient for one row.\ndr/dx_j = -1/2 (mean(x^2) + eps)^(-3/2) * (2 x_j / d) = -r^3 x_j / d.\ndL/dx_j = sum_i dy_i g_i (delta_ij r + x_i dr/dx_j)\n        = r g_j dy_j - (r^3 x_j / d) * sum_i dy_i g_i x_i\nSo with u = dy * g (elementwise): dx = r u - (r^3 / d) x * sum(u * x).\ndg_i = sum over rows of dy_i x_i r (a reduction across rows, usually done with per-block partial sums then a second small reduction).\nCheck: dx is r u minus its projection onto x, scaled. That makes sense, because scaling x does not change y, so dx must be orthogonal to x (sum(dx * x) = r sum(u x) - r^3 sum(u x) |x|^2 / d, which is 0 when eps = 0 since r^2 |x|^2 / d = 1). Always gradcheck against autograd in float64.",
    "pattern": "dx = r u - (r^3 / d) x sum(u x) with u = dy * g; dg = sum over rows of dy x r. dx is orthogonal to x."
  },
  {
    "id": "llm-p2-16",
    "deck": "P2 Kernels and GPUs",
    "source": "Plan reading: Triton tutorials (vector add, fused softmax, layer norm); Triton Puzzles",
    "chapter": "Triton kernels",
    "prompt": "How do you benchmark a kernel correctly, and how do you know if a memory-bound kernel is good?",
    "answer": "Correctness first: torch.testing.assert_close against a reference across shapes (including non-powers of 2 and tiny sizes) and dtypes, with tolerances that match the dtype (bf16 is about 1e-2 relative).\nTiming:\n- warm up (the first call compiles or autotunes)\n- synchronize: use CUDA events or triton.testing.do_bench, never time.time() around async launches alone\n- take the median of many runs; flush or vary inputs if cache effects matter\n- sweep sizes and plot; one size can lie\nGood for memory-bound kernels: compute achieved bandwidth = bytes read + bytes written / time, and compare to peak HBM bandwidth (about 3.35 TB/s on H100 SXM). Reaching 70 to 90% of peak is excellent; for these kernels FLOP/s is the wrong metric.\nBaselines: torch eager, torch.compile (which may already fuse it) and a vendor or library kernel if one exists.",
    "pattern": "assert_close first; warm up, sync, median, sweep sizes. Memory-bound: report GB/s against peak bandwidth."
  },
  {
    "id": "llm-p2-17",
    "deck": "P2 Kernels and GPUs",
    "source": "Plan reading: Triton tutorials (vector add, fused softmax, layer norm); Triton Puzzles",
    "chapter": "Triton kernels",
    "prompt": "What does @triton.autotune do, and what knobs does it search?",
    "answer": "It benchmarks several configs the first time the kernel is called with a new key and caches the fastest.\n\n@triton.autotune(\n    configs=[triton.Config({\"BLOCK\": b}, num_warps=w, num_stages=s)\n             for b in (1024, 2048, 4096) for w in (4, 8) for s in (2, 3)],\n    key=[\"n\"],\n)\n@triton.jit\ndef kernel(..., n, BLOCK: tl.constexpr): ...\n\nKnobs: block sizes (data per program; bigger means more reuse, more registers), num_warps (threads per program), num_stages (software pipelining depth for loads in loops, which uses more shared memory).\nkey: arguments whose change should trigger re-tuning (typically sizes).\nCost: first-call latency, and results depend on the GPU, so tune on the target hardware.",
    "pattern": "Benchmarks configs (BLOCK, num_warps, num_stages) per key value and caches the fastest."
  },
  {
    "id": "llm-p2-build-03",
    "deck": "P2 Kernels and GPUs",
    "source": "Plan reading: Triton tutorials (vector add, fused softmax, layer norm); Triton Puzzles",
    "chapter": "Triton kernels",
    "prompt": "Build this: Fused softmax and RMSNorm kernels with a benchmark",
    "answer": "Spec: Triton kernels for row softmax (forward) and RMSNorm (forward and backward), wrapped as a torch.autograd.Function, tested and benchmarked.\n\nSteps:\n1. Write both forwards; test against PyTorch for many shapes in fp32 and bf16.\n2. Derive and write the RMSNorm backward (dx kernel plus a partial-sum reduction for dg); gradcheck in float64 on small shapes.\n3. Wrap in autograd.Function and drop it into your GPT; confirm the loss curve matches the reference for a few hundred steps.\n4. Benchmark GB/s against eager, torch.compile and peak bandwidth over hidden sizes 512 to 16384.\n\nSuccess looks like: Tests and gradchecks pass, your GPT trains identically with the kernels, the plots show your kernels near peak bandwidth and faster than eager, and you can explain where torch.compile matches or beats you.",
    "pattern": "Build this: Fused softmax and RMSNorm kernels with a benchmark"
  }
];
