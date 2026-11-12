import type { Question } from "../lib/types";

export const LLM_P1_FOUNDATIONS: Question[] = [
  {
    "id": "llm-fd-01",
    "deck": "P1 Foundations",
    "source": "Plan reading: 3Blue1Brown Essence of Linear Algebra; Mathematics for Machine Learning (Deisenroth, Faisal, Ong)",
    "chapter": "Linear algebra and MML",
    "prompt": "X has shape (B, T, d) and W has shape (d, h). What is the shape of X @ W, and how many multiply-adds does it cost?",
    "answer": "Matmul contracts the last dim of X with the first dim of W, and leading dims broadcast as batch dims. Result: (B, T, h).\nCost: B*T*d*h multiply-adds, which is 2*B*T*d*h FLOPs (one multiply plus one add each).\nExample: B=8, T=1024, d=4096, h=4096 gives 2*8*1024*4096*4096 = about 2.7e11 FLOPs.",
    "pattern": "Matmul (m, k) @ (k, n) costs 2*m*k*n FLOPs. Count it every time."
  },
  {
    "id": "llm-fd-02",
    "deck": "P1 Foundations",
    "source": "Plan reading: 3Blue1Brown Essence of Linear Algebra; Mathematics for Machine Learning (Deisenroth, Faisal, Ong)",
    "chapter": "Linear algebra and MML",
    "prompt": "Why do people say 'a linear layer is a bunch of dot products', and what does each output feature measure?",
    "answer": "y = x W + b. Output feature j is the dot product of x with column j of W, plus b_j. A dot product is large when x points in the same direction as that column, so each output measures how much the input matches a learned direction (a feature detector).\nStacking linear layers without a nonlinearity collapses to one linear map: W1 W2 is still a matrix. That is why MLPs need activations between layers.",
    "pattern": "Each output unit = dot product with a learned direction. No nonlinearity means no depth."
  },
  {
    "id": "llm-fd-03",
    "deck": "P1 Foundations",
    "source": "Plan reading: 3Blue1Brown Essence of Linear Algebra; Mathematics for Machine Learning (Deisenroth, Faisal, Ong)",
    "chapter": "Linear algebra and MML",
    "prompt": "What is the difference between x @ W, x * W, and torch.einsum('btd,dh->bth', x, W)?",
    "answer": "x @ W is matrix multiplication (contract a shared dim).\nx * W is elementwise multiplication with broadcasting; no dim is summed.\neinsum('btd,dh->bth') is the same as x @ W for x of shape (B,T,d): indices that appear in the inputs but not the output (here d) are summed.\nCommon bug: writing * when you meant @. It often still runs because of broadcasting and silently gives garbage.",
    "pattern": "@ contracts, * broadcasts. einsum sums every index missing from the output."
  },
  {
    "id": "llm-fd-04",
    "deck": "P1 Foundations",
    "source": "Plan reading: 3Blue1Brown Essence of Linear Algebra; Mathematics for Machine Learning (Deisenroth, Faisal, Ong)",
    "chapter": "Linear algebra and MML",
    "prompt": "Broadcasting: a has shape (B, T, d) and b has shape (d,). What does a + b do? What about a + c where c is (B, d)?",
    "answer": "Shapes align from the right. (d,) is treated as (1, 1, d) and stretched over B and T, so a + b adds the same bias to every token. That is how biases work.\nFor c of shape (B, d): aligned from the right it becomes (1, B, d) against (B, T, d). This only works if B == T, and then it is wrong. You want c[:, None, :] with shape (B, 1, d).\nAlways reason from the rightmost dim.",
    "pattern": "Broadcast aligns from the right. Insert None to put the 1 where you mean it."
  },
  {
    "id": "llm-fd-05",
    "deck": "P1 Foundations",
    "source": "Plan reading: 3Blue1Brown Essence of Linear Algebra; Mathematics for Machine Learning (Deisenroth, Faisal, Ong)",
    "chapter": "Linear algebra and MML",
    "prompt": "What do eigenvalues and singular values tell you about a weight matrix in practice for deep learning?",
    "answer": "Singular values of W are the stretch factors along its principal directions. The largest one (spectral norm) bounds how much W can amplify a vector: |Wx| <= sigma_max |x|.\nIn deep nets you multiply many such maps, so if typical singular values are above 1 activations and gradients explode; below 1 they vanish. Good init keeps them near 1 in expectation.\nLow-rank structure (few large singular values) is also why LoRA works: weight updates during fine-tuning are often well approximated by a low-rank matrix.",
    "pattern": "Singular values = per-direction gain. Products of gains explode or vanish."
  },
  {
    "id": "llm-p1-01",
    "deck": "P1 Foundations",
    "source": "Plan reading: 3Blue1Brown Essence of Linear Algebra; Mathematics for Machine Learning (Deisenroth, Faisal, Ong)",
    "chapter": "Linear algebra and MML",
    "prompt": "Derive the least-squares solution for linear regression. What does it mean geometrically, and how should you actually compute it?",
    "answer": "Loss: L(w) = |Xw - y|^2 = (Xw - y)^T (Xw - y), with X of shape (n, d).\nGradient: dL/dw = 2 X^T (Xw - y).\nSet it to zero: X^T X w = X^T y (the normal equations), so w = (X^T X)^-1 X^T y when X^T X is invertible.\nGeometry: Xw is the orthogonal projection of y onto the column space of X. The residual r = y - Xw satisfies X^T r = 0, so it is orthogonal to every column.\nRidge: adding lam |w|^2 gives w = (X^T X + lam I)^-1 X^T y, which is invertible for any lam > 0.\nIn practice: use a QR or SVD based solver (torch.linalg.lstsq) or gradient descent for huge X. Never form the explicit inverse; it squares the condition number and loses precision.",
    "pattern": "Gradient 2 X^T (Xw - y) = 0 gives X^T X w = X^T y: the residual is orthogonal to the columns of X."
  },
  {
    "id": "llm-p1-02",
    "deck": "P1 Foundations",
    "source": "Plan reading: 3Blue1Brown Essence of Linear Algebra; Mathematics for Machine Learning (Deisenroth, Faisal, Ong)",
    "chapter": "Linear algebra and MML",
    "prompt": "A is (T, d), B is (d, T), C is (T, d) with T = 8192 and d = 128. Compare the FLOPs of (A B) C and A (B C). Why will this exact fact come back in linear attention?",
    "answer": "(A B) C: A B is (T, d) @ (d, T), 2 T^2 d = 1.72e10 FLOPs, producing a (T, T) matrix. Then (T, T) @ (T, d) is another 1.72e10. Total 3.44e10.\nA (B C): B C is (d, T) @ (T, d), 2 d^2 T = 2.68e8 FLOPs, producing a (d, d) matrix. Then (T, d) @ (d, d) is another 2.68e8. Total 5.4e8.\nRatio: 64x, which is T / d. Same result, because matrix products are associative.\nLinear attention is exactly this trick: (Q K^T) V costs O(T^2 d) but Q (K^T V) costs O(T d^2) and never builds the T x T matrix. Softmax attention cannot do this because the softmax sits between Q K^T and V. The causal mask also blocks the plain reordering, which is why the causal version becomes a running sum (a recurrence) over K^T V.",
    "pattern": "Associativity lets you pick the cheap order: O(T^2 d) vs O(T d^2). That is the linear attention trick."
  },
  {
    "id": "llm-p1-build-01",
    "deck": "P1 Foundations",
    "source": "Plan reading: 3Blue1Brown Essence of Linear Algebra; Mathematics for Machine Learning (Deisenroth, Faisal, Ong)",
    "chapter": "Linear algebra and MML",
    "prompt": "Build this: Notes repo plus a daily post",
    "answer": "Spec: A public notes repo with one page per MML chapter you read (linear algebra, analytic geometry, matrix decompositions, vector calculus, probability) and a short daily post on X about one thing you learned.\n\nSteps:\n1. Create the repo with a folder per chapter and a notebook per page.\n2. For each chapter, write one worked example in NumPy: e.g. the SVD of a 2 x 2 matrix drawn as a rotation, stretch, rotation; the gradient of x^T A x checked against finite differences.\n3. Derive d/dx (x^T A x) = (A + A^T) x and d/dW |W x - y|^2 by hand, then verify numerically.\n4. Post one idea per day, in your own words, with a figure if you can.\n\nSuccess looks like: You can derive matrix gradients by hand and confirm them numerically, explain SVD geometrically without notes, and the repo has a page and a post for every study day.",
    "pattern": "Build this: Notes repo plus a daily post"
  },
  {
    "id": "llm-fd-06",
    "deck": "P1 Foundations",
    "source": "Plan reading: Karpathy, Neural Networks: Zero to Hero (micrograd lecture)",
    "chapter": "micrograd and backprop",
    "prompt": "State the chain rule for y = f(g(x)) and explain why backprop is just the chain rule applied in reverse order.",
    "answer": "dy/dx = f'(g(x)) * g'(x). For vectors, multiply Jacobians: dy/dx = J_f * J_g.\nA network is a long composition. Backprop starts with dL/dL = 1 at the loss and walks backward, multiplying each node's local derivative into the upstream gradient. Going backward means you only ever multiply a vector (the upstream gradient) by a Jacobian, which is cheap. Going forward would multiply full Jacobian matrices.\nCost: backward is about 2x the forward FLOPs, so forward + backward is about 3x forward.",
    "pattern": "Backprop = chain rule from the loss backward, vector-Jacobian products only."
  },
  {
    "id": "llm-fd-07",
    "deck": "P1 Foundations",
    "source": "Plan reading: Karpathy, Neural Networks: Zero to Hero (micrograd lecture)",
    "chapter": "micrograd and backprop",
    "prompt": "For y = x W (x is (n, d), W is (d, h)) and upstream gradient G = dL/dy of shape (n, h), what are dL/dW and dL/dx?",
    "answer": "dL/dW = x^T G, shape (d, n)(n, h) = (d, h).\ndL/dx = G W^T, shape (n, h)(h, d) = (n, d).\nTrick: the gradient must have the same shape as the thing it is for, and there is usually only one way to multiply the pieces to get that shape.\nFLOPs: each of these is another 2*n*d*h, so backward costs 2x the forward matmul.",
    "pattern": "dW = x^T G, dx = G W^T. Let the shapes tell you the order."
  },
  {
    "id": "llm-nn-01",
    "deck": "P1 Foundations",
    "source": "Plan reading: Karpathy, Neural Networks: Zero to Hero (micrograd lecture)",
    "chapter": "micrograd and backprop",
    "prompt": "Backprop by hand: L = (w*x + b - y)^2 with w=2, x=3, b=1, y=5. Compute L, dL/dw, dL/db.",
    "answer": "Forward: w*x + b = 7, error e = 7 - 5 = 2, L = 4.\ndL/de = 2e = 4.\nde/dw = x = 3, so dL/dw = 4 * 3 = 12.\nde/db = 1, so dL/db = 4.\nAn SGD step with lr 0.01: w = 2 - 0.12 = 1.88, b = 1 - 0.04 = 0.96.",
    "pattern": "Forward, save intermediates, multiply local derivatives backward."
  },
  {
    "id": "llm-nn-02",
    "deck": "P1 Foundations",
    "source": "Plan reading: Karpathy, Neural Networks: Zero to Hero (micrograd lecture)",
    "chapter": "micrograd and backprop",
    "prompt": "Local gradients: what do add, multiply, max, and copy (fan-out) nodes do to the upstream gradient?",
    "answer": "Add: passes the upstream gradient unchanged to both inputs (gradient distributor).\nMultiply: each input gets upstream times the other input (swap).\nMax: routes the full gradient to whichever input was largest, 0 to the rest (router). ReLU is max(0, x).\nCopy or fan-out (one value used in two places): gradients from both uses add up. Forgetting to accumulate is a classic bug in hand-written autograd.",
    "pattern": "Add distributes, mul swaps, max routes, fan-out sums."
  },
  {
    "id": "llm-nn-03",
    "deck": "P1 Foundations",
    "source": "Plan reading: Karpathy, Neural Networks: Zero to Hero (micrograd lecture)",
    "chapter": "micrograd and backprop",
    "prompt": "Why must an autograd engine visit nodes in reverse topological order?",
    "answer": "A node's gradient is the sum of contributions from every node that used it. You can only propagate it further once all those contributions are in. Reverse topological order guarantees every consumer is processed before the producer.\nThis is exactly how micrograd and PyTorch work: build the graph during forward, topo-sort, then call each node's backward from the loss outward.",
    "pattern": "Finish all consumers before a producer. That is reverse topo order."
  },
  {
    "id": "llm-nn-04",
    "deck": "P1 Foundations",
    "source": "Plan reading: Karpathy, Neural Networks: Zero to Hero (micrograd lecture)",
    "chapter": "micrograd and backprop",
    "prompt": "What is the vanishing gradient problem, and which three design choices in modern nets mostly fixed it?",
    "answer": "Backprop multiplies many local derivatives. If they are usually below 1 (for example sigmoid's max derivative is 0.25), the product shrinks exponentially with depth and early layers stop learning.\nFixes: (1) ReLU-family activations with derivative 1 on the active side, (2) residual connections, whose identity path gives gradients a direct route, (3) normalization layers that keep activations in a healthy range. Careful init helps too.",
    "pattern": "Deep products shrink. Residuals, ReLU-like activations, and norms fix it."
  },
  {
    "id": "llm-nn-05",
    "deck": "P1 Foundations",
    "source": "Plan reading: Karpathy, Neural Networks: Zero to Hero (micrograd lecture)",
    "chapter": "micrograd and backprop",
    "prompt": "What is gradient checking, and when is it worth doing?",
    "answer": "Compare your analytic gradient to a finite difference: (L(w + h) - L(w - h)) / (2h), h about 1e-5, in float64. Relative error under about 1e-6 is good, above 1e-3 means a bug.\nWorth it when you hand-write a backward pass (custom CUDA or Triton kernel, custom autograd Function). torch.autograd.gradcheck does it for you.",
    "pattern": "Centered finite differences in float64. Use it for custom backward passes."
  },
  {
    "id": "llm-p1-03",
    "deck": "P1 Foundations",
    "source": "Plan reading: Karpathy, Neural Networks: Zero to Hero (micrograd lecture)",
    "chapter": "micrograd and backprop",
    "prompt": "What does a micrograd Value store? Write its tanh with the backward closure, and explain why gradients use +=.",
    "answer": "A Value stores: data (a float), grad (starts at 0), _prev (the child Values it was built from), _op (a label) and _backward (a closure that pushes out.grad into the children).\n\ndef tanh(self):\n    t = math.tanh(self.data)\n    out = Value(t, (self,), \"tanh\")\n    def _backward():\n        self.grad += (1 - t ** 2) * out.grad\n    out._backward = _backward\n    return out\n\nbackward() builds a topological order of the graph, sets self.grad = 1, then calls _backward on each node in reverse order.\nWhy +=: a node can feed several consumers (a = b + b, or a weight used at many positions). Its gradient is the sum over all paths (multivariate chain rule), so each consumer adds its contribution. Using = would keep only the last path. This is also why you must zero gradients between steps.",
    "pattern": "Value = data, grad, children, op, _backward. Gradients accumulate with += because of multiple paths."
  },
  {
    "id": "llm-p1-build-02",
    "deck": "P1 Foundations",
    "source": "Plan reading: Karpathy, Neural Networks: Zero to Hero (micrograd lecture)",
    "chapter": "micrograd and backprop",
    "prompt": "Build this: Your own micrograd plus a backprop blog post",
    "answer": "Spec: A scalar autograd engine written from memory (Value with +, *, **, exp, tanh, relu, backward), a small Neuron / Layer / MLP library on top, and a blog post deriving backprop.\n\nSteps:\n1. Write Value and backward() without looking at Karpathy's code.\n2. Test: build 100 random expressions, compute gradients with your engine and with PyTorch, assert the max difference is below 1e-6.\n3. Train a 2-16-16-1 MLP on a 2D toy dataset (moons) with plain SGD and a hinge or MSE loss. Plot the decision boundary.\n4. Blog: derive the backward pass of a 2-layer MLP by hand with a drawn computation graph, then show the same numbers coming out of your engine.\n\nSuccess looks like: Random-graph tests pass against PyTorch, the toy dataset is fit (near 100% train accuracy), and a reader could implement backprop from your post alone.",
    "pattern": "Build this: Your own micrograd plus a backprop blog post"
  },
  {
    "id": "llm-fd-08",
    "deck": "P1 Foundations",
    "source": "Plan reading: MML book (probability and optimization chapters); Zero to Hero",
    "chapter": "Probability, losses and optimizers",
    "prompt": "Why is the gradient the direction of steepest ascent, and what does a learning rate actually control?",
    "answer": "To first order, L(w + dw) is about L(w) + g . dw. For a fixed step length, the dot product g . dw is largest when dw points along g, so -g is steepest descent.\nThe learning rate sets the step size: w <- w - lr * g. The first-order approximation only holds locally. If lr is too large relative to the curvature (roughly lr > 2 / largest Hessian eigenvalue for plain GD on a quadratic), the loss oscillates or diverges.",
    "pattern": "Gradient = best local direction. LR must stay under about 2 / curvature."
  },
  {
    "id": "llm-fd-09",
    "deck": "P1 Foundations",
    "source": "Plan reading: MML book (probability and optimization chapters); Zero to Hero",
    "chapter": "Probability, losses and optimizers",
    "prompt": "Write softmax, and explain why you subtract max(z) before exponentiating.",
    "answer": "softmax(z)_i = exp(z_i) / sum_j exp(z_j).\nSoftmax is shift-invariant: subtracting a constant c from every logit multiplies top and bottom by exp(-c), so nothing changes. Subtracting max(z) makes the largest exponent exp(0) = 1, which prevents overflow (exp(1000) is inf in float32). Libraries do this, plus log-sum-exp for log-probs.",
    "pattern": "Softmax is shift-invariant. Subtract the max for numerical safety."
  },
  {
    "id": "llm-fd-10",
    "deck": "P1 Foundations",
    "source": "Plan reading: MML book (probability and optimization chapters); Zero to Hero",
    "chapter": "Probability, losses and optimizers",
    "prompt": "For softmax followed by cross-entropy with a one-hot target y, what is the gradient with respect to the logits z?",
    "answer": "L = -log p_y where p = softmax(z).\ndL/dz_i = p_i - y_i.\nSo the gradient pushes up the correct logit by (1 - p_y) and pushes down every wrong logit by its probability. It is bounded in [-1, 1], which is one reason this pairing trains so stably. This is why frameworks fuse them (F.cross_entropy takes raw logits).",
    "pattern": "Softmax + CE gradient = p - y. Pass logits, not probabilities."
  },
  {
    "id": "llm-fd-11",
    "deck": "P1 Foundations",
    "source": "Plan reading: MML book (probability and optimization chapters); Zero to Hero",
    "chapter": "Probability, losses and optimizers",
    "prompt": "A freshly initialized language model has vocab size 50,257. What loss should you see on step 0, and why is this a useful sanity check?",
    "answer": "With near-uniform predictions, p = 1/V for every token, so cross-entropy = ln(V) = ln(50257) = about 10.82 nats.\nFor Llama 3's vocab of 128,256 it is about 11.76.\nIf your step-0 loss is much higher (say 30), the logits are too large at init, often from a bad init scale or a missing scaling factor. Check this before burning compute.",
    "pattern": "Initial loss should be about ln(vocab). If not, your init is off."
  },
  {
    "id": "llm-fd-12",
    "deck": "P1 Foundations",
    "source": "Plan reading: MML book (probability and optimization chapters); Zero to Hero",
    "chapter": "Probability, losses and optimizers",
    "prompt": "What is maximum likelihood estimation, and why is minimizing cross-entropy on next tokens the same thing?",
    "answer": "MLE picks parameters that maximize the probability of the observed data: max over theta of prod_i p_theta(x_i), or equivalently the sum of log p_theta(x_i).\nA language model factorizes p(sequence) = prod_t p(x_t | x_<t). Taking -log and averaging gives the mean next-token cross-entropy. So pretraining is MLE.\nIt also equals minimizing KL(p_data || p_theta) up to the data entropy, which is a constant.",
    "pattern": "Next-token CE = negative log-likelihood = MLE = forward KL to the data."
  },
  {
    "id": "llm-fd-13",
    "deck": "P1 Foundations",
    "source": "Plan reading: MML book (probability and optimization chapters); Zero to Hero",
    "chapter": "Probability, losses and optimizers",
    "prompt": "What is perplexity, and how does it relate to the loss number you see in training logs?",
    "answer": "Perplexity = exp(mean cross-entropy in nats). Loss 2.0 means perplexity e^2 = about 7.4, roughly 'as uncertain as picking uniformly among 7.4 tokens'.\nCaveat: perplexity is only comparable between models with the same tokenizer. A tokenizer with longer tokens has fewer, harder predictions per document. Use bits per byte (or per character) to compare across tokenizers.",
    "pattern": "PPL = exp(loss). Compare across tokenizers with bits per byte."
  },
  {
    "id": "llm-ip-06",
    "deck": "P1 Foundations",
    "source": "Plan reading: MML book (probability and optimization chapters); Zero to Hero",
    "chapter": "Probability, losses and optimizers",
    "prompt": "Implement numerically stable softmax cross-entropy and its gradient in NumPy.",
    "answer": "def ce_loss_and_grad(z, y):           # z: (N, V) logits, y: (N,) labels\n    N = z.shape[0]\n    z = z - z.max(axis=1, keepdims=True)\n    logp = z - np.log(np.exp(z).sum(axis=1, keepdims=True))\n    loss = -logp[np.arange(N), y].mean()\n    grad = np.exp(logp)\n    grad[np.arange(N), y] -= 1\n    return loss, grad / N\nThe gradient is (softmax - one_hot) / N because the loss is a mean. Check it with a finite-difference test on a tiny input.",
    "pattern": "Subtract max, log-sum-exp, grad = (p - onehot) / N."
  },
  {
    "id": "llm-fd-16",
    "deck": "P1 Foundations",
    "source": "Plan reading: MML book (probability and optimization chapters); Zero to Hero",
    "chapter": "Probability, losses and optimizers",
    "prompt": "Plain SGD vs SGD with momentum: write the update and say what momentum buys you.",
    "answer": "SGD: w <- w - lr * g.\nMomentum: v <- mu * v + g; w <- w - lr * v (mu usually 0.9).\nMomentum averages gradients over about 1/(1-mu) = 10 steps. Noise in directions that keep flipping sign cancels, while consistent directions build speed. It helps in narrow valleys where plain SGD zigzags.",
    "pattern": "Momentum = moving average of gradients. Cancels zigzag, speeds up the valley."
  },
  {
    "id": "llm-fd-17",
    "deck": "P1 Foundations",
    "source": "Plan reading: MML book (probability and optimization chapters); Zero to Hero",
    "chapter": "Probability, losses and optimizers",
    "prompt": "Write the Adam update and explain bias correction.",
    "answer": "m <- b1 m + (1-b1) g\nv <- b2 v + (1-b2) g^2\nm_hat = m / (1 - b1^t), v_hat = v / (1 - b2^t)\nw <- w - lr * m_hat / (sqrt(v_hat) + eps)\nm and v start at 0, so early on they are biased toward 0. Dividing by (1 - b^t) fixes that. At t=1, m_hat = g exactly.\nEffect: each parameter gets its own step size, about lr in magnitude regardless of gradient scale. Typical LLM settings: b1 0.9, b2 0.95 (lower than the 0.999 default, for stability), eps 1e-8.",
    "pattern": "Adam = momentum / RMS of gradients, per parameter. LLMs use b2 about 0.95."
  },
  {
    "id": "llm-fd-18",
    "deck": "P1 Foundations",
    "source": "Plan reading: MML book (probability and optimization chapters); Zero to Hero",
    "chapter": "Probability, losses and optimizers",
    "prompt": "What is the difference between Adam with L2 regularization and AdamW?",
    "answer": "L2 regularization adds lambda * w to the gradient. In Adam that term then gets divided by sqrt(v_hat), so weights with large gradient history are barely regularized. The decay is uneven and tangled with the adaptive scaling.\nAdamW (Loshchilov and Hutter, 'Decoupled Weight Decay Regularization') applies decay directly: w <- w - lr * (adam_step + lambda * w). Every weight shrinks at the same relative rate.\nLLMs almost always use AdamW, weight decay around 0.1, and usually skip decay on biases and norm gains.",
    "pattern": "AdamW decouples decay from the adaptive step. No decay on norms and biases."
  },
  {
    "id": "llm-fd-20",
    "deck": "P1 Foundations",
    "source": "Plan reading: MML book (probability and optimization chapters); Zero to Hero",
    "chapter": "Probability, losses and optimizers",
    "prompt": "Describe the standard LLM learning-rate schedule and why warmup exists.",
    "answer": "Linear warmup from about 0 to peak LR over the first few hundred to few thousand steps, then cosine decay to about 10% of peak (or to near 0).\nWarmup: early on, Adam's v estimate is noisy and the weights are random, so big steps can blow up the loss. Ramping up gives the statistics time to settle.\nNewer alternative: warmup-stable-decay (WSD, a constant LR then a short sharp decay at the end). It lets you branch checkpoints from the stable phase and cool them down, which is handy for scaling studies. Which schedule is best is still argued about.",
    "pattern": "Warmup, then cosine (or WSD) decay. Warmup protects early Adam stats."
  },
  {
    "id": "llm-fd-21",
    "deck": "P1 Foundations",
    "source": "Plan reading: MML book (probability and optimization chapters); Zero to Hero",
    "chapter": "Probability, losses and optimizers",
    "prompt": "What is gradient clipping by global norm, and what value do LLM runs typically use?",
    "answer": "Compute the norm of all gradients concatenated: n = sqrt(sum of g^2). If n > c, scale every gradient by c / n. Direction is kept, magnitude capped.\nTypical c = 1.0. It guards against rare huge gradients from bad batches. Watch the grad-norm curve: spikes often come right before loss spikes.",
    "pattern": "Clip global grad norm to 1.0. Grad-norm spikes are an early warning."
  },
  {
    "id": "llm-fd-22",
    "deck": "P1 Foundations",
    "source": "Plan reading: MML book (probability and optimization chapters); Zero to Hero",
    "chapter": "Probability, losses and optimizers",
    "prompt": "Why does batch size interact with learning rate, and what is the critical batch size?",
    "answer": "A larger batch gives a less noisy gradient estimate, so you can take bigger steps. For SGD a rough rule is to scale LR linearly with batch size; for Adam it is closer to square root, and both break down at large batch.\nCritical batch size: above it, doubling the batch no longer halves the number of steps needed, so you are wasting compute. It grows as the loss gets lower, which is why LLM runs often ramp batch size up during training.",
    "pattern": "Bigger batch, bigger LR, until the critical batch size. Then it is wasted compute."
  },
  {
    "id": "llm-fd-26",
    "deck": "P1 Foundations",
    "source": "Plan reading: MML book (probability and optimization chapters); Zero to Hero",
    "chapter": "Probability, losses and optimizers",
    "prompt": "How do you tell overfitting from underfitting from the loss curves, and what is different about LLM pretraining?",
    "answer": "Underfitting: train and val loss both high and still falling. Use a bigger model or train longer.\nOverfitting: train loss keeps falling while val loss rises. Get more data, regularize, or stop early.\nLLM pretraining usually sees each token about once, so train and val loss track each other and overfitting is rare. Overfitting shows up in fine-tuning on small sets and when you repeat data for many epochs (repeating up to about 4 epochs costs little, more starts to hurt, per 'Scaling Data-Constrained Language Models').",
    "pattern": "Gap between train and val = overfit. Single-epoch pretraining rarely overfits."
  },
  {
    "id": "llm-fd-27",
    "deck": "P1 Foundations",
    "source": "Plan reading: MML book (probability and optimization chapters); Zero to Hero",
    "chapter": "Probability, losses and optimizers",
    "prompt": "List the regularizers you will actually meet in LLM work and when each is used.",
    "answer": "Weight decay (AdamW, about 0.1): almost always on.\nDropout: mostly off for large-scale pretraining (data is effectively infinite), sometimes on for fine-tuning small sets.\nEarly stopping: fine-tuning, based on val loss or eval scores.\nData augmentation and more data: the real fix for most generalization issues.\nIn RL fine-tuning, a KL penalty to the reference model acts as a regularizer that keeps the policy near its starting point.",
    "pattern": "Weight decay always, dropout rarely, KL to reference in RL."
  },
  {
    "id": "llm-fd-28",
    "deck": "P1 Foundations",
    "source": "Plan reading: MML book (probability and optimization chapters); Zero to Hero",
    "chapter": "Probability, losses and optimizers",
    "prompt": "What is the bias-variance tradeoff, and what is 'double descent'?",
    "answer": "Classical view: small models have high bias (underfit), big models have high variance (overfit), and test error is U-shaped in model size.\nDouble descent: as you keep growing the model past the point where it can exactly fit the training set, test error goes down again. Overparameterized nets trained with SGD generalize well, so the classical U is not the whole story. In LLM practice you mostly scale up and control generalization with more data.",
    "pattern": "Past interpolation, bigger often generalizes better again."
  },
  {
    "id": "llm-fd-29",
    "deck": "P1 Foundations",
    "source": "Plan reading: MML book (probability and optimization chapters); Zero to Hero",
    "chapter": "Probability, losses and optimizers",
    "prompt": "Why do you hold out a validation set and a separate test set, and what is the LLM-era version of the same mistake?",
    "answer": "You tune hyperparameters on validation. If you also report on it, your numbers are optimistic because you selected on them. The test set should be touched rarely.\nLLM version: benchmark contamination (test questions in pretraining data) and hill-climbing on a public benchmark until it stops measuring anything. Keep private held-out evals and refresh them.",
    "pattern": "Tune on val, report on untouched test. Contamination is the LLM version of leakage."
  },
  {
    "id": "llm-p1-build-03",
    "deck": "P1 Foundations",
    "source": "Plan reading: MML book (probability and optimization chapters); Zero to Hero",
    "chapter": "Probability, losses and optimizers",
    "prompt": "Build this: MLP with a hand-written optimizer",
    "answer": "Spec: A 2-layer MLP for MNIST where you write the forward pass, the backward pass and the optimizers (SGD with momentum, Adam, AdamW) yourself. Use tensors, but no autograd and no torch.optim.\n\nSteps:\n1. Implement linear, ReLU and softmax cross-entropy forward and backward by hand. Gradcheck each against finite differences in float64.\n2. Implement SGD with momentum and AdamW as plain update functions with explicit state (m, v, step count, bias correction).\n3. From the same init, run 20 steps of your AdamW and of torch.optim.AdamW on a model with autograd. Assert parameters match to about 1e-6.\n4. Train to convergence; plot train and val loss for SGD, momentum and AdamW on one figure.\n\nSuccess looks like: Gradchecks pass, your AdamW tracks torch's step for step, and the MLP reaches above 97% test accuracy. You can explain every line of the update without notes.",
    "pattern": "Build this: MLP with a hand-written optimizer"
  },
  {
    "id": "llm-p1-04",
    "deck": "P1 Foundations",
    "source": "Plan reading: Zero to Hero, makemore parts 1 to 5 (bigrams, MLP, BatchNorm, backprop ninja, WaveNet)",
    "chapter": "makemore",
    "prompt": "Build a bigram character model with counts. What is its loss, and why does a one-layer neural net trained by gradient descent end up at the same model?",
    "answer": "Counts: add a start/end token '.', count N[i, j] = how often char j follows char i, add smoothing (e.g. N + 1), normalize each row to get P[i, j].\nLoss: mean negative log-likelihood over all bigrams, -mean log P[x_t, x_t+1]. On Karpathy's names dataset this lands around 2.45 nats.\nNeural version: logits = one_hot(x) @ W with W of shape (27, 27), then softmax. Row i of W plays the role of log counts for char i.\nMinimizing cross-entropy drives softmax(W[i]) to the empirical next-char distribution after i, which is exactly the normalized count row. So both reach the same P.\nSmoothing corresponds to regularization: an L2 penalty on W pulls logits toward equal, i.e. toward uniform, just like adding fake counts.",
    "pattern": "Counts normalized per row equal the MLE; one-hot @ W with softmax learns the same rows. Smoothing ~ L2."
  },
  {
    "id": "llm-p1-05",
    "deck": "P1 Foundations",
    "source": "Plan reading: Zero to Hero, makemore parts 1 to 5 (bigrams, MLP, BatchNorm, backprop ninja, WaveNet)",
    "chapter": "makemore",
    "prompt": "Describe the Bengio et al. (2003) style MLP language model you build in makemore part 2, and what it fixes over bigrams.",
    "answer": "Context: the previous block_size characters (e.g. 3).\nEmbedding table C of shape (27, emb) maps each char to a vector (e.g. emb = 10).\nConcatenate the block_size embeddings into one vector, then a tanh hidden layer (e.g. 200 units), then a linear layer to 27 logits, then cross-entropy.\nWhat it fixes: an n-gram count table grows as 27^n and most entries are never seen. The MLP shares statistical strength: similar characters get similar embeddings, so what is learned about one context transfers to similar ones.\nPractice you learn here: train/dev/test splits, minibatches, an LR sweep on a log scale, and watching the dev loss to tune size. The dev loss lands well under the bigram's (around 2.1 to 2.2 on names, depending on settings).",
    "pattern": "Embed each context char, concatenate, tanh hidden, logits. Shared embeddings beat sparse count tables."
  },
  {
    "id": "llm-nn-06",
    "deck": "P1 Foundations",
    "source": "Plan reading: Zero to Hero, makemore parts 1 to 5 (bigrams, MLP, BatchNorm, backprop ninja, WaveNet)",
    "chapter": "makemore",
    "prompt": "Compare ReLU, GELU, and SwiGLU. Which one do current LLMs use?",
    "answer": "ReLU: max(0, x). Cheap, but units can die (stuck at 0 forever).\nGELU: x * Phi(x), a smooth ReLU. GPT-2 and BERT used it.\nSwiGLU (from 'GLU Variants Improve Transformer'): FFN(x) = (Swish(x W1) * (x W3)) W2, a gated unit where one branch gates the other elementwise. Llama, Mistral, Qwen, DeepSeek and most current open models use it.\nSwiGLU has three matrices, so the hidden size is cut to about (8/3) d instead of 4d to keep parameters equal.",
    "pattern": "Modern default is SwiGLU with hidden about 8/3 d."
  },
  {
    "id": "llm-nn-07",
    "deck": "P1 Foundations",
    "source": "Plan reading: Zero to Hero, makemore parts 1 to 5 (bigrams, MLP, BatchNorm, backprop ninja, WaveNet)",
    "chapter": "makemore",
    "prompt": "How many parameters are in a standard transformer MLP block with d=4096, comparing a 4d GELU MLP to a SwiGLU MLP with hidden 11008?",
    "answer": "GELU MLP: two matrices d x 4d and 4d x d = 8 d^2 = 8 * 4096^2 = 134.2M (ignoring biases).\nSwiGLU: three matrices d x 11008 (gate), d x 11008 (up), 11008 x d (down) = 3 * 4096 * 11008 = 135.3M.\nAbout the same. That is why Llama 2 7B used 11008, which is about (8/3) * 4096 = 10923 rounded up to a multiple of 256.",
    "pattern": "SwiGLU 3 matrices at 8/3 d match a 4d GELU MLP's 8 d^2 params."
  },
  {
    "id": "llm-nn-08",
    "deck": "P1 Foundations",
    "source": "Plan reading: Zero to Hero, makemore parts 1 to 5 (bigrams, MLP, BatchNorm, backprop ninja, WaveNet)",
    "chapter": "makemore",
    "prompt": "Why is softmax output saturated at init a problem, and how does it relate to the 'dead ReLU' issue?",
    "answer": "If logits are huge at init, softmax is nearly one-hot. Its gradient p - y is then near 0 for confident-correct and the model wastes early steps undoing confident-wrong predictions (the step-0 loss is far above ln V).\nSimilar issue for tanh/sigmoid units pushed to their flat tails: derivative near 0, no learning. Dead ReLUs are the extreme case: if a unit's pre-activation is negative for every input, its gradient is always 0 and it never recovers.\nFix in all cases: sensible init scale and normalization.",
    "pattern": "Saturated nonlinearities have near-zero gradient. Init small enough to avoid them."
  },
  {
    "id": "llm-fd-24",
    "deck": "P1 Foundations",
    "source": "Plan reading: Zero to Hero, makemore parts 1 to 5 (bigrams, MLP, BatchNorm, backprop ninja, WaveNet)",
    "chapter": "makemore",
    "prompt": "Why does weight initialization scale matter, and what is the idea behind Xavier and Kaiming init?",
    "answer": "You want activation variance to stay roughly constant layer to layer, so signals do not blow up or vanish.\nFor y = W x with fan_in inputs, Var(y) is about fan_in * Var(W) * Var(x). Setting Var(W) = 1/fan_in keeps it constant (Xavier uses 2/(fan_in + fan_out) as a compromise with the backward pass). ReLU zeroes half the inputs, so Kaiming uses 2/fan_in.\nGPT-2 style: normal(0, 0.02), and the residual output projections scaled by 1/sqrt(2 * n_layers) so the residual stream does not grow with depth.",
    "pattern": "Var(W) about 1/fan_in. Scale residual projections down by depth."
  },
  {
    "id": "llm-p1-06",
    "deck": "P1 Foundations",
    "source": "Plan reading: Zero to Hero, makemore parts 1 to 5 (bigrams, MLP, BatchNorm, backprop ninja, WaveNet)",
    "chapter": "makemore",
    "prompt": "How do you diagnose tanh saturation at init, and what scaling fixes it?",
    "answer": "Diagnostic: after one forward pass, plot a histogram of each hidden layer's tanh outputs and compute the fraction with |h| > 0.97. If a large fraction sit near +-1, the local gradient 1 - h^2 is near 0 and those units barely learn (a unit saturated for every example is effectively dead).\nCause: preactivations too large, because weights are too large for the fan-in.\nFix: initialize W with std = gain / sqrt(fan_in). For tanh the gain is 5/3 (torch.nn.init.calculate_gain('tanh')), for ReLU it is sqrt(2) (Kaiming).\nAlso: make the final layer's logits small at init (scale its weights down, zero its bias) so the initial loss is near ln(vocab size) instead of a large value caused by confident wrong guesses.\nBatchNorm or LayerNorm makes the network far less sensitive to these choices, which is a big part of why norms were adopted.",
    "pattern": "Histogram tanh outputs, count |h| > 0.97. Init std = gain / sqrt(fan_in), gain 5/3 for tanh."
  },
  {
    "id": "llm-nn-09",
    "deck": "P1 Foundations",
    "source": "Plan reading: Zero to Hero, makemore parts 1 to 5 (bigrams, MLP, BatchNorm, backprop ninja, WaveNet)",
    "chapter": "makemore",
    "prompt": "BatchNorm vs LayerNorm: what does each normalize over, and why do transformers use LayerNorm?",
    "answer": "BatchNorm: per feature, normalize across the batch (and spatial dims). Needs batch statistics, behaves differently in train vs eval, and breaks with small or variable batches and with padded sequences.\nLayerNorm: per token, normalize across the feature dim d. No dependence on other examples, identical in train and inference, works with any batch size and sequence length.\nAutoregressive decoding processes one token at a time, so batch statistics make no sense there. LayerNorm (or RMSNorm) it is.",
    "pattern": "BatchNorm = across examples. LayerNorm = across features of one token."
  },
  {
    "id": "llm-p1-07",
    "deck": "P1 Foundations",
    "source": "Plan reading: Zero to Hero, makemore parts 1 to 5 (bigrams, MLP, BatchNorm, backprop ninja, WaveNet)",
    "chapter": "makemore",
    "prompt": "Backprop ninja: derive the BatchNorm backward pass for one feature over a batch of N.",
    "answer": "Forward (biased variance): mu = mean(x), var = mean((x - mu)^2), s = sqrt(var + eps), xh = (x - mu) / s, y = g xh + b.\nLet dy be the upstream gradient (length N).\nEasy ones: db = sum(dy), dg = sum(dy * xh), dxh = g dy.\nxh depends on x directly, through mu, and through s. Collecting the three paths:\ndx = (1 / (N s)) * (N dxh - sum(dxh) - xh * sum(dxh * xh))\nCheck the structure: subtracting sum(dxh) removes the component that only shifts all x (the mean is subtracted anyway), and subtracting xh * sum(dxh * xh) removes the component that only scales x (the variance is divided out). So dx always sums to 0 and is orthogonal to xh.\n(makemore part 4 uses the unbiased variance with N - 1 during training, which changes one constant; derive whichever you implement and gradcheck it.)",
    "pattern": "dx = (N dxh - sum dxh - xh sum(dxh xh)) / (N s): remove the shift and scale directions."
  },
  {
    "id": "llm-nn-13",
    "deck": "P1 Foundations",
    "source": "Plan reading: Zero to Hero, makemore parts 1 to 5 (bigrams, MLP, BatchNorm, backprop ninja, WaveNet)",
    "chapter": "makemore",
    "prompt": "What does dropout do at train vs eval time, and what is the most common bug with it?",
    "answer": "Train: zero each activation with probability p and scale the survivors by 1/(1-p) (inverted dropout) so the expected value is unchanged.\nEval: do nothing.\nCommon bug: forgetting model.eval() before evaluation or generation, so dropout stays on and results are noisy and worse. Forgetting model.train() afterward is the mirror bug. Most big pretraining runs set dropout to 0 anyway.",
    "pattern": "Dropout only in train mode. model.eval() before eval."
  },
  {
    "id": "llm-p1-build-04",
    "deck": "P1 Foundations",
    "source": "Plan reading: Zero to Hero, makemore parts 1 to 5 (bigrams, MLP, BatchNorm, backprop ninja, WaveNet)",
    "chapter": "makemore",
    "prompt": "Build this: Char-level model with loss curves",
    "answer": "Spec: Train makemore style character models on a names dataset (or Tiny Shakespeare): bigram counts, the MLP, and a deeper hierarchical (WaveNet style) model, with clean train/dev curves for each.\n\nSteps:\n1. Implement all three models; fix a split and a seed.\n2. Get the bigram baseline loss first, then beat it with the MLP.\n3. Add BatchNorm (or LayerNorm) and proper init; show the activation and gradient histograms before and after.\n4. Write the backward pass for the MLP plus BatchNorm by hand once and gradcheck it.\n5. Plot train vs dev loss over steps for every model on one figure; sample 20 names from each.\n\nSuccess looks like: A table of dev losses that improves monotonically from bigram to MLP to the deeper model, no unexplained gap between train and dev, and samples that visibly improve. You can explain each improvement.",
    "pattern": "Build this: Char-level model with loss curves"
  },
  {
    "id": "llm-p1-08",
    "deck": "P1 Foundations",
    "source": "Plan reading: Vaswani et al. 2017, Attention Is All You Need (arXiv 1706.03762); Zero to Hero, Let's build GPT",
    "chapter": "Attention Is All You Need and building GPT",
    "prompt": "What was the original Transformer's base configuration and training recipe?",
    "answer": "Encoder-decoder for machine translation (WMT English-German and English-French).\nBase model: 6 encoder and 6 decoder layers, d_model = 512, 8 heads (d_k = d_v = 64), feed-forward d_ff = 2048, about 65M parameters.\nPost-LN residual blocks (norm after the residual add), sinusoidal position encodings, shared embedding and output weights.\nRegularization: dropout 0.1, label smoothing 0.1.\nOptimizer: Adam (beta2 = 0.98) with lr = d_model^-0.5 * min(step^-0.5, step * warmup^-1.5), warmup = 4000 steps: linear warmup, then inverse square root decay.\nDecoder-only GPT models keep the core block but drop the encoder and cross-attention, and later moved to pre-norm.",
    "pattern": "6+6 layers, d_model 512, 8 heads, d_ff 2048, post-LN, warmup 4000 then 1/sqrt(step)."
  },
  {
    "id": "llm-tf-05",
    "deck": "P1 Foundations",
    "source": "Plan reading: Vaswani et al. 2017, Attention Is All You Need (arXiv 1706.03762); Zero to Hero, Let's build GPT",
    "chapter": "Attention Is All You Need and building GPT",
    "prompt": "Write scaled dot-product attention and give every shape for one head with sequence length T and head dim d_k.",
    "answer": "Attention(Q, K, V) = softmax(Q K^T / sqrt(d_k) + M) V\nQ, K, V: (T, d_k) each (projections of the input X (T, d) by W_q, W_k, W_v).\nQ K^T: (T, T), score of each query against each key.\nM: mask, 0 where allowed and -inf where blocked.\nsoftmax over the last dim (each row sums to 1).\nResult: (T, T) @ (T, d_k) = (T, d_k), a weighted average of value vectors per query.",
    "pattern": "softmax(QK^T / sqrt(d_k)) V. Scores are T x T, output is T x d_k.",
    "answerImage": "/llm/transformers/attention-shapes.png"
  },
  {
    "id": "llm-tf-06",
    "deck": "P1 Foundations",
    "source": "Plan reading: Vaswani et al. 2017, Attention Is All You Need (arXiv 1706.03762); Zero to Hero, Let's build GPT",
    "chapter": "Attention Is All You Need and building GPT",
    "prompt": "Why divide by sqrt(d_k)?",
    "answer": "If q and k have independent entries with mean 0 and variance 1, then q . k is a sum of d_k such products, with variance d_k. For d_k = 128 the scores have standard deviation about 11, so softmax saturates to nearly one-hot and gradients vanish.\nDividing by sqrt(d_k) brings the variance back to 1.",
    "pattern": "q.k has variance d_k. Divide by sqrt(d_k) to keep softmax soft."
  },
  {
    "id": "llm-tf-07",
    "deck": "P1 Foundations",
    "source": "Plan reading: Vaswani et al. 2017, Attention Is All You Need (arXiv 1706.03762); Zero to Hero, Let's build GPT",
    "chapter": "Attention Is All You Need and building GPT",
    "prompt": "How does causal masking work, and why is it applied before softmax rather than after?",
    "answer": "Build a (T, T) mask where position i may attend to j only if j <= i. Set the blocked (upper triangle) scores to -inf before softmax. exp(-inf) = 0, so those keys get exactly zero weight and each row still sums to 1.\nZeroing after softmax would leave rows that no longer sum to 1, and future information would already have leaked into the normalization.\nThis lets you train on all T next-token predictions in one parallel forward pass.",
    "pattern": "Fill future scores with -inf before softmax. One pass trains all T positions.",
    "answerImage": "/llm/transformers/attention-shapes.png"
  },
  {
    "id": "llm-tf-08",
    "deck": "P1 Foundations",
    "source": "Plan reading: Vaswani et al. 2017, Attention Is All You Need (arXiv 1706.03762); Zero to Hero, Let's build GPT",
    "chapter": "Attention Is All You Need and building GPT",
    "prompt": "Multi-head attention: with d_model = 4096 and 32 heads, what is the head dim, and what is the point of multiple heads?",
    "answer": "head_dim = 4096 / 32 = 128.\nProject X to Q, K, V of width 4096, reshape to (B, 32, T, 128), run attention per head in parallel, concatenate back to (B, T, 4096), then apply the output projection W_o.\nEach head can attend to different things (previous token, syntax, a matching name earlier in context). Total cost is about the same as one big head.\nParams: W_q, W_k, W_v, W_o each 4096 x 4096 = 4 * 16.8M = 67.1M per layer.",
    "pattern": "Split d into h heads of d/h. Same FLOPs, many attention patterns.",
    "answerImage": "/llm/transformers/attention-shapes.png"
  },
  {
    "id": "llm-tf-09",
    "deck": "P1 Foundations",
    "source": "Plan reading: Vaswani et al. 2017, Attention Is All You Need (arXiv 1706.03762); Zero to Hero, Let's build GPT",
    "chapter": "Attention Is All You Need and building GPT",
    "prompt": "Write the reshape steps for multi-head attention in PyTorch, from x of shape (B, T, C) to output (B, T, C).",
    "answer": "q, k, v = self.qkv(x).split(C, dim=2)            # each (B, T, C)\nq = q.view(B, T, nh, hd).transpose(1, 2)        # (B, nh, T, hd)\nk = k.view(B, T, nh, hd).transpose(1, 2)\nv = v.view(B, T, nh, hd).transpose(1, 2)\ny = F.scaled_dot_product_attention(q, k, v, is_causal=True)  # (B, nh, T, hd)\ny = y.transpose(1, 2).contiguous().view(B, T, C)\nreturn self.proj(y)\nHeads become a batch dim so one batched matmul handles all of them.",
    "pattern": "view to (B, T, nh, hd), transpose heads forward, attend, transpose back, merge."
  },
  {
    "id": "llm-tf-10",
    "deck": "P1 Foundations",
    "source": "Plan reading: Vaswani et al. 2017, Attention Is All You Need (arXiv 1706.03762); Zero to Hero, Let's build GPT",
    "chapter": "Attention Is All You Need and building GPT",
    "prompt": "What is the memory and compute cost of attention in sequence length T, and what part of the model dominates at short context?",
    "answer": "Score matrix: T x T per head, so naive memory is O(T^2) and FLOPs for QK^T and AV are about 4 * T * d per token per layer (forward).\nThe projections and MLP cost about 2N FLOPs per token regardless of T.\nGPT-2 small at T=1024: attention scores about 4 * 12 * 1024 * 768 = 37.7M FLOPs per token vs 2N = 249M. So about 15%, and the MLP and projections dominate. Attention becomes dominant only at long context (tens of thousands of tokens for mid-size models).",
    "pattern": "Attention is O(T^2), but at short context the matmuls in projections and MLP dominate."
  },
  {
    "id": "llm-ip-01",
    "deck": "P1 Foundations",
    "source": "Plan reading: Vaswani et al. 2017, Attention Is All You Need (arXiv 1706.03762); Zero to Hero, Let's build GPT",
    "chapter": "Attention Is All You Need and building GPT",
    "prompt": "Implement causal multi-head self-attention from scratch in PyTorch (no SDPA).",
    "answer": "class CausalSelfAttention(nn.Module):\n    def __init__(self, d, n_head, max_len):\n        super().__init__()\n        self.nh, self.hd = n_head, d // n_head\n        self.qkv = nn.Linear(d, 3 * d, bias=False)\n        self.proj = nn.Linear(d, d, bias=False)\n        mask = torch.tril(torch.ones(max_len, max_len, dtype=torch.bool))\n        self.register_buffer(\"mask\", mask)\n\n    def forward(self, x):\n        B, T, C = x.shape\n        q, k, v = self.qkv(x).split(C, dim=2)\n        q, k, v = [t.view(B, T, self.nh, self.hd).transpose(1, 2) for t in (q, k, v)]\n        att = (q @ k.transpose(-2, -1)) / math.sqrt(self.hd)    # (B, nh, T, T)\n        att = att.masked_fill(~self.mask[:T, :T], float(\"-inf\"))\n        att = att.softmax(dim=-1)\n        y = att @ v                                             # (B, nh, T, hd)\n        y = y.transpose(1, 2).contiguous().view(B, T, C)\n        return self.proj(y)\nTrack the shape at every line. In real code use F.scaled_dot_product_attention(is_causal=True), which dispatches to a fused flash kernel.",
    "pattern": "qkv, split heads, scale, mask with -inf, softmax, @ v, merge heads, project.",
    "answerImage": "/llm/transformers/attention-shapes.png"
  },
  {
    "id": "llm-tf-11",
    "deck": "P1 Foundations",
    "source": "Plan reading: Vaswani et al. 2017, Attention Is All You Need (arXiv 1706.03762); Zero to Hero, Let's build GPT",
    "chapter": "Attention Is All You Need and building GPT",
    "prompt": "Why does a transformer need positional information at all?",
    "answer": "Self-attention without positions is permutation-equivariant: shuffle the input tokens and the outputs shuffle the same way. 'dog bites man' and 'man bites dog' would look identical to every layer except the causal mask.\nThe causal mask does leak some position info, but explicit positional encodings work much better.",
    "pattern": "Attention is a set operation. Positions must be injected."
  },
  {
    "id": "llm-tf-12",
    "deck": "P1 Foundations",
    "source": "Plan reading: Vaswani et al. 2017, Attention Is All You Need (arXiv 1706.03762); Zero to Hero, Let's build GPT",
    "chapter": "Attention Is All You Need and building GPT",
    "prompt": "Sinusoidal vs learned absolute position embeddings: how do they work?",
    "answer": "Sinusoidal (original Transformer): PE(pos, 2i) = sin(pos / 10000^(2i/d)), PE(pos, 2i+1) = cos(same). Each pair of dims is a sinusoid with a different wavelength, added to the token embedding. No parameters.\nLearned absolute (GPT-2): a trainable table of shape (max_len, d), also added to the embedding.\nBoth inject absolute position and extend poorly past the training length. Modern models use RoPE instead.",
    "pattern": "Absolute PEs are added to the embedding. Neither extrapolates well."
  },
  {
    "id": "llm-nn-12",
    "deck": "P1 Foundations",
    "source": "Plan reading: Vaswani et al. 2017, Attention Is All You Need (arXiv 1706.03762); Zero to Hero, Let's build GPT",
    "chapter": "Attention Is All You Need and building GPT",
    "prompt": "What is the 'residual stream' view of a transformer?",
    "answer": "Each block reads from and adds back into one shared vector per token: x_{l+1} = x_l + attn(...) + mlp(...). Nothing ever overwrites the stream; layers only add.\nSo the final representation is the embedding plus a sum of every layer's contribution. This is the mental model used in interpretability work, and it explains why residuals help optimization: the gradient of the output with respect to x_l includes a direct identity term.",
    "pattern": "Layers write additive updates into a shared stream.",
    "answerImage": "/llm/transformers/transformer-block.png"
  },
  {
    "id": "llm-tf-15",
    "deck": "P1 Foundations",
    "source": "Plan reading: Vaswani et al. 2017, Attention Is All You Need (arXiv 1706.03762); Zero to Hero, Let's build GPT",
    "chapter": "Attention Is All You Need and building GPT",
    "prompt": "Walk through a GPT-2-style decoder forward pass from token ids to next-token logits.",
    "answer": "1. ids (B, T) -> token embedding (B, T, d) + position embedding (T, d).\n2. For each of L blocks (pre-norm):\n   x = x + Attn(LN(x))   with causal mask\n   x = x + MLP(LN(x))    d -> 4d -> GELU -> d\n3. Final LN(x).\n4. logits = x @ W_emb^T, shape (B, T, V) (GPT-2 ties output head to the input embedding).\n5. Training: cross-entropy between logits[:, t] and ids[:, t+1].\nLlama-style changes: RoPE instead of learned positions, RMSNorm, SwiGLU, no biases, untied head in larger models, GQA.",
    "pattern": "Embed, L x (x + attn(norm), x + mlp(norm)), norm, unembed.",
    "answerImage": "/llm/transformers/transformer-block.png"
  },
  {
    "id": "llm-tf-26",
    "deck": "P1 Foundations",
    "source": "Plan reading: Vaswani et al. 2017, Attention Is All You Need (arXiv 1706.03762); Zero to Hero, Let's build GPT",
    "chapter": "Attention Is All You Need and building GPT",
    "prompt": "Encoder-only vs encoder-decoder vs decoder-only: why did decoder-only win for LLMs?",
    "answer": "Encoder-only (BERT): bidirectional, trained with masked tokens. Great for classification and embeddings, cannot generate fluently.\nEncoder-decoder (T5, original Transformer): encoder reads input bidirectionally, decoder generates with cross-attention. Good for translation and summarization.\nDecoder-only (GPT): one stack, causal, next-token loss on every token. Simplest, every token is a training signal, scales cleanly, and any task can be phrased as text continuation. That simplicity plus scaling won.",
    "pattern": "Decoder-only: one causal stack, loss on every token, scales simply."
  },
  {
    "id": "llm-ip-09",
    "deck": "P1 Foundations",
    "source": "Plan reading: Vaswani et al. 2017, Attention Is All You Need (arXiv 1706.03762); Zero to Hero, Let's build GPT",
    "chapter": "Attention Is All You Need and building GPT",
    "prompt": "Your new GPT trains to a loss of 0.1 within a few hundred steps on web text. What happened?",
    "answer": "Way too good to be true; web text loss for small models sits around 3. The model is seeing the answer.\nLikely causes: causal mask missing or wrong (attending to future tokens), targets not shifted (predicting the current token, which is in the input), or train data duplicated into the eval set with a tiny dataset.\nCheck: make a forward pass where you change token t+1 and see if the prediction at position t changes. It must not.",
    "pattern": "Impossibly low loss = information leak. Test that future tokens cannot change past predictions."
  },
  {
    "id": "llm-p1-build-05",
    "deck": "P1 Foundations",
    "source": "Plan reading: Vaswani et al. 2017, Attention Is All You Need (arXiv 1706.03762); Zero to Hero, Let's build GPT",
    "chapter": "Attention Is All You Need and building GPT",
    "prompt": "Build this: GPT from scratch in under 300 lines",
    "answer": "Spec: A single-file decoder-only GPT (token and position embeddings, pre-norm blocks with causal multi-head attention and an MLP, weight tying, AdamW) trained on Tiny Shakespeare at character level, under 300 lines including the training loop.\n\nSteps:\n1. Write it from memory; only check Karpathy's video when stuck, and note where.\n2. Tests: overfit a single batch to near-zero loss; a causality test (changing token t must not change logits at positions before t); the initial loss is near ln(vocab size).\n3. Train a roughly 10M parameter model; log train and val loss; sample text.\n4. Swap your attention for F.scaled_dot_product_attention and assert the outputs match.\n\nSuccess looks like: All three tests pass, val loss lands around 1.5 nats per char on Tiny Shakespeare at that size, samples look like Shakespeare-shaped text, and the file is under 300 lines.",
    "pattern": "Build this: GPT from scratch in under 300 lines"
  },
  {
    "id": "llm-tf-01",
    "deck": "P1 Foundations",
    "source": "Plan reading: nanoGPT and build-nanogpt (Karpathy); RoFormer (arXiv 2104.09864)",
    "chapter": "nanoGPT, tokenization and RoPE",
    "prompt": "Run BPE by hand on the string 'aaabdaaabac' for three merges. What are the merges and the final sequence?",
    "answer": "Merge 1: the most frequent pair is 'aa' (4 times). Replace with Z: 'ZabdZabac'.\nMerge 2: 'ab' appears twice (also 'Za' twice; ties broken by order, here take 'ab'). Replace with Y: 'ZYdZYac'.\nMerge 3: 'ZY' appears twice. Replace with X: 'XdXac'.\nVocab grows by one per merge; sequence shrinks from 11 to 5 symbols. Training BPE = learn the ordered merge list. Encoding new text = apply the merges in that same order.",
    "pattern": "BPE: repeatedly merge the most frequent adjacent pair. Order of merges is the tokenizer."
  },
  {
    "id": "llm-tf-02",
    "deck": "P1 Foundations",
    "source": "Plan reading: nanoGPT and build-nanogpt (Karpathy); RoFormer (arXiv 2104.09864)",
    "chapter": "nanoGPT, tokenization and RoPE",
    "prompt": "Why do GPT-style tokenizers use byte-level BPE, and what does the pre-tokenization regex do?",
    "answer": "Byte-level: start from the 256 possible bytes, so any UTF-8 string is encodable and there is no unknown token.\nPre-tokenization: a regex first splits text into chunks (words with a leading space, runs of digits, punctuation, whitespace), and merges never cross chunk boundaries. This stops junk tokens like 'dog.' and 'dog!' from all becoming separate tokens and controls how numbers split (GPT-4's tokenizer splits digits into groups of at most 3).",
    "pattern": "Bytes as base vocab, regex chunks so merges stay sensible."
  },
  {
    "id": "llm-tf-03",
    "deck": "P1 Foundations",
    "source": "Plan reading: nanoGPT and build-nanogpt (Karpathy); RoFormer (arXiv 2104.09864)",
    "chapter": "nanoGPT, tokenization and RoPE",
    "prompt": "Name four model behaviors that are really tokenization problems.",
    "answer": "1. Spelling and character counting ('how many r's in strawberry'): the model sees multi-character tokens, not letters.\n2. Arithmetic quirks: numbers split into irregular chunks.\n3. Non-English text costs more tokens per word, so it is slower, pricier, and gets less effective context.\n4. Trailing whitespace and glitch tokens: tokens that were in the tokenizer's training data but almost never in the model's (the 'SolidGoldMagikarp' case) produce bizarre outputs.\nAlso: code indentation efficiency depends on whether runs of spaces are tokens.",
    "pattern": "When a model fails at characters, digits, or odd strings, suspect the tokenizer."
  },
  {
    "id": "llm-tf-04",
    "deck": "P1 Foundations",
    "source": "Plan reading: nanoGPT and build-nanogpt (Karpathy); RoFormer (arXiv 2104.09864)",
    "chapter": "nanoGPT, tokenization and RoPE",
    "prompt": "Vocab size tradeoff: what do you gain and lose going from 32K to 128K tokens?",
    "answer": "Gain: fewer tokens per document (Llama 3's 128K vocab encodes text with noticeably fewer tokens than Llama 2's 32K), so more text per context window and per FLOP, and better multilingual coverage.\nLose: bigger embedding and output matrices (V * d each). For d=4096, 128K vocab is about 525M params per matrix vs 131M at 32K. The softmax over V gets more expensive, and rare tokens get few training updates.\nFor big models the embedding cost is small relative to the total, so vocabs have grown.",
    "pattern": "Bigger vocab = shorter sequences, bigger embed and head matrices."
  },
  {
    "id": "llm-ip-02",
    "deck": "P1 Foundations",
    "source": "Plan reading: nanoGPT and build-nanogpt (Karpathy); RoFormer (arXiv 2104.09864)",
    "chapter": "nanoGPT, tokenization and RoPE",
    "prompt": "Implement byte-level BPE training and encoding.",
    "answer": "from collections import Counter\n\ndef merge(ids, pair, new_id):\n    out, i = [], 0\n    while i < len(ids):\n        if i + 1 < len(ids) and (ids[i], ids[i + 1]) == pair:\n            out.append(new_id); i += 2\n        else:\n            out.append(ids[i]); i += 1\n    return out\n\ndef train_bpe(text, num_merges):\n    ids = list(text.encode(\"utf-8\"))\n    merges = {}                                  # (a, b) -> new id, in order\n    for i in range(num_merges):\n        counts = Counter(zip(ids, ids[1:]))\n        if not counts:\n            break\n        pair = max(counts, key=counts.get)\n        merges[pair] = 256 + i\n        ids = merge(ids, pair, 256 + i)\n    return merges\n\ndef encode(text, merges):\n    ids = list(text.encode(\"utf-8\"))\n    while len(ids) >= 2:\n        pairs = set(zip(ids, ids[1:]))\n        pair = min(pairs, key=lambda p: merges.get(p, float(\"inf\")))\n        if pair not in merges:\n            break\n        ids = merge(ids, pair, merges[pair])\n    return ids\nEncoding applies merges in training order (lowest new id first). Real tokenizers also pre-split with a regex first.",
    "pattern": "Count pairs, merge the top one, record it. Encode by lowest-rank merge first."
  },
  {
    "id": "llm-tf-13",
    "deck": "P1 Foundations",
    "source": "Plan reading: nanoGPT and build-nanogpt (Karpathy); RoFormer (arXiv 2104.09864)",
    "chapter": "nanoGPT, tokenization and RoPE",
    "prompt": "How does RoPE work and why does it give relative position?",
    "answer": "Split q and k into pairs of dims. For a token at position m, rotate pair i by angle m * theta_i, with theta_i = base^(-2i/d) (base 10000 originally; Llama 3 uses 500,000).\nRotation preserves length, and the dot product of a q rotated by m with a k rotated by n depends only on (m - n). So attention scores depend on relative distance, while you still only touch q and k (not v, not the residual stream).\nPaper: Su et al., 'RoFormer'. Used in Llama, Mistral, Qwen, DeepSeek and most open models.",
    "pattern": "RoPE rotates q and k by position. Dot product sees only m - n.",
    "answerImage": "/llm/transformers/rope.png"
  },
  {
    "id": "llm-ip-05",
    "deck": "P1 Foundations",
    "source": "Plan reading: nanoGPT and build-nanogpt (Karpathy); RoFormer (arXiv 2104.09864)",
    "chapter": "nanoGPT, tokenization and RoPE",
    "prompt": "Implement RMSNorm and RoPE.",
    "answer": "class RMSNorm(nn.Module):\n    def __init__(self, d, eps=1e-6):\n        super().__init__()\n        self.eps = eps\n        self.g = nn.Parameter(torch.ones(d))\n    def forward(self, x):\n        return x * torch.rsqrt(x.pow(2).mean(-1, keepdim=True) + self.eps) * self.g\n\ndef rope(x, pos, base=10000.0):              # x: (B, nh, T, hd), pos: (T,)\n    hd = x.size(-1)\n    inv = base ** (-torch.arange(0, hd, 2, device=x.device).float() / hd)  # (hd/2,)\n    ang = pos[:, None].float() * inv[None, :]                           # (T, hd/2)\n    cos, sin = ang.cos(), ang.sin()\n    x1, x2 = x[..., 0::2], x[..., 1::2]\n    out = torch.stack([x1 * cos - x2 * sin, x1 * sin + x2 * cos], dim=-1)\n    return out.flatten(-2)\nApply rope to q and k (not v) before attention. This pairs adjacent dims; Hugging Face Llama pairs dim i with i + hd/2 instead. Both work, but must match the checkpoint.",
    "pattern": "RMSNorm: x * rsqrt(mean(x^2) + eps) * g. RoPE: rotate dim pairs by pos * theta_i.",
    "answerImage": "/llm/transformers/rope.png"
  },
  {
    "id": "llm-tf-16",
    "deck": "P1 Foundations",
    "source": "Plan reading: nanoGPT and build-nanogpt (Karpathy); RoFormer (arXiv 2104.09864)",
    "chapter": "nanoGPT, tokenization and RoPE",
    "prompt": "What is weight tying, and why do small models use it more than big ones?",
    "answer": "Use the same matrix for the input embedding (V x d) and the output projection (logits = h E^T). Saves V * d parameters, which is a big fraction of a small model: GPT-2 small saves 50257 * 768 = 38.6M of its 124M.\nFor a 70B model the embedding is a tiny fraction, and untied heads tend to do slightly better, so many large models do not tie.",
    "pattern": "Tie embed and head when vocab params are a big share of the model."
  },
  {
    "id": "llm-tf-17",
    "deck": "P1 Foundations",
    "source": "Plan reading: nanoGPT and build-nanogpt (Karpathy); RoFormer (arXiv 2104.09864)",
    "chapter": "nanoGPT, tokenization and RoPE",
    "prompt": "Count the parameters of GPT-2 small: V=50257, context 1024, d=768, 12 layers, tied embeddings.",
    "answer": "Token embedding: 50257 * 768 = 38.60M.\nPosition embedding: 1024 * 768 = 0.79M.\nPer block: attention 4 d^2 + 4d biases, MLP 8 d^2 + 5d biases, two LayerNorms 4d. That is 12 d^2 + 13 d = 7,087,872.\n12 blocks: 85.05M.\nFinal LayerNorm: 1,536.\nTotal: 124,439,808, about 124M. The head is tied, so no extra.",
    "pattern": "Per block about 12 d^2. Total = embeddings + 12 d^2 L."
  },
  {
    "id": "llm-tf-18",
    "deck": "P1 Foundations",
    "source": "Plan reading: nanoGPT and build-nanogpt (Karpathy); RoFormer (arXiv 2104.09864)",
    "chapter": "nanoGPT, tokenization and RoPE",
    "prompt": "Estimate Llama 2 7B's parameter count: d=4096, 32 layers, vocab 32000, SwiGLU hidden 11008, untied head, no biases.",
    "answer": "Attention: 4 * 4096^2 = 67.1M per layer.\nMLP: 3 * 4096 * 11008 = 135.3M per layer.\nPer layer: 202.4M. Times 32: 6.476B.\nEmbedding + head: 2 * 32000 * 4096 = 262.1M.\nNorm gains: about 0.27M.\nTotal: about 6.74B, which is the real number.",
    "pattern": "Llama count: L * (4 d^2 + 3 d d_ff) + 2 V d."
  },
  {
    "id": "llm-tf-21",
    "deck": "P1 Foundations",
    "source": "Plan reading: nanoGPT and build-nanogpt (Karpathy); RoFormer (arXiv 2104.09864)",
    "chapter": "nanoGPT, tokenization and RoPE",
    "prompt": "What is a KV cache and why does it make generation fast?",
    "answer": "In autoregressive decoding each new token attends to all previous tokens. Their keys and values do not change (causal mask), so store them.\nWithout a cache, step t recomputes K and V for all t tokens: total work grows like T^2 across a generation for the projections alone. With the cache, each step computes Q, K, V for just the new token, appends K and V, and attends over the cache.\nCost: memory that grows linearly with sequence length and batch size, and decode becomes memory-bandwidth bound.",
    "pattern": "Cache past K and V. Each decode step only processes the new token.",
    "answerImage": "/llm/transformers/kv-cache.png"
  },
  {
    "id": "llm-ip-04",
    "deck": "P1 Foundations",
    "source": "Plan reading: nanoGPT and build-nanogpt (Karpathy); RoFormer (arXiv 2104.09864)",
    "chapter": "nanoGPT, tokenization and RoPE",
    "prompt": "Implement generation with a KV cache and top-k sampling. What is the classic bug?",
    "answer": "@torch.no_grad()\ndef generate(model, ids, max_new, temperature=1.0, top_k=50):\n    cache, x = None, ids                       # first pass: whole prompt\n    for _ in range(max_new):\n        logits, cache = model(x, cache=cache)  # model appends new K, V to cache\n        logits = logits[:, -1, :] / temperature\n        kth = torch.topk(logits, top_k).values[:, -1:]\n        logits = logits.masked_fill(logits < kth, float(\"-inf\"))\n        nxt = torch.multinomial(logits.softmax(-1), 1)\n        ids = torch.cat([ids, nxt], dim=1)\n        x = nxt                                # later passes: one token\n    return ids\nClassic bug: position ids. With a cache, the new token's position is the cache length, not 0. Forgetting the offset (wrong RoPE angle or position embedding) gives fluent prompts and garbage continuations. Also: model.eval(), and stop on EOS.",
    "pattern": "Prefill once, then feed one token with the cache. Offset positions by cache length."
  },
  {
    "id": "llm-p1-09",
    "deck": "P1 Foundations",
    "source": "Plan reading: nanoGPT and build-nanogpt (Karpathy); RoFormer (arXiv 2104.09864)",
    "chapter": "nanoGPT, tokenization and RoPE",
    "prompt": "What does the GPT-2 (124M) reproduction in nanoGPT / build-nanogpt involve, and which speedups matter most?",
    "answer": "Model: GPT-2 small, 12 layers, 12 heads, d_model 768, context 1024, GPT-2 BPE tokenizer (vocab 50257).\nData: build-nanogpt trains on a 10B token sample of FineWeb-Edu and evaluates val loss plus HellaSwag accuracy, comparing against the released GPT-2 124M checkpoint.\nRecipe: AdamW (beta1 0.9, beta2 0.95, weight decay 0.1 on matrices only), warmup then cosine decay, gradient clipping at 1.0, a large batch (about 0.5M tokens) via gradient accumulation, DDP across GPUs.\nSpeedups, roughly in order of size: TF32 then bf16 autocast, torch.compile, flash attention through F.scaled_dot_product_attention, padding the vocab to 50304 (a multiple of 128 keeps matmul shapes kernel friendly), fused AdamW.\nThe lesson is the method: measure tokens per second after each change, keep what helps.",
    "pattern": "GPT-2 small on 10B FineWeb-Edu tokens; bf16, compile, flash attention, vocab 50304, fused AdamW."
  },
  {
    "id": "llm-p1-build-06",
    "deck": "P1 Foundations",
    "source": "Plan reading: nanoGPT and build-nanogpt (Karpathy); RoFormer (arXiv 2104.09864)",
    "chapter": "nanoGPT, tokenization and RoPE",
    "prompt": "Build this: GPT-2 small reproduction plus a thread",
    "answer": "Spec: Reproduce GPT-2 124M with your own code (nanoGPT as reference), on as many FineWeb-Edu tokens as your budget allows, and post a thread with the curves.\n\nSteps:\n1. Port your GPT-from-scratch model to the GPT-2 config and load the official GPT-2 weights into it; check your logits match Hugging Face's to about 1e-4. That proves the architecture.\n2. Add the data loader over pre-tokenized shards, DDP, bf16, compile and flash attention; log tokens/s and MFU.\n3. Train from scratch; evaluate val loss and HellaSwag every few hundred steps.\n4. Post the loss curve, HellaSwag curve, the speedup table and what surprised you.\n\nSuccess looks like: Weight loading matches HF logits, the run is stable, and your HellaSwag curve approaches the GPT-2 124M reference (about 29% acc_norm) for the tokens you trained on.",
    "pattern": "Build this: GPT-2 small reproduction plus a thread"
  },
  {
    "id": "llm-p1-10",
    "deck": "P1 Foundations",
    "source": "Plan reading: Stanford CS336 Language Modeling from Scratch, assignment 1 (basics)",
    "chapter": "Stanford CS336 assignment 1",
    "prompt": "What does CS336 assignment 1 have you build, and what are you not allowed to use?",
    "answer": "You build the whole small-LM stack yourself:\n- a byte-level BPE tokenizer trainer and an encoder/decoder (with pre-tokenization and special tokens)\n- Transformer pieces: Linear, Embedding, RMSNorm, SwiGLU, RoPE, softmax, scaled dot-product attention, multi-head causal attention, the pre-norm block and the full LM\n- cross-entropy, AdamW, a cosine LR schedule with warmup, gradient clipping\n- a data loader, checkpoint save/load, a training script and decoding\nThen train on TinyStories and OpenWebText and run experiments (LR sweeps, ablations such as removing RMSNorm or switching to post-norm).\nRestriction (roughly): no torch.nn layers, torch.nn.functional or torch.optim implementations; you may use nn.Parameter, the container classes and the Optimizer base class. Correctness is checked by the provided pytest suite through adapter functions.\nAlways check the current handout; details change between years.",
    "pattern": "Tokenizer, every Transformer component, AdamW and schedule by hand; tested via pytest adapters."
  },
  {
    "id": "llm-ip-03",
    "deck": "P1 Foundations",
    "source": "Plan reading: Stanford CS336 Language Modeling from Scratch, assignment 1 (basics)",
    "chapter": "Stanford CS336 assignment 1",
    "prompt": "Write a pretraining loop with gradient accumulation, bf16 autocast, clipping, and warmup plus cosine LR.",
    "answer": "def get_lr(step):\n    if step < warmup:\n        return max_lr * (step + 1) / warmup\n    progress = (step - warmup) / (max_steps - warmup)\n    return min_lr + 0.5 * (max_lr - min_lr) * (1 + math.cos(math.pi * progress))\n\nmodel.train()\nfor step in range(max_steps):\n    for g in opt.param_groups:\n        g[\"lr\"] = get_lr(step)\n    opt.zero_grad(set_to_none=True)\n    for _ in range(accum):\n        x, y = next(loader)\n        with torch.autocast(\"cuda\", dtype=torch.bfloat16):\n            logits = model(x)\n            loss = F.cross_entropy(logits.view(-1, logits.size(-1)), y.view(-1))\n        (loss / accum).backward()\n    norm = torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)\n    opt.step()\n    if step % 100 == 0:\n        print(step, loss.item(), norm.item())\nKey points: divide by accum, clip before step, log rarely (sync), AdamW with no decay on norms and biases.",
    "pattern": "LR per step, zero, accumulate loss/accum under autocast, clip, step."
  },
  {
    "id": "llm-p1-11",
    "deck": "P1 Foundations",
    "source": "Plan reading: Stanford CS336 Language Modeling from Scratch, assignment 1 (basics)",
    "chapter": "Stanford CS336 assignment 1",
    "prompt": "Write AdamW from scratch as a torch.optim.Optimizer subclass.",
    "answer": "class AdamW(torch.optim.Optimizer):\n    def __init__(self, params, lr=1e-3, betas=(0.9, 0.95), eps=1e-8, weight_decay=0.1):\n        super().__init__(params, dict(lr=lr, betas=betas, eps=eps, weight_decay=weight_decay))\n\n    @torch.no_grad()\n    def step(self):\n        for group in self.param_groups:\n            b1, b2 = group[\"betas\"]\n            for p in group[\"params\"]:\n                if p.grad is None:\n                    continue\n                st = self.state[p]\n                if not st:\n                    st[\"t\"] = 0\n                    st[\"m\"] = torch.zeros_like(p)\n                    st[\"v\"] = torch.zeros_like(p)\n                st[\"t\"] += 1\n                t, m, v, g = st[\"t\"], st[\"m\"], st[\"v\"], p.grad\n                m.mul_(b1).add_(g, alpha=1 - b1)\n                v.mul_(b2).addcmul_(g, g, value=1 - b2)\n                step = group[\"lr\"] * math.sqrt(1 - b2 ** t) / (1 - b1 ** t)\n                p.mul_(1 - group[\"lr\"] * group[\"weight_decay\"])   # decoupled decay\n                p.addcdiv_(m, v.sqrt().add_(group[\"eps\"]), value=-step)\n\nDetails that matter: decay is applied to the weights directly, not added to the gradient (that is the W in AdamW); bias correction is folded into the step size; state is created lazily per parameter.",
    "pattern": "m, v EMAs; bias-corrected step; decoupled decay p *= 1 - lr wd; update -step m / (sqrt v + eps)."
  },
  {
    "id": "llm-p1-12",
    "deck": "P1 Foundations",
    "source": "Plan reading: Stanford CS336 Language Modeling from Scratch, assignment 1 (basics)",
    "chapter": "Stanford CS336 assignment 1",
    "prompt": "How do you load a multi-gigabyte token dataset for training without reading it into RAM?",
    "answer": "Tokenize once offline and write a flat array of token ids (uint16 is enough for vocabularies under 65536).\nAt train time map it with np.memmap and sample random windows:\n\ndata = np.memmap(\"train.bin\", dtype=np.uint16, mode=\"r\")\ndef get_batch(B, T, device):\n    ix = torch.randint(len(data) - T - 1, (B,))\n    x = torch.stack([torch.from_numpy(data[i:i + T].astype(np.int64)) for i in ix])\n    y = torch.stack([torch.from_numpy(data[i + 1:i + 1 + T].astype(np.int64)) for i in ix])\n    return x.pin_memory().to(device, non_blocking=True), y.pin_memory().to(device, non_blocking=True)\n\nThe OS pages in only what you touch. y is x shifted by one. Random offsets give an approximately i.i.d. stream; for exact epochs, use a shuffled order of shard offsets instead. Convert to int64 before embedding lookup.",
    "pattern": "Pre-tokenize to a uint16 .bin, np.memmap it, sample random windows; y = x shifted by one."
  },
  {
    "id": "llm-p1-build-07",
    "deck": "P1 Foundations",
    "source": "Plan reading: Stanford CS336 Language Modeling from Scratch, assignment 1 (basics)",
    "chapter": "Stanford CS336 assignment 1",
    "prompt": "Build this: CS336 A1 passing all tests, in a public repo",
    "answer": "Spec: Your own implementation of assignment 1: every adapter test passing, a model trained on TinyStories (and OpenWebText if compute allows), and the experiment write-up the handout asks for.\n\nSteps:\n1. Do the tokenizer first; profile training on TinyStories and make it fast enough.\n2. Implement each component and run its tests one at a time; do not move on with a failing test.\n3. Train on TinyStories; run an LR sweep and find the divergence point; try at least one architecture ablation (no RMSNorm, post-norm, or no RoPE) and one batch size sweep.\n4. Write up the plots and generated samples; push the repo with a README that reproduces your best run in one command.\n\nSuccess looks like: All tests green, your best run hits the handout's target loss, every ablation has a plot and a one-line conclusion, and someone else can rerun it from the README.",
    "pattern": "Build this: CS336 A1 passing all tests, in a public repo"
  }
];
