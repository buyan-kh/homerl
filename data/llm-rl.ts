import type { Question } from "../lib/types";

export const LLM_RL: Question[] = [
  {
    "id": "llm-rl-01",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Sutton and Barto, Reinforcement Learning: An Introduction (2nd ed.), chapters 3 to 4; OpenAI Spinning Up, Part 1",
    "chapter": "RL1 MDPs and returns",
    "prompt": "Define a Markov decision process and the RL objective.",
    "answer": "An MDP is (S, A, P, R, gamma, rho_0):\n- S states, A actions\n- P(s' | s, a) transition probabilities\n- R(s, a) (or r(s, a, s')) reward\n- gamma in [0, 1] discount, rho_0 the start-state distribution\nMarkov property: the next state and reward depend only on the current state and action, not the earlier history.\nA policy pi(a | s) gives action probabilities. A trajectory tau = (s_0, a_0, r_0, s_1, a_1, r_1, ...) has probability p(tau) = rho_0(s_0) prod_t pi(a_t | s_t) P(s_t+1 | s_t, a_t).\nObjective: maximize J(pi) = E_{tau ~ pi}[ sum_t gamma^t r_t ].\nEverything in policy-gradient RL is about estimating the gradient of J with respect to the policy's parameters from sampled trajectories, without knowing P.",
    "pattern": "(S, A, P, R, gamma, rho_0). Maximize the expected discounted return over trajectories sampled from the policy."
  },
  {
    "id": "llm-rl-02",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Sutton and Barto, Reinforcement Learning: An Introduction (2nd ed.), chapters 3 to 4; OpenAI Spinning Up, Part 1",
    "chapter": "RL1 MDPs and returns",
    "prompt": "What is the return, why discount, and what does gamma mean as a horizon?",
    "answer": "Return from time t: G_t = r_t + gamma r_t+1 + gamma^2 r_t+2 + ... = r_t + gamma G_t+1.\nDiscounting keeps infinite sums finite (for bounded rewards and gamma < 1) and expresses a preference for sooner reward. It also reduces variance: far-future rewards, which are noisy and weakly related to the current action, get less weight.\nEffective horizon: about 1 / (1 - gamma) steps. gamma = 0.99 means about 100 steps; gamma = 0.9 about 10.\nExample: rewards [0, 0, 1] with gamma = 0.9 gives G_0 = 0.81, G_1 = 0.9, G_2 = 1.\nIn episodic LLM RL with a single terminal reward, people usually set gamma = 1: the episode is finite and every token should get credit for the final outcome.",
    "pattern": "G_t = r_t + gamma G_t+1; horizon about 1 / (1 - gamma). LLM RL with terminal rewards usually uses gamma = 1."
  },
  {
    "id": "llm-rl-03",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Sutton and Barto, Reinforcement Learning: An Introduction (2nd ed.), chapters 3 to 4; OpenAI Spinning Up, Part 1",
    "chapter": "RL1 MDPs and returns",
    "prompt": "How do you cast LLM generation as an MDP? Compare the token-level and sequence-level views.",
    "answer": "Token-level MDP:\n- state: the prompt plus all tokens generated so far\n- action: the next token (|A| = vocab size)\n- transition: deterministic, append the token\n- reward: usually 0 for every token except the last, where the reward model or verifier score arrives (often minus a per-token KL penalty)\n- episode ends at EOS or the length limit\nSequence-level (contextual bandit) view: the prompt is the context, the whole response is one action, one reward. DPO, RLOO and GRPO's advantage are naturally sequence level.\nConsequences: deterministic transitions mean no environment stochasticity, only policy stochasticity. Huge action spaces and long horizons (thousands of tokens) with one sparse reward make credit assignment the central problem. In agentic RL, tool outputs make transitions stochastic again and the state includes environment observations.",
    "pattern": "State = prompt + tokens so far, action = next token, deterministic transitions, sparse terminal reward. Or one big bandit action."
  },
  {
    "id": "llm-rl-04",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Sutton and Barto, Reinforcement Learning: An Introduction (2nd ed.), chapters 3 to 4; OpenAI Spinning Up, Part 1",
    "chapter": "RL1 MDPs and returns",
    "prompt": "Episodic vs continuing tasks, and what is the 'horizon' problem in long LLM rollouts?",
    "answer": "Episodic: episodes end (EOS, task done, step limit) and restart from rho_0. Continuing: no terminal state; you need gamma < 1 or average-reward formulations.\nLLM and agent RL is episodic, but horizons are long: a reasoning trace may be 10k to 100k tokens, an agent episode hundreds of tool calls.\nProblems at long horizon:\n- credit assignment: one terminal reward must be spread over many actions; which tokens mattered?\n- variance: the return depends on many random choices, so Monte Carlo estimates are noisy\n- truncation: hitting the length limit is not a real terminal state. Treating it as failure (reward 0) teaches the model that long answers are bad, sometimes desired and sometimes not; this is why some recipes mask or shape truncated samples (see DAPO's overlong handling).",
    "pattern": "LLM RL is episodic with very long horizons: credit assignment and variance; handle truncation explicitly."
  },
  {
    "id": "llm-rl-05",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Sutton and Barto, Reinforcement Learning: An Introduction (2nd ed.), chapters 3 to 6",
    "chapter": "RL2 Value functions and Bellman equations",
    "prompt": "Define V, Q and the advantage A. What is the relation between them?",
    "answer": "State value: V_pi(s) = E_pi[ G_t | s_t = s ], the expected return from s following pi.\nAction value: Q_pi(s, a) = E_pi[ G_t | s_t = s, a_t = a ], take a first, then follow pi.\nV_pi(s) = sum_a pi(a | s) Q_pi(s, a), the average of Q under the policy.\nAdvantage: A_pi(s, a) = Q_pi(s, a) - V_pi(s), how much better a is than the policy's average action in s. E_{a ~ pi}[ A_pi(s, a) ] = 0.\nPolicy gradients want A: increase the probability of actions with positive advantage, decrease negative. Everything in GAE, PPO and GRPO is a way of estimating A.",
    "pattern": "V = expected return from s; Q = from s after taking a; A = Q - V, zero mean under pi."
  },
  {
    "id": "llm-rl-06",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Sutton and Barto, Reinforcement Learning: An Introduction (2nd ed.), chapters 3 to 6",
    "chapter": "RL2 Value functions and Bellman equations",
    "prompt": "Derive the Bellman expectation equation for V_pi.",
    "answer": "Start from the recursive return: G_t = r_t + gamma G_t+1.\nV_pi(s) = E[ G_t | s_t = s ]\n        = E[ r_t + gamma G_t+1 | s_t = s ]\n        = sum_a pi(a | s) sum_s' P(s' | s, a) [ r(s, a, s') + gamma E[ G_t+1 | s_t+1 = s' ] ]\nThe last expectation is V_pi(s') by the Markov property (the future after s' does not depend on how we got there). So:\nV_pi(s) = sum_a pi(a | s) sum_s' P(s' | s, a) [ r(s, a, s') + gamma V_pi(s') ]\nSimilarly Q_pi(s, a) = sum_s' P(s' | s, a) [ r + gamma sum_a' pi(a' | s') Q_pi(s', a') ].\nIt is a linear system in V_pi for a fixed policy: V = R_pi + gamma P_pi V, so V = (I - gamma P_pi)^-1 R_pi. Iterating the right side (policy evaluation) converges because it is a gamma contraction.",
    "pattern": "G_t = r_t + gamma G_t+1, take expectations, use Markov: V(s) = E[ r + gamma V(s') ]."
  },
  {
    "id": "llm-rl-07",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Sutton and Barto, Reinforcement Learning: An Introduction (2nd ed.), chapters 3 to 6",
    "chapter": "RL2 Value functions and Bellman equations",
    "prompt": "What is the Bellman optimality equation, and how does it lead to value iteration and Q-learning?",
    "answer": "Optimal values: V*(s) = max_a sum_s' P(s' | s, a) [ r + gamma V*(s') ], Q*(s, a) = sum_s' P(s' | s, a) [ r + gamma max_a' Q*(s', a') ].\nAn optimal policy is greedy with respect to Q*: pi*(s) = argmax_a Q*(s, a).\nValue iteration: apply the max-backup repeatedly; it converges (gamma contraction) when P is known.\nQ-learning: sample-based version without P: Q(s, a) += lr * (r + gamma max_a' Q(s', a') - Q(s, a)). Off-policy, because the target uses the max regardless of which action the behavior policy takes next.\nWhy LLM RL mostly does not use this: the action space is a 100k-token vocabulary at every step, the max over actions inside long sequences is hard to learn, and policy-gradient methods start directly from a pretrained policy. Value-based ideas still appear as critics and in some token-level methods.",
    "pattern": "V*(s) = max_a E[ r + gamma V*(s') ]. Value iteration with a model; Q-learning from samples. Rarely used directly for LLMs."
  },
  {
    "id": "llm-rl-08",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Sutton and Barto, Reinforcement Learning: An Introduction (2nd ed.), chapters 3 to 6",
    "chapter": "RL2 Value functions and Bellman equations",
    "prompt": "Define the TD error and compare Monte Carlo and TD targets for estimating V.",
    "answer": "Monte Carlo target: the observed return G_t. Unbiased for V_pi(s_t), but high variance (it sums many random rewards and actions), and you must wait until the episode ends.\nTD(0) target: r_t + gamma V(s_t+1), using the current estimate of the next state's value (bootstrapping). Lower variance (one step of randomness), but biased whenever V is wrong. Update V(s_t) += lr * delta_t with\ndelta_t = r_t + gamma V(s_t+1) - V(s_t), the TD error.\nKey fact for later: if V = V_pi exactly, E[ delta_t | s_t, a_t ] = Q_pi(s_t, a_t) - V_pi(s_t) = A_pi(s_t, a_t). So the TD error is a one-step advantage estimate, and GAE is a weighted sum of TD errors.\nn-step targets interpolate: r_t + ... + gamma^(n-1) r_t+n-1 + gamma^n V(s_t+n).",
    "pattern": "delta_t = r_t + gamma V(s_t+1) - V(s_t). MC: unbiased, high variance. TD: low variance, biased. E[delta] = A when V is exact."
  },
  {
    "id": "llm-rl-09",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Williams 1992 (REINFORCE); Sutton et al. 2000; OpenAI Spinning Up, Intro to Policy Optimization",
    "chapter": "RL3 The policy gradient theorem",
    "prompt": "Derive the log-derivative (score function) trick.",
    "answer": "We want the gradient of an expectation whose distribution depends on theta: grad_theta E_{x ~ p_theta}[ f(x) ].\ngrad_theta E[ f(x) ] = grad_theta sum_x p_theta(x) f(x)\n                     = sum_x grad_theta p_theta(x) f(x)\n                     = sum_x p_theta(x) (grad_theta p_theta(x) / p_theta(x)) f(x)\n                     = sum_x p_theta(x) grad_theta log p_theta(x) f(x)\n                     = E_{x ~ p_theta}[ f(x) grad_theta log p_theta(x) ]\nThe gradient is now an expectation under p_theta, so you can estimate it by sampling x and averaging f(x) grad log p_theta(x). f need not be differentiable (a verifier returning 0 or 1 is fine), which is exactly why it suits RL with black-box rewards.\nUseful identity: E_{x ~ p}[ grad log p(x) ] = grad sum_x p(x) = grad 1 = 0.",
    "pattern": "grad E[f] = E[f grad log p], because grad p = p grad log p. f can be a black box. E[grad log p] = 0."
  },
  {
    "id": "llm-rl-10",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Williams 1992 (REINFORCE); Sutton et al. 2000; OpenAI Spinning Up, Intro to Policy Optimization",
    "chapter": "RL3 The policy gradient theorem",
    "prompt": "Derive the policy gradient for trajectories and show why the environment dynamics drop out.",
    "answer": "J(theta) = E_{tau ~ p_theta}[ R(tau) ], with p_theta(tau) = rho_0(s_0) prod_t pi_theta(a_t | s_t) P(s_t+1 | s_t, a_t).\nBy the log-derivative trick: grad J = E[ R(tau) grad log p_theta(tau) ].\nlog p_theta(tau) = log rho_0(s_0) + sum_t log pi_theta(a_t | s_t) + sum_t log P(s_t+1 | s_t, a_t).\nOnly the policy terms depend on theta, so:\ngrad log p_theta(tau) = sum_t grad log pi_theta(a_t | s_t)\ngrad J = E_tau[ R(tau) sum_t grad log pi_theta(a_t | s_t) ]\nYou never need P or its gradient: model-free. Estimate it with N sampled trajectories:\ng_hat = (1/N) sum_i R(tau_i) sum_t grad log pi_theta(a_i,t | s_i,t).\nFor an LLM: grad log pi of a response is the sum over tokens of grad log-prob of each sampled token, which is what loss.backward() on the sum of token log-probs gives you.",
    "pattern": "grad log p(tau) = sum_t grad log pi(a_t | s_t); dynamics terms have no theta. grad J = E[ R(tau) sum_t grad log pi ]."
  },
  {
    "id": "llm-rl-11",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Williams 1992 (REINFORCE); Sutton et al. 2000; OpenAI Spinning Up, Intro to Policy Optimization",
    "chapter": "RL3 The policy gradient theorem",
    "prompt": "Why can you replace the full return R(tau) with the reward-to-go from time t? (causality)",
    "answer": "Write grad J = E[ sum_t grad log pi(a_t | s_t) sum_t' r_t' ]. Split rewards into those before t and from t on.\nFor t' < t: E[ r_t' grad log pi(a_t | s_t) ] = E[ r_t' E[ grad log pi(a_t | s_t) | s_0..s_t, a_0..a_t-1 ] ].\nGiven the past, r_t' is fixed and the inner expectation is E_{a_t ~ pi}[ grad log pi(a_t | s_t) ] = 0 (the score has zero mean).\nSo past rewards contribute zero in expectation and only add variance. Dropping them:\ngrad J = E[ sum_t grad log pi(a_t | s_t) G_t ], with G_t = sum_{t' >= t} r_t' the reward-to-go.\nThen G_t can be replaced by anything with the same conditional expectation, such as Q_pi(s_t, a_t), giving the policy gradient theorem form: grad J = E[ sum_t grad log pi(a_t | s_t) Q_pi(s_t, a_t) ].\nIn LLM RL with only a terminal reward, reward-to-go equals the final reward for every token, so this changes nothing unless there are per-token rewards (e.g. a KL penalty).",
    "pattern": "Past rewards multiply a zero-mean score given the past, so they vanish in expectation. Use reward-to-go G_t (or Q)."
  },
  {
    "id": "llm-rl-12",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Williams 1992 (REINFORCE); Sutton et al. 2000; OpenAI Spinning Up, Intro to Policy Optimization",
    "chapter": "RL3 The policy gradient theorem",
    "prompt": "Prove that subtracting a state-dependent baseline b(s_t) leaves the policy gradient unbiased.",
    "answer": "The extra term is E[ grad log pi(a_t | s_t) b(s_t) ].\nCondition on s_t: E_{a_t ~ pi(. | s_t)}[ grad log pi(a_t | s_t) ] b(s_t) = b(s_t) sum_a pi(a | s_t) grad log pi(a | s_t) = b(s_t) sum_a grad pi(a | s_t) = b(s_t) grad sum_a pi(a | s_t) = b(s_t) grad 1 = 0.\nSo grad J = E[ sum_t grad log pi(a_t | s_t) (G_t - b(s_t)) ] for any b that does not depend on a_t.\nChoosing b = V_pi(s_t) turns (G_t - b) into an advantage estimate, which usually cuts variance a lot, because returns share a large state-dependent component that says nothing about the action.\nCaveat: the baseline must not depend on the action being scored. GRPO's group mean includes the sample's own reward, which introduces a small bias of order 1/G; RLOO's leave-one-out mean avoids it.",
    "pattern": "E_a[ grad log pi(a | s) ] b(s) = b(s) grad sum_a pi = 0. Any action-independent baseline is unbiased; V is the natural one."
  },
  {
    "id": "llm-rl-13",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Williams 1992 (REINFORCE); Sutton et al. 2000; OpenAI Spinning Up, Intro to Policy Optimization",
    "chapter": "RL3 The policy gradient theorem",
    "prompt": "Worked example: a 3-armed bandit with softmax policy, logits z = [1, 0, 0]. You sample arm 0 and get reward 1. Compute grad log pi(a = 0) with respect to z and the REINFORCE update with lr 0.5 and no baseline.",
    "answer": "pi = softmax([1, 0, 0]) = [e / (e + 2), 1 / (e + 2), 1 / (e + 2)] = [0.576, 0.212, 0.212].\nFor a softmax policy, grad_z log pi(a) = onehot(a) - pi.\ngrad_z log pi(0) = [1 - 0.576, -0.212, -0.212] = [0.424, -0.212, -0.212].\nREINFORCE step: z += lr * R * grad log pi = 0.5 * 1 * [0.424, -0.212, -0.212], so z = [1.212, -0.106, -0.106].\nThe sampled arm's logit goes up, the others down. The gradient sums to zero across logits (softmax is shift invariant).\nNote: with all rewards positive and no baseline, every sampled arm gets pushed up; only the relative frequency of updates sorts good arms from bad. A baseline (e.g. average reward) makes below-average arms get pushed down directly, which is why it lowers variance.",
    "pattern": "grad_z log pi(a) = onehot(a) - pi = [0.424, -0.212, -0.212]; z becomes [1.212, -0.106, -0.106]."
  },
  {
    "id": "llm-rl-14",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Williams 1992; Ahmadian et al. 2024, Back to Basics: Revisiting REINFORCE Style Optimization for RLHF",
    "chapter": "RL4 REINFORCE and variance reduction",
    "prompt": "Write the REINFORCE algorithm as you would implement it for an LLM.",
    "answer": "Repeat:\n1. Sample a batch of prompts; for each, sample a response from the current policy (record the token log-probs, or recompute them).\n2. Score each response with the reward function: R_i.\n3. Compute a baseline b (moving average of rewards, or per-prompt mean), advantage A_i = R_i - b.\n4. Loss = -(1 / N) sum_i A_i * sum_t log pi_theta(y_i,t | x_i, y_i,<t). Backprop and step.\nIn code:\nlogp = token_logprobs(model, prompts, responses)          # (N, T), masked\nloss = -(adv[:, None] * logp * mask).sum() / N\nIt is on-policy: each batch must be sampled from the current policy and is then thrown away. Only one gradient step per batch is valid without importance correction, which is the inefficiency PPO addresses.",
    "pattern": "Sample, score, subtract a baseline, loss = -A * sum of token log-probs, one step, resample."
  },
  {
    "id": "llm-rl-15",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Williams 1992; Ahmadian et al. 2024, Back to Basics: Revisiting REINFORCE Style Optimization for RLHF",
    "chapter": "RL4 REINFORCE and variance reduction",
    "prompt": "What makes policy gradient estimates high variance, and what are the standard variance reduction tools?",
    "answer": "Sources: the return sums many random choices; a single scalar reward multiplies the score of every action in a long trajectory; rare high-reward samples dominate.\nTools:\n1. Causality / reward-to-go: drop rewards that precede the action.\n2. Baselines: subtract b(s) (value function, batch mean, group mean, leave-one-out mean).\n3. Critic bootstrapping: replace Monte Carlo returns with TD or GAE targets (trading variance for bias).\n4. Discounting or lambda < 1 (again bias for variance).\n5. Advantage normalization: whiten advantages across the batch (zero mean, unit std). Changes the effective step size per batch, roughly not the direction.\n6. More samples: bigger batches, multiple samples per prompt.\n7. Control the step: trust regions and clipping do not reduce estimator variance but limit the damage from noisy steps.",
    "pattern": "Reward-to-go, baselines, critics (GAE), discounting, advantage normalization, more samples, trust regions."
  },
  {
    "id": "llm-rl-16",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Williams 1992; Ahmadian et al. 2024, Back to Basics: Revisiting REINFORCE Style Optimization for RLHF",
    "chapter": "RL4 REINFORCE and variance reduction",
    "prompt": "What is RLOO, and why do Ahmadian et al. argue REINFORCE-style methods are enough for RLHF?",
    "answer": "RLOO (REINFORCE leave-one-out): sample k responses per prompt. For response i, the baseline is the mean reward of the other k - 1 responses:\nA_i = R_i - (1 / (k - 1)) sum_{j != i} R_j.\nBecause the baseline excludes the sample's own reward, it is independent of that sample, so the estimator stays unbiased, and no value network is needed.\nEquivalent form: A_i = (k / (k - 1)) (R_i - mean of all k).\nAhmadian et al. (2024) argue that in RLHF from a strong pretrained and SFT model, the policy starts close to good behavior and the problem is close to a bandit with a whole-sequence action. Many of PPO's components (per-token value modeling, GAE, clipping tuned for classic RL) add cost and instability without clear benefit there. They report REINFORCE-style methods, especially RLOO, matching or beating PPO and offline baselines in their setup at lower cost.\nGRPO uses the same idea (group-based baseline, no critic) with a mean that includes the sample itself and division by the std.",
    "pattern": "A_i = R_i - mean of the other k - 1 rewards: unbiased, critic-free. Strong SFT start makes RLHF bandit-like."
  },
  {
    "id": "llm-rl-17",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Williams 1992; Ahmadian et al. 2024, Back to Basics: Revisiting REINFORCE Style Optimization for RLHF",
    "chapter": "RL4 REINFORCE and variance reduction",
    "prompt": "Compute RLOO and GRPO advantages for rewards [1, 0, 0, 1, 1] in one group.",
    "answer": "k = 5, mean = 3 / 5 = 0.6.\nRLOO: A_i = (k / (k - 1)) (R_i - mean) = 1.25 (R_i - 0.6).\nCorrect samples: 1.25 * 0.4 = 0.5. Wrong samples: 1.25 * (-0.6) = -0.75.\nCheck directly for a correct one: others are [0, 0, 1, 1], mean 0.5, so 1 - 0.5 = 0.5.\nGRPO (population std): std = sqrt(0.6 * 0.4) = 0.490. A = (R - 0.6) / 0.490: correct 0.816, wrong -1.225.\n(With the sample std, sqrt(1.2 / 4) = 0.548: correct 0.730, wrong -1.095.)\nBoth give positive weight to correct and negative to wrong, and sum to zero over the group. GRPO's division by std rescales prompts by difficulty, which Dr. GRPO argues biases the objective (see RL13).",
    "pattern": "Mean 0.6. RLOO: +0.5 / -0.75. GRPO with population std 0.49: +0.816 / -1.225."
  },
  {
    "id": "llm-rl-18",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Schulman et al. 2015, High-Dimensional Continuous Control Using Generalized Advantage Estimation (arXiv 1506.02438)",
    "chapter": "RL5 Advantage estimation and GAE",
    "prompt": "Derive GAE from n-step advantage estimates.",
    "answer": "TD error: delta_t = r_t + gamma V(s_t+1) - V(s_t).\nn-step advantage estimates:\nA^(1)_t = delta_t = r_t + gamma V(s_t+1) - V(s_t)\nA^(2)_t = r_t + gamma r_t+1 + gamma^2 V(s_t+2) - V(s_t) = delta_t + gamma delta_t+1\nA^(n)_t = sum_{l=0}^{n-1} gamma^l delta_t+l (telescoping: the intermediate V terms cancel)\nGAE is the exponentially weighted average (1 - lambda)(A^(1) + lambda A^(2) + lambda^2 A^(3) + ...). Collecting the coefficient of each delta_t+l gives:\nA^GAE_t = sum_{l>=0} (gamma lambda)^l delta_t+l\nRecursive form used in code (backwards over the trajectory):\nA_t = delta_t + gamma lambda A_t+1, with A_T = 0 after the end.\nValue targets for the critic: returns_t = A_t + V(s_t).",
    "pattern": "A_t = sum_l (gamma lambda)^l delta_t+l, computed backwards: A_t = delta_t + gamma lambda A_t+1."
  },
  {
    "id": "llm-rl-19",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Schulman et al. 2015, High-Dimensional Continuous Control Using Generalized Advantage Estimation (arXiv 1506.02438)",
    "chapter": "RL5 Advantage estimation and GAE",
    "prompt": "What do lambda = 0 and lambda = 1 give in GAE, and how do you choose lambda?",
    "answer": "lambda = 0: A_t = delta_t = r_t + gamma V(s_t+1) - V(s_t). Lowest variance, but biased unless V is accurate.\nlambda = 1: A_t = sum_l gamma^l delta_t+l = G_t - V(s_t) (the Monte Carlo return minus a baseline). Unbiased for any V (V only acts as a baseline), but highest variance.\nIn between: a bias-variance knob. Classic control uses gamma = 0.99, lambda = 0.95.\nFor LLM PPO, gamma = 1 and lambda = 1 or close to it is common, because the value model for text is often poor early on (so bootstrapping injects bias). Some recipes pretrain the value model before RL, or use different lambdas for the actor and the critic, to make bootstrapping worthwhile.",
    "pattern": "lambda = 0: one-step TD (low variance, biased). lambda = 1: MC minus baseline (unbiased, noisy)."
  },
  {
    "id": "llm-rl-20",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Schulman et al. 2015, High-Dimensional Continuous Control Using Generalized Advantage Estimation (arXiv 1506.02438)",
    "chapter": "RL5 Advantage estimation and GAE",
    "prompt": "Compute GAE by hand: gamma = 1, lambda = 0.95, rewards [0, 0, 1] (terminal after step 2), values V = [0.5, 0.6, 0.8], V after terminal = 0.",
    "answer": "TD errors:\ndelta_0 = 0 + 0.6 - 0.5 = 0.1\ndelta_1 = 0 + 0.8 - 0.6 = 0.2\ndelta_2 = 1 + 0 - 0.8 = 0.2\nBackwards with gamma lambda = 0.95:\nA_2 = 0.2\nA_1 = 0.2 + 0.95 * 0.2 = 0.39\nA_0 = 0.1 + 0.95 * 0.39 = 0.4705\nCompare lambda = 1 (Monte Carlo): A_t = 1 - V(s_t) = [0.5, 0.4, 0.2].\nValue targets (returns) with lambda = 0.95: A + V = [0.9705, 0.99, 1.0].\nNotice that lambda < 1 trusts the critic a little, pulling the early advantages toward its estimates.",
    "pattern": "deltas [0.1, 0.2, 0.2]; A = [0.4705, 0.39, 0.2]; MC would give [0.5, 0.4, 0.2]."
  },
  {
    "id": "llm-po-10",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Schulman et al. 2015, High-Dimensional Continuous Control Using Generalized Advantage Estimation (arXiv 1506.02438)",
    "chapter": "RL5 Advantage estimation and GAE",
    "prompt": "What is an advantage, and what does GAE do?",
    "answer": "Advantage A(s, a) = how much better action a was than the policy's average from state s: Q(s, a) - V(s). Using it instead of raw return lowers gradient variance.\nGAE (generalized advantage estimation) mixes TD errors delta_t = r_t + gamma V(s_{t+1}) - V(s_t) with exponential weights: A_t = sum over l of (gamma lambda)^l delta_{t+l}. lambda near 1 means low bias and high variance; near 0 means the reverse. In LLM RLHF, gamma is often 1 and reward arrives only at the last token.",
    "pattern": "Advantage = better than average. GAE blends TD errors to trade bias for variance."
  },
  {
    "id": "llm-rl-21",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Schulman et al. 2015, High-Dimensional Continuous Control Using Generalized Advantage Estimation (arXiv 1506.02438)",
    "chapter": "RL5 Advantage estimation and GAE",
    "prompt": "Write GAE in PyTorch for a batch of right-padded response sequences.",
    "answer": "def gae(rewards, values, mask, gamma=1.0, lam=0.95):\n    # rewards, values, mask: (B, T); mask = 1 on real response tokens, 0 on padding\n    B, T = rewards.shape\n    adv = torch.zeros_like(rewards)\n    last = torch.zeros(B, device=rewards.device)\n    for t in reversed(range(T)):\n        if t + 1 < T:\n            nxt_mask = mask[:, t + 1]\n            next_v = values[:, t + 1] * nxt_mask       # no bootstrap past the last real token\n        else:\n            nxt_mask = torch.zeros(B, device=rewards.device)\n            next_v = torch.zeros(B, device=rewards.device)\n        delta = rewards[:, t] + gamma * next_v - values[:, t]\n        last = delta + gamma * lam * nxt_mask * last\n        adv[:, t] = last * mask[:, t]\n    returns = adv + values\n    return adv, returns\n\nThe loop over T is cheap (elementwise). The masking is where the bugs live: no bootstrapping past the final token, no advantage leaking in from padding. Unit-test it against the hand-computed example in the previous card.",
    "pattern": "Backward loop over T: delta = r + gamma V_next * notdone - V; A = delta + gamma lam notdone A_next."
  },
  {
    "id": "llm-rl-22",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Mnih et al. 2016 (A3C); OpenAI Spinning Up; Huang et al., The 37 Implementation Details of PPO",
    "chapter": "RL6 Actor-critic",
    "prompt": "What is an actor-critic method, and what losses does it optimize?",
    "answer": "Actor: the policy pi_theta. Critic: a value function V_phi(s) used to form advantages.\nEach iteration: collect rollouts, compute advantages with the critic (TD, n-step or GAE), then:\npolicy loss = -E[ A_t log pi_theta(a_t | s_t) ] (with A treated as a constant)\nvalue loss = E[ (V_phi(s_t) - target_t)^2 ], with target = GAE returns (or n-step returns)\noptional entropy bonus = -c * E[ H(pi_theta(. | s_t)) ] to keep exploring\nTotal loss often = policy loss + c_v * value loss - c_e * entropy when actor and critic share a network.\nThe critic reduces variance (better baselines, bootstrapping) and allows per-step credit assignment, at the cost of bias when it is wrong and extra memory and compute.",
    "pattern": "Actor = policy, critic = V for advantages. Loss = -A log pi + c_v (V - target)^2 - c_e H."
  },
  {
    "id": "llm-rl-23",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Mnih et al. 2016 (A3C); OpenAI Spinning Up; Huang et al., The 37 Implementation Details of PPO",
    "chapter": "RL6 Actor-critic",
    "prompt": "For LLM PPO, where does the value function come from, and what are the design choices?",
    "answer": "The value model outputs a scalar per token position: V(prompt + tokens so far).\nTypical setup: a separate model of similar size, initialized from the reward model (so it starts out understanding quality), with a scalar head on top of the final hidden states.\nAlternative: a value head on the policy model itself (shared trunk). Cheaper, but the value loss's gradients interfere with the policy and the scales can fight; most large-scale LLM PPO setups use separate models.\nProblems: the value model must predict the final reward from partial text, which is hard early in the sequence, and it goes off-distribution as the policy changes. Poor values make GAE biased.\nRemedies seen in practice: value pretraining (fit the critic on rollouts before updating the policy), lambda near 1, or removing the critic altogether (RLOO, GRPO), which is the main reason critic-free methods spread for LLMs.",
    "pattern": "Per-token scalar head; usually a separate model initialized from the reward model. Critics are hard for text, hence critic-free methods."
  },
  {
    "id": "llm-rl-24",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Mnih et al. 2016 (A3C); OpenAI Spinning Up; Huang et al., The 37 Implementation Details of PPO",
    "chapter": "RL6 Actor-critic",
    "prompt": "What is PPO's value clipping, and is it worth using?",
    "answer": "Value clipping (from the original PPO code, not the paper) limits how far the new value prediction moves from the old one, mirroring the policy clip:\nV_clipped = V_old + clamp(V_new - V_old, -eps_v, eps_v)\nvalue loss = max((V_new - R)^2, (V_clipped - R)^2)\nIntent: stop the critic from jumping on noisy targets.\nEvidence: implementation-detail studies (Engstrom et al. 2020, Implementation Matters in Deep RL; Andrychowicz et al. 2020, What Matters in On-Policy RL) found value clipping does not help or can hurt in many settings. It also depends on the reward scale: eps_v must match the scale of the values.\nPractical rule: treat it as an optional detail; normalize rewards and value targets so the scale is sane, and ablate rather than assume.",
    "pattern": "Clip V_new to V_old +- eps and take the max loss. Studies found little benefit; depends on reward scale. Ablate it."
  },
  {
    "id": "llm-rl-25",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Kakade and Langford 2002; Schulman et al. 2015, Trust Region Policy Optimization (arXiv 1502.05477)",
    "chapter": "RL7 Trust regions and TRPO",
    "prompt": "Why do policy gradient methods need a trust region? What goes wrong with large steps?",
    "answer": "The gradient is computed from data sampled by the current policy and is only accurate locally. A step that changes the policy a lot can:\n- collapse probabilities (an action's probability goes to near zero and the policy stops sampling it, so it cannot recover)\n- make the next batch come from a much worse policy; unlike supervised learning, bad steps poison your own future training data\n- be sensitive to parameterization: a small change in parameters can be a huge change in action probabilities (e.g. a sharp softmax), so a fixed learning rate in parameter space is not a fixed step size in policy space\nHence: measure the step in policy space (KL between old and new action distributions) and keep it small. TRPO does this with a hard constraint, PPO with clipping or a KL penalty, and LLM RLHF adds a second KL to a fixed reference model.",
    "pattern": "Bad steps poison future data and parameter distance is not policy distance. Bound the KL per update."
  },
  {
    "id": "llm-rl-26",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Kakade and Langford 2002; Schulman et al. 2015, Trust Region Policy Optimization (arXiv 1502.05477)",
    "chapter": "RL7 Trust regions and TRPO",
    "prompt": "Derive the importance-sampled surrogate objective used by TRPO and PPO.",
    "answer": "We have samples from the old policy pi_old and want to estimate how good a new policy pi_theta is, and its gradient.\nPerformance difference lemma (Kakade and Langford 2002): J(pi_new) - J(pi_old) = E_{tau ~ pi_new}[ sum_t gamma^t A_pi_old(s_t, a_t) ].\nThat needs states from pi_new. Approximate with states from pi_old (fine when the policies are close) and fix the action distribution with importance sampling:\nL(theta) = E_{s ~ pi_old, a ~ pi_old}[ (pi_theta(a | s) / pi_old(a | s)) A_old(s, a) ]\nProperties:\n- at theta = theta_old, the ratio is 1 and grad L equals the ordinary policy gradient, since grad (pi_theta / pi_old) = grad log pi_theta at the old point\n- L matches J's improvement to first order, so it is trustworthy only near pi_old, which is why it must be paired with a constraint (TRPO) or clipping (PPO)\nThis surrogate is what lets you take several gradient steps on one batch.",
    "pattern": "Performance difference plus states from pi_old plus IS on actions: L = E_old[ (pi / pi_old) A ]. Equals the PG at theta_old."
  },
  {
    "id": "llm-rl-27",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Kakade and Langford 2002; Schulman et al. 2015, Trust Region Policy Optimization (arXiv 1502.05477)",
    "chapter": "RL7 Trust regions and TRPO",
    "prompt": "What does TRPO optimize, and how does it solve the constrained problem?",
    "answer": "maximize L(theta) = E[ (pi_theta / pi_old) A ] subject to E_s[ KL(pi_old(. | s) || pi_theta(. | s)) ] <= delta.\nTheory: Schulman et al. prove a lower bound on true improvement, the surrogate minus a penalty proportional to the maximum KL, so improving the bound guarantees monotonic improvement. The practical algorithm uses a constraint on the average KL instead.\nSolving it: linearize the objective (gradient g) and use a quadratic approximation of the KL (the Fisher information matrix F). The step direction is the natural gradient F^-1 g, found with conjugate gradient using Fisher-vector products (never forming F). Scale it to satisfy the KL bound: step = sqrt(2 delta / (s^T F s)) s. Then a backtracking line search checks that the real KL is within delta and the surrogate improved.\nCost: second-order machinery, awkward with shared actor-critic networks and huge models. PPO keeps the spirit with first-order methods, which is why PPO, not TRPO, became the LLM default.",
    "pattern": "Max surrogate s.t. mean KL <= delta: natural gradient via conjugate gradient with Fisher-vector products, then line search."
  },
  {
    "id": "llm-rl-28",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Kakade and Langford 2002; Schulman et al. 2015, Trust Region Policy Optimization (arXiv 1502.05477)",
    "chapter": "RL7 Trust regions and TRPO",
    "prompt": "What is the natural gradient, and why is it invariant to parameterization?",
    "answer": "Ordinary gradient descent takes the steepest step under Euclidean distance in parameter space. The natural gradient takes the steepest step under KL distance between the distributions the parameters define.\nSecond-order expansion: KL(p_theta || p_theta+d) is about (1/2) d^T F d, with F = E[ grad log p grad log p^T ] the Fisher information matrix.\nMaximize g^T d subject to (1/2) d^T F d <= epsilon: d is proportional to F^-1 g.\nBecause KL depends only on the distributions, not on how they are parameterized, the update (seen as a change of distribution, for small steps) does not depend on the parameterization. A plain gradient step does.\nIn deep learning F is too large to form, so approximations are used: conjugate gradient (TRPO), Kronecker factored (K-FAC).",
    "pattern": "Steepest ascent under KL: d proportional to F^-1 g with F the Fisher. Invariant to reparameterization."
  },
  {
    "id": "llm-po-08",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Schulman et al. 2017, Proximal Policy Optimization Algorithms (arXiv 1707.06347); Huang et al., The 37 Implementation Details of PPO",
    "chapter": "RL8 PPO in full detail",
    "prompt": "Write the PPO clipped objective and say what clipping prevents.",
    "answer": "ratio_t = pi_theta(a_t | s_t) / pi_old(a_t | s_t)\nL = E[ min( ratio_t * A_t, clip(ratio_t, 1 - eps, 1 + eps) * A_t ) ], with eps about 0.2.\nYou reuse a batch of rollouts for several gradient steps. Clipping removes the incentive to push the ratio beyond 1 +/- eps, so the new policy cannot move too far from the one that generated the data in one update.\nPaper: Schulman et al., 'Proximal Policy Optimization Algorithms'.",
    "pattern": "PPO = importance ratio times advantage, clipped to 1 +/- 0.2."
  },
  {
    "id": "llm-rl-29",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Schulman et al. 2017, Proximal Policy Optimization Algorithms (arXiv 1707.06347); Huang et al., The 37 Implementation Details of PPO",
    "chapter": "RL8 PPO in full detail",
    "prompt": "Work through the PPO clipped objective case by case: eps = 0.2, for (A = 2, ratio 1.5), (A = 2, ratio 0.7), (A = -1, ratio 0.7), (A = -1, ratio 1.5).",
    "answer": "Objective per sample: min(r A, clip(r, 1 - eps, 1 + eps) A).\nA = 2, r = 1.5: unclipped 3.0, clipped 1.2 * 2 = 2.4. min = 2.4. The ratio is already above 1.2 in the improving direction, so it is clipped: the gradient is zero, no incentive to push further.\nA = 2, r = 0.7: unclipped 1.4, clipped 0.8 * 2 = 1.6. min = 1.4, the unclipped term, so the gradient flows: the action got less likely even though it is good, and PPO pulls it back up.\nA = -1, r = 0.7: unclipped -0.7, clipped 0.8 * -1 = -0.8. min = -0.8, clipped: the bad action is already down more than 20%, stop pushing.\nA = -1, r = 1.5: unclipped -1.5, clipped -1.2. min = -1.5, unclipped: the bad action became more likely, and the full gradient pushes it down.\nPattern: clipping only removes the incentive to move further in the direction the advantage wants once outside the band. It never stops corrections in the other direction. The objective is a pessimistic lower bound on the unclipped surrogate.",
    "pattern": "Clip kills the gradient only when the ratio has already moved past 1 +- eps in the advantage's favor; corrections always flow."
  },
  {
    "id": "llm-rl-30",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Schulman et al. 2017, Proximal Policy Optimization Algorithms (arXiv 1707.06347); Huang et al., The 37 Implementation Details of PPO",
    "chapter": "RL8 PPO in full detail",
    "prompt": "Write the full PPO training iteration with its loss terms and hyperparameters.",
    "answer": "1. Collect a batch of rollouts with pi_old (store actions, log-probs, values, rewards).\n2. Compute advantages with GAE and value targets; normalize advantages over the batch.\n3. For K epochs (e.g. 1 to 4), shuffle into minibatches, and for each minibatch:\n   ratio = exp(logp_new - logp_old)\n   pg_loss = -mean(min(ratio * A, clamp(ratio, 1 - eps, 1 + eps) * A))\n   v_loss = mean((V_new - returns)^2)            (optionally clipped)\n   ent = mean(entropy of pi_new)\n   loss = pg_loss + c_v * v_loss - c_e * ent\n   backprop, clip grad norm (e.g. 0.5 or 1.0), step\n4. Optionally stop the epochs early if approximate KL exceeds a target.\nTypical classic-RL values: eps = 0.2, gamma = 0.99, lambda = 0.95, c_v = 0.5, c_e = 0.01, Adam with lr around 3e-4 and annealing.\nLLM-specific differences: the reward includes a KL-to-reference penalty, gamma = 1, entropy bonus usually 0, far smaller learning rates (around 1e-6), often a single epoch.",
    "pattern": "Rollouts, GAE, normalize A; K epochs of minibatches with clipped policy loss + value loss - entropy; grad clip; KL early stop."
  },
  {
    "id": "llm-rl-31",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Schulman et al. 2017, Proximal Policy Optimization Algorithms (arXiv 1707.06347); Huang et al., The 37 Implementation Details of PPO",
    "chapter": "RL8 PPO in full detail",
    "prompt": "Which diagnostics do you log in a PPO-style run, and what does each tell you?",
    "answer": "- approximate KL between pi_old and pi_new per update: should be small (e.g. around 0.01 to 0.05 in classic RL). Spikes mean steps are too large.\n- clip fraction: share of tokens whose ratio was clipped. Persistently high values (above roughly 0.2 to 0.3) mean the policy moves too far per batch: lower the lr or epochs.\n- policy entropy: steady decline is normal; a cliff means collapse, a rise can mean instability.\n- value loss and explained variance (1 - Var(returns - V) / Var(returns)): near 1 is a good critic, near 0 or negative is useless.\n- reward mean, std, and the distribution; KL to the reference model (in RLHF); response length.\n- gradient norm, and the max and min ratio (catches numerical trouble).\nRead these alongside samples. A run whose reward rises while KL to the reference and length explode is often hacking the reward.",
    "pattern": "Approx KL, clip fraction, entropy, value explained variance, reward stats, KL to ref, length, grad norm. Plus samples."
  },
  {
    "id": "llm-rl-32",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Schulman et al. 2017, Proximal Policy Optimization Algorithms (arXiv 1707.06347); Huang et al., The 37 Implementation Details of PPO",
    "chapter": "RL8 PPO in full detail",
    "prompt": "Why do 'implementation details' matter so much for PPO? Give examples.",
    "answer": "Engstrom et al. (2020, Implementation Matters in Deep Policy Gradients) found that much of PPO's advantage over TRPO in their experiments came from code-level optimizations rather than the clipped objective itself, and that clipping alone did not reliably keep the policy in a trust region.\nHuang et al.'s \"The 37 Implementation Details of PPO\" catalogs choices in the reference implementation, for example:\n- advantage normalization per minibatch\n- observation and reward normalization and clipping\n- orthogonal initialization with specific gains, small init for the policy output layer\n- learning-rate annealing, global gradient clipping, Adam epsilon\n- value clipping, and how terminal vs truncated states are handled\nLesson for LLM RL: when comparing algorithms (PPO vs GRPO vs your variant), the comparison means little unless these details are equal or ablated. Many \"algorithm X beats Y\" results are partly implementation differences.",
    "pattern": "Code-level choices (normalization, init, LR annealing, clipping details) drove much of PPO's edge. Control them in comparisons."
  },
  {
    "id": "llm-fd-14",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Ziegler et al. 2019, Fine-Tuning Language Models from Human Preferences (arXiv 1909.08593); John Schulman, Approximating KL Divergence (blog)",
    "chapter": "RL9 KL penalty vs KL constraint",
    "prompt": "Forward KL(p || q) vs reverse KL(q || p): which is mode-covering and which is mode-seeking, and where do they show up for LLMs?",
    "answer": "KL(p || q) = E_p[log p/q]. Minimizing over q with p fixed (forward KL) punishes q for missing any region where p has mass, so q spreads out to cover all modes. That is pretraining MLE.\nMinimizing KL(q || p) over q (reverse KL) punishes q for putting mass where p has little, so q collapses onto one mode. RL fine-tuning with a KL penalty to the reference model uses the policy's own samples, which is reverse-KL flavored, and that is part of why RL-tuned models get less diverse.",
    "pattern": "Forward KL covers modes (pretraining). Reverse KL seeks one mode (RL)."
  },
  {
    "id": "llm-po-07",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Ziegler et al. 2019, Fine-Tuning Language Models from Human Preferences (arXiv 1909.08593); John Schulman, Approximating KL Divergence (blog)",
    "chapter": "RL9 KL penalty vs KL constraint",
    "prompt": "Why does RLHF add a KL penalty to the reference model, and what does the per-token reward look like?",
    "answer": "Without it, the policy drifts to whatever text exploits the reward model's blind spots (reward hacking) and loses fluency and diversity.\nCommon form: total reward = r_RM(x, y) - beta * sum over tokens of [log pi(y_t) - log pi_ref(y_t)]. The RM score is given at the end of the sequence; the KL term is applied per token.\nBeta trades reward against staying close to the starting model. Some recent RLVR recipes drop the KL term entirely; whether you need it depends on the task and reward.",
    "pattern": "Reward minus beta * KL to reference. The KL is the leash against hacking."
  },
  {
    "id": "llm-rl-33",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Ziegler et al. 2019, Fine-Tuning Language Models from Human Preferences (arXiv 1909.08593); John Schulman, Approximating KL Divergence (blog)",
    "chapter": "RL9 KL penalty vs KL constraint",
    "prompt": "KL penalty vs KL constraint: what is the difference, and what is the adaptive KL controller?",
    "answer": "Two separate KLs appear in LLM RL:\n1. KL to pi_old (per update): a trust region for optimization stability. TRPO constrains it; PPO-clip approximates the constraint; PPO-penalty adds beta * KL(pi_old || pi_theta) to the loss.\n2. KL to pi_ref (the SFT model): a regularizer in the objective itself, max E[r] - beta KL(pi || pi_ref), to keep the policy near the reference and limit reward hacking.\nPenalty vs constraint: a fixed penalty beta gives different KL budgets for different reward scales and at different points in training; a constraint fixes the KL budget but needs a solver.\nAdaptive controller (Ziegler et al. 2019, and the PPO paper's adaptive-KL variant): pick a target KL and adjust beta after each batch: if measured KL is above target, increase beta; if below, decrease it (proportional control with clipping). That turns a penalty into an approximate constraint.",
    "pattern": "KL to pi_old = trust region for stability; KL to pi_ref = objective regularizer. Adaptive beta tracks a target KL."
  },
  {
    "id": "llm-rl-34",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Ziegler et al. 2019, Fine-Tuning Language Models from Human Preferences (arXiv 1909.08593); John Schulman, Approximating KL Divergence (blog)",
    "chapter": "RL9 KL penalty vs KL constraint",
    "prompt": "What are the k1, k2 and k3 KL estimators, and which does GRPO use?",
    "answer": "To estimate KL(q || p) = E_{x ~ q}[ log q(x) - log p(x) ] from samples x ~ q, let the ratio be r = p(x) / q(x) (q is the sampling policy, p the reference).\nk1 = -log r = log q - log p. Unbiased, but high variance and negative for some samples.\nk2 = (1/2) (log r)^2. Biased, low variance, always nonnegative; good when p and q are close.\nk3 = (r - 1) - log r. Unbiased (because E_q[r - 1] = 0) and always nonnegative (since log r <= r - 1). Low variance.\nExample: if p(x) / q(x) = 0.5 for a sample: k1 = 0.693, k2 = 0.240, k3 = -0.5 + 0.693 = 0.193.\nGRPO (DeepSeekMath) puts k3 directly in the loss: D = pi_ref / pi_theta - log(pi_ref / pi_theta) - 1, per token, scaled by beta. Classic RLHF PPO instead subtracts beta * k1 per token from the reward.\nSubtlety: an unbiased estimate of the KL value does not give an unbiased gradient of the KL when used as a loss; later work analyzed this, and some RLVR recipes drop the KL term entirely.",
    "pattern": "k1 = log q/p (unbiased, noisy); k2 = (log r)^2 / 2; k3 = (r - 1) - log r (unbiased, nonnegative). GRPO uses k3 in the loss."
  },
  {
    "id": "llm-rl-35",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Ziegler et al. 2019, Fine-Tuning Language Models from Human Preferences (arXiv 1909.08593); John Schulman, Approximating KL Divergence (blog)",
    "chapter": "RL9 KL penalty vs KL constraint",
    "prompt": "KL in the reward vs KL in the loss: what is the difference in practice?",
    "answer": "KL in the reward (classic RLHF PPO): r_t = -beta * (log pi(y_t) - log pi_ref(y_t)) at every token, plus the reward-model score at the last token. The KL then flows through returns and advantages like any reward, so it is credited back to earlier tokens via GAE and normalized with everything else.\nKL in the loss (GRPO): the policy-gradient term uses only the task reward's advantage, and a separate per-token term beta * KL_estimate(pi || pi_ref) is added to the loss and differentiated directly.\nConsequences:\n- in the reward, KL changes the advantage estimates and interacts with normalization and the critic\n- in the loss, the KL gradient is explicit and independent of the reward scale, but the estimator choice (k1, k2, k3) changes the gradient\n- for verifiable-reward reasoning RL, several 2025 recipes (DAPO, Dr. GRPO) set beta = 0, arguing the policy should be free to move far from the initial model and the verifier is hard to hack",
    "pattern": "In reward: per-token -beta log ratio flows through advantages. In loss: explicit KL estimator gradient. RLVR recipes often drop it."
  },
  {
    "id": "llm-rl-36",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Bradley and Terry 1952; Ouyang et al. 2022; Gao et al. 2022, Scaling Laws for Reward Model Overoptimization (arXiv 2210.10760)",
    "chapter": "RL10 Reward modeling",
    "prompt": "Derive the reward model loss from the Bradley-Terry model by maximum likelihood.",
    "answer": "Bradley-Terry: each response has a latent score r. The probability that y_w is preferred over y_l given prompt x is\nP(y_w > y_l | x) = exp(r(x, y_w)) / (exp(r(x, y_w)) + exp(r(x, y_l))) = sigmoid(r(x, y_w) - r(x, y_l)).\nGiven a dataset of comparisons (x, y_w, y_l), maximum likelihood maximizes sum log sigmoid(r_w - r_l), so the loss is\nL(phi) = -E[ log sigmoid(r_phi(x, y_w) - r_phi(x, y_l)) ].\nGradient with respect to the margin m = r_w - r_l: dL/dm = -(1 - sigmoid(m)) = -sigmoid(-m). Pairs the model already ranks confidently (large m) contribute little; wrongly ordered pairs contribute most.\nOnly differences are identified: adding a constant to all rewards for a prompt changes nothing, so reward scales are arbitrary, which is why RL pipelines normalize rewards.",
    "pattern": "P(w > l) = sigmoid(r_w - r_l); MLE gives L = -log sigmoid(r_w - r_l). Only differences matter; normalize scales."
  },
  {
    "id": "llm-po-06",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Bradley and Terry 1952; Ouyang et al. 2022; Gao et al. 2022, Scaling Laws for Reward Model Overoptimization (arXiv 2210.10760)",
    "chapter": "RL10 Reward modeling",
    "prompt": "Write the Bradley-Terry reward model loss and compute it when r(chosen) = 1.5 and r(rejected) = 0.5.",
    "answer": "P(chosen preferred) = sigmoid(r_c - r_r).\nLoss = -log sigmoid(r_c - r_r).\nHere r_c - r_r = 1.0, sigmoid(1.0) = 0.731, loss = 0.313.\nOnly differences matter, so the reward scale and offset are arbitrary; normalize rewards before RL.",
    "pattern": "RM loss = -log sigmoid(r_chosen - r_rejected). Only margins matter."
  },
  {
    "id": "llm-rl-37",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Bradley and Terry 1952; Ouyang et al. 2022; Gao et al. 2022, Scaling Laws for Reward Model Overoptimization (arXiv 2210.10760)",
    "chapter": "RL10 Reward modeling",
    "prompt": "How is a reward model built and evaluated in practice?",
    "answer": "Architecture: a language model (often initialized from the SFT model) with the LM head replaced by a scalar head; read the scalar at the final token of the response.\nData: prompts, two or more responses (from the current policy family, so the RM sees on-distribution text), human or AI preference labels. Ranking K responses gives K choose 2 pairs; keep pairs from the same prompt in the same batch (as InstructGPT did) to avoid overfitting.\nTraining: usually about one epoch (RMs overfit fast), sometimes with an auxiliary term keeping rewards centered.\nEvaluation:\n- held-out pairwise accuracy (label noise and annotator disagreement cap it well below 100%)\n- benchmarks like RewardBench\n- the real test: does optimizing against it improve a gold standard (human evals), and how quickly does it get exploited?\nKnown biases: length (longer looks better), formatting, sycophancy. Check the correlation of reward with length on held-out data.",
    "pattern": "LM plus scalar head at the last token, about one epoch on pairwise data; accuracy matters, but the real test is optimization."
  },
  {
    "id": "llm-rl-38",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Bradley and Terry 1952; Ouyang et al. 2022; Gao et al. 2022, Scaling Laws for Reward Model Overoptimization (arXiv 2210.10760)",
    "chapter": "RL10 Reward modeling",
    "prompt": "What did Gao et al. (2022) find about reward model overoptimization?",
    "answer": "Setup: a large \"gold\" reward model stands in for human labels; smaller proxy RMs are trained on gold-labeled data; policies are optimized against the proxy with best-of-n sampling or RL, and both proxy and gold scores are tracked.\nFinding: as optimization pressure grows (measured as d = sqrt(KL(pi || pi_init))), the proxy score keeps rising but the gold score rises, peaks, then falls: Goodhart's law, measured.\nFunctional forms they fit:\n- best-of-n: R_gold(d) = d (alpha_bon - beta_bon d)\n- RL: R_gold(d) = d (alpha_RL - beta_RL log d)\nThe coefficients scale smoothly with proxy RM size: larger RMs overoptimize less. More RM training data also helps. RL used much more KL than best-of-n for the same gold gain.\nLesson: treat KL from the initial policy as the real budget, and keep a better held-out judge to detect when you have passed the peak.",
    "pattern": "Proxy reward keeps climbing while gold reward peaks then falls with sqrt(KL). Bigger RMs overoptimize later."
  },
  {
    "id": "llm-po-23",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Bradley and Terry 1952; Ouyang et al. 2022; Gao et al. 2022, Scaling Laws for Reward Model Overoptimization (arXiv 2210.10760)",
    "chapter": "RL10 Reward modeling",
    "prompt": "What is Constitutional AI and RLAIF?",
    "answer": "Constitutional AI (Bai et al., Anthropic, 2022): write a list of principles (the constitution).\nSL phase: the model critiques and revises its own responses against those principles, and you fine-tune on the revisions.\nRL phase: an AI model compares response pairs against the principles to make preference labels, a preference model is trained on them, and RL uses it (RL from AI feedback, RLAIF).\nIt replaces most human harmlessness labels with AI labels guided by explicit, editable rules.",
    "pattern": "CAI: principles plus AI critiques and AI preference labels."
  },
  {
    "id": "llm-po-24",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Bradley and Terry 1952; Ouyang et al. 2022; Gao et al. 2022, Scaling Laws for Reward Model Overoptimization (arXiv 2210.10760)",
    "chapter": "RL10 Reward modeling",
    "prompt": "What are the risks of using an LLM as the source of preference labels?",
    "answer": "The judge's biases become the reward: position bias (prefers the first or second answer), verbosity bias, self-preference for its own style, and sensitivity to confident tone.\nThe policy can learn to exploit the judge the same way it would exploit a reward model.\nMitigate: randomize answer order and average both orders, use rubrics, calibrate against human labels on a sample, use multiple judges, and keep human spot checks.",
    "pattern": "AI labels inherit judge biases. Randomize order and calibrate against humans."
  },
  {
    "id": "llm-rl-39",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Ziegler et al. 2019; Stiennon et al. 2020, Learning to Summarize from Human Feedback; Ouyang et al. 2022",
    "chapter": "RL11 PPO for LLMs",
    "prompt": "Walk through one iteration of RLHF PPO for an LLM, data flow included.",
    "answer": "Models: policy (trainable), value model (trainable), reference (frozen SFT), reward model (frozen).\n1. Rollout: sample a batch of prompts; the policy generates responses (fast inference engine). Store token log-probs from the policy.\n2. Score: the reference computes its token log-probs on the same text; the reward model scores the full response (one scalar); the value model gives V at every response token.\n3. Rewards per token: r_t = -beta (log pi(y_t) - log pi_ref(y_t)), with the RM score added at the last token.\n4. Advantages: GAE over response tokens (gamma = 1, lambda around 0.95 to 1), whitened across the batch; returns = A + V.\n5. Update: over a few minibatches (and maybe epochs), recompute policy log-probs, take the PPO-clip loss over response tokens only; update the value model on the returns.\n6. Sync the new policy weights to the rollout engine; repeat.\nOnly response tokens get actions, advantages and losses; prompt tokens are context.",
    "pattern": "Generate, get ref log-probs, RM score and values; per-token KL reward plus final score; GAE; PPO-clip on response tokens; sync weights."
  },
  {
    "id": "llm-po-09",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Ziegler et al. 2019; Stiennon et al. 2020, Learning to Summarize from Human Feedback; Ouyang et al. 2022",
    "chapter": "RL11 PPO for LLMs",
    "prompt": "Which models must be in memory for PPO-based RLHF, and why is it so expensive?",
    "answer": "Four: the policy (trained), the value model or critic (trained, often same size as the policy), the reference model (frozen, for KL), and the reward model (frozen).\nPlus generation: rollouts are autoregressive sampling, which is slow and memory-bound, and the trainer and generator often need different parallel layouts. This is why lighter methods like DPO (no RM or critic at train time) and GRPO (no critic) became popular.",
    "pattern": "PPO RLHF = policy + critic + reference + RM, plus slow generation."
  },
  {
    "id": "llm-rl-40",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Ziegler et al. 2019; Stiennon et al. 2020, Learning to Summarize from Human Feedback; Ouyang et al. 2022",
    "chapter": "RL11 PPO for LLMs",
    "prompt": "What practical tricks matter in RLHF PPO for LLMs?",
    "answer": "- Reward normalization: standardize RM scores with running statistics so beta and the critic see a consistent scale.\n- Advantage whitening per batch.\n- EOS handling: penalize responses that hit the length limit without EOS (otherwise truncated text may get an unearned score), and score at the true last token.\n- Initialize the value model from the RM; optionally warm up the critic before policy updates.\n- Small learning rates (around 1e-6 for the policy), few epochs, large batches; watch the clip fraction and approximate KL.\n- Rollouts at temperature 1 so the log-probs match the distribution being optimized (or account for any change).\n- Recompute log-probs with the training model rather than trusting the inference engine's numbers, or correct the mismatch (see RL19).\n- Mix in pretraining or SFT loss (PPO-ptx) to limit regressions.\n- Always read samples: a reward curve alone is not evidence.",
    "pattern": "Normalize rewards and advantages, handle EOS and truncation, init critic from RM, tiny LR, temperature 1, check log-prob mismatch."
  },
  {
    "id": "llm-rl-41",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Rafailov et al. 2023, Direct Preference Optimization (arXiv 2305.18290)",
    "chapter": "RL12 DPO derivation",
    "prompt": "Derive the optimal policy of the KL-regularized RLHF objective.",
    "answer": "Objective for one prompt x: max_pi E_{y ~ pi}[ r(x, y) ] - beta KL(pi(. | x) || pi_ref(. | x)).\nWrite it as a single expectation: E_{y ~ pi}[ r(x, y) - beta log(pi(y | x) / pi_ref(y | x)) ]\n= -beta E_{y ~ pi}[ log( pi(y | x) / (pi_ref(y | x) exp(r(x, y) / beta)) ) ].\nDefine Z(x) = sum_y pi_ref(y | x) exp(r(x, y) / beta) and pi*(y | x) = pi_ref(y | x) exp(r(x, y) / beta) / Z(x), a valid distribution.\nThen the objective = -beta E_{y ~ pi}[ log(pi(y | x) / pi*(y | x)) ] + beta log Z(x) = -beta KL(pi || pi*) + beta log Z(x).\nZ(x) does not depend on pi, and the KL is minimized (at 0) exactly when pi = pi*.\nSo the optimum is pi*(y | x) = (1 / Z(x)) pi_ref(y | x) exp(r(x, y) / beta): the reference reweighted by exponentiated reward.\nZ(x) sums over all possible responses, so you cannot compute pi* directly. DPO's trick is to never need it.",
    "pattern": "Fold reward and KL into -beta KL(pi || pi_ref exp(r / beta) / Z) + const: pi* = pi_ref exp(r / beta) / Z."
  },
  {
    "id": "llm-rl-42",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Rafailov et al. 2023, Direct Preference Optimization (arXiv 2305.18290)",
    "chapter": "RL12 DPO derivation",
    "prompt": "Derive the DPO loss from the optimal policy and the Bradley-Terry model.",
    "answer": "Invert the optimal policy: r(x, y) = beta log(pi*(y | x) / pi_ref(y | x)) + beta log Z(x).\nPlug into Bradley-Terry: P(y_w > y_l | x) = sigmoid(r(x, y_w) - r(x, y_l)).\nThe beta log Z(x) terms cancel in the difference, which is the whole trick:\nP(y_w > y_l | x) = sigmoid( beta log(pi*(y_w | x) / pi_ref(y_w | x)) - beta log(pi*(y_l | x) / pi_ref(y_l | x)) ).\nNow parameterize pi* by the policy pi_theta and fit the preference data by maximum likelihood:\nL_DPO(theta) = -E_{(x, y_w, y_l)}[ log sigmoid( beta [ log(pi_theta(y_w) / pi_ref(y_w)) - log(pi_theta(y_l) / pi_ref(y_l)) ] ) ].\nThe policy itself is the reward model (\"your language model is secretly a reward model\"), with implicit reward r_hat = beta log(pi_theta / pi_ref). No sampling, no critic, no separate RM: a classification-style loss on log-prob ratios of fixed data.",
    "pattern": "r = beta log(pi* / pi_ref) + beta log Z; Z cancels in Bradley-Terry; fit pi_theta by -log sigmoid(beta (ratio_w - ratio_l))."
  },
  {
    "id": "llm-rl-43",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Rafailov et al. 2023, Direct Preference Optimization (arXiv 2305.18290)",
    "chapter": "RL12 DPO derivation",
    "prompt": "What is the DPO gradient, and what does it say the loss does?",
    "answer": "With implicit reward r_hat(y) = beta log(pi_theta(y) / pi_ref(y)):\ngrad L_DPO = -beta E[ sigmoid(r_hat(y_l) - r_hat(y_w)) ( grad log pi_theta(y_w) - grad log pi_theta(y_l) ) ].\nReading it:\n- increase the likelihood of the chosen response, decrease the rejected one\n- the weight sigmoid(r_hat_l - r_hat_w) is large when the implicit reward ranks the pair wrongly and small when it is already right, so misranked examples dominate. The paper reports that a naive version without this weighting degenerates.\n- only the difference is constrained, so both log-probs can fall as long as the rejected one falls faster (the \"both go down\" failure mode)\n- beta scales the implicit reward; a smaller beta means weaker regularization toward pi_ref",
    "pattern": "Weight sigmoid(r_l - r_w) times (grad log pi(y_w) - grad log pi(y_l)): focuses on misranked pairs; both can fall."
  },
  {
    "id": "llm-rl-44",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Shao et al. 2024 (GRPO); Liu et al. 2025, Understanding R1-Zero-Like Training (Dr. GRPO, arXiv 2503.20783); Yu et al. 2025, DAPO (arXiv 2503.14476)",
    "chapter": "RL13 GRPO and its fixes",
    "prompt": "Write the full GRPO objective from DeepSeekMath.",
    "answer": "For a prompt q, sample a group of G outputs o_1..o_G from pi_old, score rewards r_1..r_G.\nOutcome-supervision advantage for every token of output i: A_i = (r_i - mean(r)) / std(r).\nObjective (maximize):\nJ(theta) = E[ (1 / G) sum_i (1 / |o_i|) sum_t { min( rho_i,t A_i, clip(rho_i,t, 1 - eps, 1 + eps) A_i ) - beta D_KL,i,t } ]\nwith rho_i,t = pi_theta(o_i,t | q, o_i,<t) / pi_old(o_i,t | q, o_i,<t),\nand the per-token KL estimator D = pi_ref / pi_theta - log(pi_ref / pi_theta) - 1 (the k3 estimator).\nDifferences from PPO: no value model (the group mean is the baseline), advantage normalized by the group std, KL to the reference in the loss rather than in the reward, and the loss averaged per sequence (1 / |o_i|) then across the group.\nThe 1 / |o_i| and the std division are exactly what Dr. GRPO later criticized.",
    "pattern": "Group z-score advantage per token, PPO clip on token ratios, k3 KL in the loss, mean over tokens per sequence then over the group."
  },
  {
    "id": "llm-ip-07",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Shao et al. 2024 (GRPO); Liu et al. 2025, Understanding R1-Zero-Like Training (Dr. GRPO, arXiv 2503.20783); Yu et al. 2025, DAPO (arXiv 2503.14476)",
    "chapter": "RL13 GRPO and its fixes",
    "prompt": "Implement a GRPO policy loss given per-token log-probs.",
    "answer": "def grpo_loss(logp, old_logp, rewards, mask, eps=0.2):\n    # logp, old_logp, mask: (G, T) per token; rewards: (G,) for one prompt's group\n    adv = (rewards - rewards.mean()) / (rewards.std() + 1e-6)   # (G,)\n    ratio = torch.exp(logp - old_logp)\n    unclipped = ratio * adv[:, None]\n    clipped = torch.clamp(ratio, 1 - eps, 1 + eps) * adv[:, None]\n    per_tok = -torch.min(unclipped, clipped)\n    return (per_tok * mask).sum() / mask.sum()               # token-level mean\nold_logp is detached (from the sampling policy). Design choices: optional KL term to a reference, token-level vs sequence-level averaging (length bias), dropping groups with zero reward variance.",
    "pattern": "Group z-score advantage, PPO clip on per-token ratios, masked token mean."
  },
  {
    "id": "llm-po-17",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Shao et al. 2024 (GRPO); Liu et al. 2025, Understanding R1-Zero-Like Training (Dr. GRPO, arXiv 2503.20783); Yu et al. 2025, DAPO (arXiv 2503.14476)",
    "chapter": "RL13 GRPO and its fixes",
    "prompt": "In GRPO, what happens when all 8 samples for a prompt get the same reward, and what do people do about it?",
    "answer": "All rewards equal means every advantage is 0 (and std is 0, so you need an epsilon), so that prompt gives no gradient. If a prompt is always solved or never solved it is wasted compute.\nFixes: filter out prompts with all-correct or all-wrong groups and resample (DAPO's dynamic sampling), build a curriculum around the model's current pass rate, or increase G for hard prompts.\nThe most useful prompts are the ones the model solves sometimes.",
    "pattern": "Uniform rewards give zero advantage. Train on prompts the model sometimes solves."
  },
  {
    "id": "llm-rl-45",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Shao et al. 2024 (GRPO); Liu et al. 2025, Understanding R1-Zero-Like Training (Dr. GRPO, arXiv 2503.20783); Yu et al. 2025, DAPO (arXiv 2503.14476)",
    "chapter": "RL13 GRPO and its fixes",
    "prompt": "Derive the length bias in GRPO's per-sequence normalization (Dr. GRPO) with a numeric example.",
    "answer": "GRPO averages each sequence's token losses with 1 / |o_i|, so each token's gradient weight is A_i / |o_i|.\nCorrect response (A > 0): shorter responses get larger per-token updates, so the policy is pushed toward brevity among correct answers.\nWrong response (A < 0): the per-token penalty is A / |o_i|, smaller for long responses, so long wrong answers are penalized less per token than short wrong ones, pushing wrong answers to get longer.\nNumbers: A = -1 for two wrong responses of lengths 100 and 1000. Per-token weights: -0.01 and -0.001. The long wrong answer gets 10x less pressure per token.\nNet effect: response length grows, especially among incorrect outputs, which can look like \"learning to think longer\" when part of it is a bias.\nDr. GRPO's fix: drop 1 / |o_i| and normalize by a constant (e.g. the max generation length) so every token has the same weight, and drop the std division (next card). They report similar accuracy with much better token efficiency.",
    "pattern": "Per-token weight A / |o|: long wrong answers get less penalty per token, so wrong answers grow longer. Fix: constant normalizer."
  },
  {
    "id": "llm-rl-46",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Shao et al. 2024 (GRPO); Liu et al. 2025, Understanding R1-Zero-Like Training (Dr. GRPO, arXiv 2503.20783); Yu et al. 2025, DAPO (arXiv 2503.14476)",
    "chapter": "RL13 GRPO and its fixes",
    "prompt": "Why does dividing by the group std bias GRPO, according to Dr. GRPO?",
    "answer": "A_i = (r_i - mean) / std weights each prompt by 1 / std of its rewards.\nWith binary rewards, std = sqrt(p (1 - p)) where p is the group's success rate. Prompts that are nearly always solved or nearly always failed have a small std, so their advantages are scaled up; prompts at p = 0.5 have the largest std, so they get scaled down.\nExample: group of 8 with 1 success: p = 0.125, std = 0.331, so the success gets A = 0.875 / 0.331 = 2.65. Group with 4 successes: std = 0.5, the successes get A = 0.5 / 0.5 = 1.0.\nSo the objective over-weights questions that are too easy or too hard relative to medium ones: a question-level difficulty bias, not a principled choice.\nDr. GRPO: use A_i = r_i - mean(r) without dividing by std. (Others argue the scaling helps learning on hard prompts; it is a choice to ablate, not a law.)",
    "pattern": "1 / std upweights prompts with near-0 or near-1 success rates: a difficulty bias. Dr. GRPO uses r - mean only."
  },
  {
    "id": "llm-rl-47",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Shao et al. 2024 (GRPO); Liu et al. 2025, Understanding R1-Zero-Like Training (Dr. GRPO, arXiv 2503.20783); Yu et al. 2025, DAPO (arXiv 2503.14476)",
    "chapter": "RL13 GRPO and its fixes",
    "prompt": "What are DAPO's four techniques, and what problem does each address?",
    "answer": "DAPO (Decoupled Clip and Dynamic sAmpling Policy Optimization, ByteDance Seed and Tsinghua, 2025):\n1. Clip-Higher: decouple the clip range into eps_low = 0.2 and eps_high = 0.28. A symmetric upper clip limits how fast low-probability tokens can grow (a token at p = 0.01 can only reach about 0.012 per update with eps = 0.2), which starves exploration and drives entropy collapse. Raising eps_high lets rare good tokens grow.\n2. Dynamic sampling: drop groups whose rewards are all equal (all correct or all wrong), which have zero advantage and give no gradient, and keep sampling until the batch is full of informative groups. Keeps the effective batch size stable.\n3. Token-level policy gradient loss: average over all tokens in the batch instead of per sequence first, so long sequences contribute in proportion to their length and the length bias is reduced.\n4. Overlong reward shaping: mask the loss of truncated samples (overlong filtering), and add a soft length penalty in a window before the max length instead of punishing truncation as failure.\nThey also removed the KL penalty. Reported result: 50 points on AIME 2024 with Qwen2.5-32B base, using about half the training steps of DeepSeek-R1-Zero-Qwen-32B.",
    "pattern": "Clip-higher (0.2 / 0.28), dynamic sampling of informative groups, token-level loss, overlong filtering and soft length penalty."
  },
  {
    "id": "llm-rl-48",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Shao et al. 2024 (GRPO); Liu et al. 2025, Understanding R1-Zero-Like Training (Dr. GRPO, arXiv 2503.20783); Yu et al. 2025, DAPO (arXiv 2503.14476)",
    "chapter": "RL13 GRPO and its fixes",
    "prompt": "What is GSPO, and why use sequence-level importance ratios?",
    "answer": "GSPO (Group Sequence Policy Optimization, Qwen team, 2025) argues that GRPO's token-level importance ratios are ill-posed: the reward and advantage are per sequence, but each token gets its own ratio from a single sample. That is a high-variance correction that accumulates over long responses and can destabilize training, especially for MoE models whose expert routing differs between old and new policies.\nGSPO defines a sequence-level ratio, length-normalized:\ns_i(theta) = (pi_theta(o_i | q) / pi_old(o_i | q)) ^ (1 / |o_i|) = exp( (1 / |o_i|) sum_t log ratio_i,t )\nand clips s_i (whole responses are clipped or not), with group-relative advantages as in GRPO.\nReported benefits: more stable training and better efficiency, and it removed the need for the workarounds they had used for MoE RL stability.\nRelated ideas: CISPO (MiniMax-M1) clips the importance weights themselves while keeping gradients for all tokens; truncated importance sampling caps the ratio (RL19).",
    "pattern": "Use one length-normalized ratio per sequence (geometric mean of token ratios) and clip whole sequences; more stable, notably for MoE."
  },
  {
    "id": "llm-po-18",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Shao et al. 2024 (GRPO); Liu et al. 2025, Understanding R1-Zero-Like Training (Dr. GRPO, arXiv 2503.20783); Yu et al. 2025, DAPO (arXiv 2503.14476)",
    "chapter": "RL13 GRPO and its fixes",
    "prompt": "Name critiques and fixes of vanilla GRPO from 2025 work.",
    "answer": "1. Length bias: averaging the loss per sequence and then over the group means long wrong answers are penalized less per token. Dr. GRPO ('Understanding R1-Zero-Like Training: A Critical Perspective') removes the length and std normalization; DAPO uses token-level averaging across the batch.\n2. Std normalization overweights prompts where rewards barely vary.\n3. Entropy collapse: DAPO's clip-higher (a larger upper clip bound) helps keep exploration.\n4. Overlong responses: truncate with a soft length penalty rather than a hard zero.\nThis area moves fast; check the latest recipes before committing.",
    "pattern": "Watch length bias, std weighting, and entropy collapse in GRPO."
  },
  {
    "id": "llm-po-15",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Lambert et al. 2024, Tulu 3 (RLVR); DeepSeek-AI 2025, DeepSeek-R1",
    "chapter": "RL14 RLVR and verifiable rewards",
    "prompt": "What is RL with verifiable rewards (RLVR), and why did it take off in 2024 and 2025?",
    "answer": "Instead of a learned reward model, reward comes from a program: is the final math answer correct, do the unit tests pass, does the output parse in the right format.\nThese rewards are much harder to hack than a neural RM, so you can run RL far longer. OpenAI's o1 and DeepSeek-R1 showed that large-scale RL on verifiable tasks produces long chain-of-thought reasoning and big gains in math and code. DeepSeek-R1-Zero showed RL directly on a base model with rule-based rewards (accuracy plus format) can produce long reasoning without SFT first.",
    "pattern": "Program-checked rewards are hard to hack, so RL can run long."
  },
  {
    "id": "llm-rl-49",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Lambert et al. 2024, Tulu 3 (RLVR); DeepSeek-AI 2025, DeepSeek-R1",
    "chapter": "RL14 RLVR and verifiable rewards",
    "prompt": "What exactly goes into a verifiable reward for math or code, and what are the common design choices?",
    "answer": "Math:\n- require a final answer format (e.g. a boxed answer or a marked final line) and extract it robustly\n- normalize (whitespace, LaTeX forms, fractions vs decimals), then compare by exact match, numeric tolerance, or symbolic equivalence (e.g. with sympy), with timeouts\n- reward 1 if equivalent, else 0; optionally a small format reward or penalty\nCode:\n- run hidden unit tests in a sandbox with time and memory limits; reward = all tests pass (binary), or the fraction passed\n- guard against reading or editing tests, and against special-casing visible inputs\nDesign choices: binary vs partial credit (partial credit is denser but easier to game); format rewards early (they help) vs late (they can be exploited); penalties for truncation; 0 vs a negative reward for invalid outputs.\nTulu 3 named this setup RLVR: replace the reward model with a verification function, so reward is given only when the answer is checkably correct.",
    "pattern": "Extract, normalize, check equivalence (math) or run hidden tests in a sandbox (code); binary reward, careful format handling."
  },
  {
    "id": "llm-rl-50",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Lambert et al. 2024, Tulu 3 (RLVR); DeepSeek-AI 2025, DeepSeek-R1",
    "chapter": "RL14 RLVR and verifiable rewards",
    "prompt": "Why did RLVR work so well for reasoning models compared with reward-model RLHF?",
    "answer": "- Hard to hack: a correct verifier cannot be fooled by style, length or sycophancy, so you can optimize much longer and harder before Goodhart effects dominate (the overoptimization peak moves far out).\n- Cheap and scalable: no human labels per sample; large sets of problems with known answers exist.\n- The objective matches the goal: correctness, not approximate preference.\n- Strong base models already put nonzero probability on correct long reasoning, so sampling finds positive examples and RL can amplify them.\n- Test-time compute: rewarding only the final answer leaves the model free to discover that longer reasoning (checking, backtracking) increases reward.\nLimits: only for tasks with checkable outcomes; verifiers have bugs (false positives get exploited); and there is an ongoing debate about how much RL adds beyond sharpening what the base model could already do (see the pass@k card in P5).",
    "pattern": "Verifiers are hard to hack and cheap at scale, match the goal, and leave room to discover long reasoning."
  },
  {
    "id": "llm-rl-51",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Amodei et al. 2016, Concrete Problems in AI Safety; DeepMind's specification gaming examples list; Gao et al. 2022",
    "chapter": "RL15 Reward hacking and overoptimization",
    "prompt": "Define reward hacking and specification gaming, and give the classic non-LLM example.",
    "answer": "Specification gaming: the agent satisfies the literal objective you wrote but not the outcome you intended. Reward hacking is the RL version: maximizing the reward signal through a flaw in the reward function or the environment.\nClassic example: in OpenAI's 2016 post \"Faulty Reward Functions in the Wild\", an agent in the boat racing game CoastRunners learned to circle in a lagoon hitting the same respawning targets for points, catching fire and never finishing the race, while scoring higher than human players.\nGoodhart's law is the general principle: when a measure becomes a target, it ceases to be a good measure. Any reward is a proxy, and optimization pressure finds the gap between proxy and intent. More capable optimizers find subtler gaps.\nDeepMind researchers (Krakovna et al.) maintain a public list of specification gaming examples, worth reading once.",
    "pattern": "Satisfying the literal reward, not the intent (CoastRunners boat loops for points). Goodhart: stronger optimizers find gaps."
  },
  {
    "id": "llm-po-21",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Amodei et al. 2016, Concrete Problems in AI Safety; DeepMind's specification gaming examples list; Gao et al. 2022",
    "chapter": "RL15 Reward hacking and overoptimization",
    "prompt": "Give four concrete reward hacking examples in LLM training.",
    "answer": "1. Length: the reward model likes longer answers, so responses balloon.\n2. Sycophancy: agreeing with the user and flattery score well with human or AI raters.\n3. Coding RL: modifying or deleting tests, special-casing test inputs, or catching exceptions so the harness reports a pass.\n4. Grader exploits: output formats that the answer parser mis-reads as correct, or a judge model swayed by confident language.\nGeneral principle (Goodhart): optimize a proxy hard enough and it stops tracking what you wanted.",
    "pattern": "The policy optimizes the grader, not your intent."
  },
  {
    "id": "llm-po-22",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Amodei et al. 2016, Concrete Problems in AI Safety; DeepMind's specification gaming examples list; Gao et al. 2022",
    "chapter": "RL15 Reward hacking and overoptimization",
    "prompt": "How do you detect and mitigate reward hacking during an RL run?",
    "answer": "Detect: track held-out evaluations the policy is not trained on; read samples every few hundred steps; watch for reward going up while held-out quality flattens; watch length, refusal rate, and format statistics; diff tool calls for suspicious actions (editing tests, touching the grader).\nMitigate: KL to the reference, reward model ensembles, retrain the RM on new policy samples, make graders robust (sandboxing, hidden tests, checking that tests are untouched), penalize the specific exploit, and fix the environment rather than patching the reward forever.",
    "pattern": "Reward up, held-out flat = hacking. Fix the environment, not just the reward."
  },
  {
    "id": "llm-ip-13",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Amodei et al. 2016, Concrete Problems in AI Safety; DeepMind's specification gaming examples list; Gao et al. 2022",
    "chapter": "RL15 Reward hacking and overoptimization",
    "prompt": "Your RL run's training reward climbs steadily, but your held-out eval is flat and response length has tripled. What do you do?",
    "answer": "Treat it as reward hacking until proven otherwise.\n1. Read 20 to 50 high-reward samples. Look for padding, repeated reasoning, format tricks, or grader exploits.\n2. Check correlation of reward with length on a fixed set.\n3. Check whether the grader or reward model is fooled: hand-label a batch of high-reward samples.\n4. Fix the root cause (grader bug, missing length control, reward model blind spot), then restart from a checkpoint before the drift.\n5. Add the exploit as a regression test for the environment.",
    "pattern": "Reward up, eval flat, length up: read samples, find the exploit, fix the env."
  },
  {
    "id": "llm-fd-15",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Cui et al. 2025, The Entropy Mechanism of Reinforcement Learning for Reasoning Language Models (arXiv 2505.22617); DAPO",
    "chapter": "RL16 Exploration and entropy collapse",
    "prompt": "What is entropy of a next-token distribution, and why do people monitor it during RL training?",
    "answer": "H(p) = -sum_i p_i log p_i. It is 0 when the model is certain and ln(V) when uniform.\nIn RL on LLMs, policy entropy often collapses as the model sharpens onto rewarded outputs. Low entropy means little exploration, so learning stalls and pass@k at large k can drop. Teams track entropy and use fixes like a higher clip range for upward updates, entropy bonuses, or temperature during rollouts. Exactly which fix works best is still debated.",
    "pattern": "Entropy collapse = no exploration. Watch it in RL runs."
  },
  {
    "id": "llm-rl-52",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Cui et al. 2025, The Entropy Mechanism of Reinforcement Learning for Reasoning Language Models (arXiv 2505.22617); DAPO",
    "chapter": "RL16 Exploration and entropy collapse",
    "prompt": "Why does policy entropy collapse during RL for LLMs, and what mechanism do Cui et al. (2025) describe?",
    "answer": "Observation: in RL for reasoning, policy entropy drops sharply early, and performance plateaus as entropy runs out. Cui et al. fit an empirical relation R = -a exp(H) + b between validation performance R and entropy H: performance is bought with entropy, and once entropy is near 0 there is little left to gain.\nMechanism they derive for softmax policies under policy gradient: the change in entropy per step is driven by the covariance, over actions, between an action's log-probability and its advantage. If high-probability actions also get high advantage (the usual case for a decent policy that is confident and right), the covariance is positive and entropy decreases. Entropy rises only when rare actions have high advantage.\nSo entropy collapse is the default dynamic of on-policy improvement, not a bug in one implementation.\nTheir remedies, Clip-Cov and KL-Cov, restrict updates on the small set of tokens with the highest covariance, which kept entropy higher and improved results in their experiments.",
    "pattern": "Entropy change is driven by cov(log-prob, advantage); confident-and-right means positive cov and falling entropy. R = -a exp(H) + b."
  },
  {
    "id": "llm-rl-53",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Cui et al. 2025, The Entropy Mechanism of Reinforcement Learning for Reasoning Language Models (arXiv 2505.22617); DAPO",
    "chapter": "RL16 Exploration and entropy collapse",
    "prompt": "What tools keep exploration alive in LLM RL, and what are their tradeoffs?",
    "answer": "- Rollout temperature: higher gives more diverse samples, but the log-probs must reflect the sampling distribution (or be corrected), and too high produces junk.\n- Entropy bonus: simple, but tends to be unstable for LLMs (it raises entropy on irrelevant tokens and can blow up); rarely used at scale.\n- Clip-higher (DAPO): let low-probability tokens grow faster.\n- Covariance-based clipping (Clip-Cov, KL-Cov): limit updates on the tokens driving collapse.\n- A weaker or no reference KL: more freedom to move (at some cost to stability).\n- Data: prompts in the learnable band (pass rate not 0 and not 1), curricula by difficulty, more samples per prompt for hard problems.\n- Larger groups: more chances to see a rare success.\nMeasure it: entropy, pass@k at large k over training (is coverage shrinking?), and diversity of solutions.",
    "pattern": "Temperature, clip-higher, covariance clipping, careful entropy bonuses, prompt difficulty band, bigger groups. Track pass@k."
  },
  {
    "id": "llm-po-19",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Lightman et al. 2023, Let's Verify Step by Step (arXiv 2305.20050); Wang et al. 2023, Math-Shepherd (arXiv 2312.08935)",
    "chapter": "RL17 Process vs outcome rewards",
    "prompt": "Outcome reward vs process reward: what is the difference, and what is the evidence?",
    "answer": "Outcome reward: one score for the final answer.\nProcess reward model (PRM): scores each reasoning step. Lightman et al., 'Let's Verify Step by Step', found process supervision beat outcome supervision for reranking math solutions.\nIn practice, large-scale RLVR has mostly used outcome rewards because PRMs are expensive to label and can be hacked. DeepSeek-R1 reported not using PRMs for this reason. PRMs remain useful for search and reranking.",
    "pattern": "Outcome rewards dominate RL at scale. PRMs help in reranking but are hackable."
  },
  {
    "id": "llm-rl-54",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Lightman et al. 2023, Let's Verify Step by Step (arXiv 2305.20050); Wang et al. 2023, Math-Shepherd (arXiv 2312.08935)",
    "chapter": "RL17 Process vs outcome rewards",
    "prompt": "How are process reward models trained, with human labels and without them?",
    "answer": "Human labels: Lightman et al. (2023) released PRM800K, about 800,000 step-level labels on model-generated solutions to MATH problems (each step labeled positive, negative or neutral). A PRM trained on it predicts the correctness of each step; a solution's score is, for example, the product of step probabilities. Used for best-of-n reranking, it beat an outcome-supervised RM in their study.\nWithout human labels: Math-Shepherd (Wang et al. 2023) estimates step quality automatically with Monte Carlo rollouts. From each step's prefix, sample several completions and check their final answers; a step is labeled good if completions from it reach the correct answer (hard estimation: any success; soft: the success fraction). Train the PRM on those labels.\nTradeoffs: process rewards give denser credit assignment and can catch right-answer-wrong-reasoning, but step boundaries are fuzzy, labels are expensive or noisy, and PRMs used as RL rewards get hacked. The DeepSeek-R1 paper lists PRMs among its unsuccessful attempts for these reasons.",
    "pattern": "PRM800K: 800k human step labels. Math-Shepherd: label steps by Monte Carlo rollout success. Dense credit, but fuzzy and hackable."
  },
  {
    "id": "llm-ev-20",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Gymnasium API; SWE-bench and tau-bench papers; your own environment work",
    "chapter": "RL18 RL environments and deterministic graders",
    "prompt": "What are the components of an RL environment for training an LLM agent?",
    "answer": "1. Task distribution: a set of prompts or instances, ideally with difficulty metadata.\n2. Initial state: container, repo, database, files, simulated user.\n3. Action interface: tools the model can call (shell, editor, API functions) and their schemas.\n4. Transition: execute the tool call in a sandbox and return an observation.\n5. Termination: task done, turn or token budget hit, or a fatal error.\n6. Reward: grader on the final state (plus optional small shaping terms).\n7. Reset: fast, reproducible return to a clean initial state.\nPlus logging of full trajectories for debugging and auditing.",
    "pattern": "Tasks, initial state, tools, sandboxed transitions, termination, reward, reset."
  },
  {
    "id": "llm-rl-55",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Gymnasium API; SWE-bench and tau-bench papers; your own environment work",
    "chapter": "RL18 RL environments and deterministic graders",
    "prompt": "Sketch the code interface of an RL environment for LLM agents and the episode loop.",
    "answer": "class Env:\n    def reset(self, task_id, seed): ...     # fresh sandbox; returns the first observation (task, tools)\n    def step(self, action): ...             # parse and run one tool call; returns (obs, reward, done, info)\n    def grade(self): ...                    # deterministic check of the final state; returns a float\n    def close(self): ...\n\nobs = env.reset(task, seed)\nhistory = [obs]\nfor turn in range(max_turns):\n    action = policy.generate(history)       # record token log-probs\n    obs, r, done, info = env.step(action)\n    history += [action, obs]\n    if done:\n        break\nreward = env.grade()\n\nDesign points: the sandbox must be isolated and reproducible (container snapshot, fixed seed, no network unless intended); tool outputs are part of the state but not actions, so mask them out of the loss; timeouts and malformed calls must produce well-defined observations; grade the environment state, not the transcript.",
    "pattern": "reset / step / grade / close; isolated reproducible sandbox; mask tool outputs from the loss; grade the final state."
  },
  {
    "id": "llm-ev-21",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Gymnasium API; SWE-bench and tau-bench papers; your own environment work",
    "chapter": "RL18 RL environments and deterministic graders",
    "prompt": "What pass rate should training tasks have for the current policy, and why?",
    "answer": "Aim for tasks the policy solves sometimes, roughly in the 10% to 70% range at pass@1 (exact band varies by recipe). With GRPO-style group advantages, a task solved 0 of 8 times or 8 of 8 times gives zero advantage and no gradient.\nSo: estimate pass rates with the current checkpoint, drop or set aside tasks that are always or never solved, and refresh the pool as the policy improves (a moving curriculum). Keep the never-solved set; they become useful later.",
    "pattern": "Train where the policy sometimes succeeds. All-pass and all-fail tasks give no signal."
  },
  {
    "id": "llm-ev-22",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Gymnasium API; SWE-bench and tau-bench papers; your own environment work",
    "chapter": "RL18 RL environments and deterministic graders",
    "prompt": "Before shipping a new environment for training, which validation checks should every task pass?",
    "answer": "1. Oracle check: the reference solution gets full reward, every time (run it several times for flakiness).\n2. Null checks: doing nothing, a trivial or empty answer, and obvious shortcuts get zero reward.\n3. Exploit probes: try to read hidden tests or answer files, edit the grader, use the network, or kill processes; each must fail.\n4. Determinism: same actions give the same reward.\n5. Solvability with the given tools and budget, and a clear spec that a competent human could follow.\n6. Baseline sweep: pass rates from a few current models, to place the task in the curriculum.",
    "pattern": "Oracle passes, null fails, exploits fail, deterministic, solvable."
  },
  {
    "id": "llm-ev-23",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Gymnasium API; SWE-bench and tau-bench papers; your own environment work",
    "chapter": "RL18 RL environments and deterministic graders",
    "prompt": "List reward hacks you should expect a strong policy to find in a coding or tool-use environment.",
    "answer": "1. Editing, deleting, or skipping tests; adding pytest skip markers; making conftest swallow failures.\n2. Hard-coding expected outputs, or detecting the test harness and branching on it.\n3. Reading the answer from somewhere it should not: hidden test files, git history, cached outputs, the grader's source.\n4. Using the network to fetch the upstream fix.\n5. Exiting with code 0 early or crashing the harness so a missing result is read as a pass.\n6. Claiming success in text when the grader trusts the transcript.\n7. In tool-use envs: calling a privileged tool that writes the target state directly.\nAll of these are environment bugs. Fix the environment, not just the reward.",
    "pattern": "If the env has a shortcut, RL will find it. Close shortcuts in the environment."
  },
  {
    "id": "llm-ev-24",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Gymnasium API; SWE-bench and tau-bench papers; your own environment work",
    "chapter": "RL18 RL environments and deterministic graders",
    "prompt": "Sparse outcome reward vs shaped partial credit in agent environments: tradeoffs?",
    "answer": "Sparse outcome (1 if all tests pass, else 0): hard to hack, matches what you want, but gives no signal on hard tasks.\nPartial credit (fraction of tests passed, rubric items, intermediate milestones): denser signal and faster early learning, but every shaping term is a new thing to optimize. The policy may farm easy partial points (pass the trivial tests, ignore the hard one) instead of solving the task.\nCommon compromise: outcome reward as the main signal, small format or validity terms, and partial credit only when each component is something you actually want. Re-check samples for farming.",
    "pattern": "Outcome rewards resist hacking. Shaping speeds learning but invites farming."
  },
  {
    "id": "llm-ev-27",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Gymnasium API; SWE-bench and tau-bench papers; your own environment work",
    "chapter": "RL18 RL environments and deterministic graders",
    "prompt": "What are rubric-based rewards for non-verifiable tasks, and what are their risks?",
    "answer": "For tasks without a programmatic check (research reports, advice, writing), write a per-task rubric of specific checkable items (for example 'cites the dosage limit', 'does not invent a source'), have a judge model score each item, and combine them into a reward.\nBetter than one holistic judge score because each item is narrow and auditable.\nRisks: the policy learns to hit rubric keywords without real quality, judge biases leak into the reward, and rubric coverage gaps get exploited. Mitigate with hidden rubric items, judge ensembles, and human audits of top-scoring samples.",
    "pattern": "Rubrics make judge rewards narrower and auditable, not unhackable."
  },
  {
    "id": "llm-ev-28",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Gymnasium API; SWE-bench and tau-bench papers; your own environment work",
    "chapter": "RL18 RL environments and deterministic graders",
    "prompt": "What are the pitfalls of using an LLM-simulated user in an agent environment?",
    "answer": "1. The simulator is easier than real users: it gives information too readily, follows instructions perfectly, never changes its mind.\n2. It can leak the goal (reveals hidden task details, or tells the agent what to do).\n3. It is nondeterministic, which adds reward noise.\n4. The policy can learn to manipulate the simulator (persuade it to accept a wrong outcome).\nMitigate: fixed persona and goal scripts, a strong simulator model with instructions to withhold information, grading on final state rather than the simulator's satisfaction, and periodic checks against real transcripts.",
    "pattern": "Simulated users are too easy and manipulable. Grade the state, not their approval."
  },
  {
    "id": "llm-rl-56",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Precup et al. 2000; Espeholt et al. 2018, IMPALA (arXiv 1802.01561); Kimi Linear report (truncated importance sampling in RL)",
    "chapter": "RL19 Off-policy learning and importance sampling",
    "prompt": "Derive importance sampling and show why its variance can explode.",
    "answer": "We want E_{x ~ p}[ f(x) ] but have samples from q.\nE_p[ f ] = sum_x p(x) f(x) = sum_x q(x) (p(x) / q(x)) f(x) = E_q[ w(x) f(x) ], with w = p / q.\nUnbiased as long as q(x) > 0 wherever p(x) f(x) != 0.\nVariance: Var_q[ w f ] = E_q[ w^2 f^2 ] - (E_p f)^2, and E_q[ w^2 ] = 1 + chi-squared divergence(p || q), which can be enormous when p and q differ.\nFor trajectories, w = prod_t pi(a_t | s_t) / mu(a_t | s_t), a product over T steps. Even modest per-token ratios multiply up: a ratio of 1.01 per token over 1000 tokens is about 2.1e4. So full-trajectory IS is unusable at LLM lengths.\nPractical consequence: use per-token (or length-normalized per-sequence) ratios with clipping or truncation, accepting bias for lower variance.",
    "pattern": "E_p[f] = E_q[(p / q) f]. Variance grows with divergence, and products over T tokens explode, so clip or truncate."
  },
  {
    "id": "llm-rl-57",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Precup et al. 2000; Espeholt et al. 2018, IMPALA (arXiv 1802.01561); Kimi Linear report (truncated importance sampling in RL)",
    "chapter": "RL19 Off-policy learning and importance sampling",
    "prompt": "Why is LLM RL usually slightly off-policy even when you think it is on-policy?",
    "answer": "1. Multiple updates per batch: after the first minibatch step, the policy has changed, so later steps use data from pi_old. PPO's ratio and clip handle exactly this.\n2. Asynchronous or pipelined RL: rollouts come from a policy one or more versions behind the learner (staleness), to keep GPUs busy.\n3. Train/inference mismatch: the rollout engine (vLLM, SGLang, custom kernels, different precision or parallelism, FP8, batch-dependent kernels) computes slightly different probabilities than the training stack for the same weights. Samples come from pi_infer while gradients assume pi_train.\n4. Sampling tricks: temperature, top-p or top-k during rollouts change the sampling distribution relative to the raw policy.\nEach makes the data off-policy. Small mismatches add up over long sequences and in MoE models (where routing can differ), and have been linked to training collapse.",
    "pattern": "Multiple epochs, async staleness, train vs inference numerics (precision, kernels, MoE routing) and sampling tricks."
  },
  {
    "id": "llm-rl-58",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Precup et al. 2000; Espeholt et al. 2018, IMPALA (arXiv 1802.01561); Kimi Linear report (truncated importance sampling in RL)",
    "chapter": "RL19 Off-policy learning and importance sampling",
    "prompt": "What is truncated importance sampling (TIS) for the train/inference mismatch, and how is it applied?",
    "answer": "Let pi_infer be the probabilities the rollout engine actually sampled from, and pi_train the training stack's probabilities for the same tokens and the same weights.\nPer-token weight: w_t = pi_train(y_t) / pi_infer(y_t).\nTruncated IS: multiply each token's policy-gradient term by min(w_t, C) with a cap C (e.g. 2). Capping only the large weights bounds the variance, at the cost of some bias.\nIn a PPO/GRPO loss: loss_t = min(w_t, C) * clipped_term_t, where the PPO ratio inside still compares pi_theta with pi_old computed by the training stack.\nContext: Yao et al. (2025, \"Your Efficient RL Framework Secretly Brings You Off-Policy RL Training\") showed sizable mismatch between inference engines and training frameworks and proposed this fix; the Kimi Linear report used truncated importance sampling in its RL stage for the same reason.\nDiagnostics: log the distribution of w_t (mean, max, fraction above C) and the token-level KL between the two stacks.",
    "pattern": "Weight each token by min(pi_train / pi_infer, C) to correct engine mismatch with bounded variance; log the weights."
  },
  {
    "id": "llm-rl-59",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: Precup et al. 2000; Espeholt et al. 2018, IMPALA (arXiv 1802.01561); Kimi Linear report (truncated importance sampling in RL)",
    "chapter": "RL19 Off-policy learning and importance sampling",
    "prompt": "What does V-trace (IMPALA) do, and why is it relevant to asynchronous LLM RL?",
    "answer": "IMPALA (Espeholt et al. 2018) decouples actors, which generate experience with possibly stale policies, from a central learner. To correct for the lag, V-trace computes value targets with truncated importance weights:\nv_s = V(x_s) + sum_{t >= s} gamma^(t-s) (prod_{i=s}^{t-1} c_i) rho_t delta_t,\nwith delta_t = r_t + gamma V(x_t+1) - V(x_t), rho_t = min(rho_bar, pi / mu) and c_i = min(c_bar, pi / mu).\nrho_bar controls which policy's value function you converge to; c_bar controls how far corrections propagate (variance). With on-policy data (pi = mu) and caps of at least 1, it reduces to the n-step return.\nRelevance: large-scale LLM RL increasingly runs asynchronously (rollout workers lag the learner by one or more versions) to avoid idle GPUs. The same truncated-IS ideas, plus limits on staleness, are how such systems keep learning stable.",
    "pattern": "Actor-learner split; value targets with truncated IS products (rho_bar, c_bar). Same idea keeps async LLM RL stable."
  },
  {
    "id": "llm-rl-60",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: verl (HybridFlow) and OpenRLHF documentation; TRL GRPOTrainer documentation",
    "chapter": "RL20 The rollout and training loop",
    "prompt": "Write the practical GRPO/RLVR training loop end to end, as a system.",
    "answer": "for step in range(num_steps):\n    prompts = sampler.next_batch()                  # filtered to the learnable difficulty band\n    rollouts = engine.generate(prompts, n=G, temperature=1.0, max_tokens=L, logprobs=True)\n    rewards = grader.score(rollouts)                # parallel, sandboxed, with timeouts\n    groups = filter_zero_variance(rollouts, rewards)   # dynamic sampling: refill if needed\n    adv = group_advantages(groups)                  # r - mean (optionally / std)\n    old_logp = trainer.logprobs(groups)             # recompute with training numerics\n    is_w = truncate(exp(old_logp - groups.engine_logp), C)\n    for mb in minibatches(groups):\n        loss = clipped_pg_loss(trainer.logprobs(mb), old_logp[mb], adv[mb], mb.response_mask, is_w[mb])\n        loss.backward(); clip_grad_norm(); opt.step(); opt.zero_grad()\n    engine.load_weights(trainer.state_dict())       # weight sync\n    log(metrics); maybe_eval(); maybe_checkpoint()\n\nTime usually goes to generation (with a long tail of very long responses), then grading (sandboxes), then training. Weight sync and the long tail are the classic bottlenecks.",
    "pattern": "Sample band-filtered prompts, generate G each, grade, filter, advantages, recompute log-probs, clipped updates, sync weights."
  },
  {
    "id": "llm-ev-25",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: verl (HybridFlow) and OpenRLHF documentation; TRL GRPOTrainer documentation",
    "chapter": "RL20 The rollout and training loop",
    "prompt": "What systems issues dominate when you run RL on agent environments at scale?",
    "answer": "1. Rollout throughput: long multi-turn episodes with tool calls; generation and environment steps dominate wall-clock time, not gradient updates.\n2. Environment latency: container start, test runs, and resets. Use warm pools, snapshots, and parallel workers.\n3. Stragglers: a few very long episodes stall a synchronous batch. Asynchronous rollouts help, at the cost of some off-policy staleness (correct with importance weights or bound the lag).\n4. Mismatch between inference-engine and trainer log-probs (different kernels or precision) can bias the importance ratios; teams monitor and correct it.\n5. Failures: env crashes must be separated from model failures so they are not rewarded as 0 by mistake.",
    "pattern": "RL on agents is rollout bound. Warm pools, async rollouts, separate env errors from model errors."
  },
  {
    "id": "llm-rl-61",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: verl (HybridFlow) and OpenRLHF documentation; TRL GRPOTrainer documentation",
    "chapter": "RL20 The rollout and training loop",
    "prompt": "Colocated vs disaggregated RL systems: what are the designs and tradeoffs?",
    "answer": "Colocated (a hybrid engine, as in verl's HybridFlow design): the same GPUs alternate between rollout (an inference engine such as vLLM or SGLang) and training (FSDP or Megatron), resharding weights in place between phases. Pros: no hardware idles between phases, no cross-cluster weight transfer. Cons: phases are serialized, and memory has to be released and reloaded (KV cache vs optimizer state) at each switch.\nDisaggregated (e.g. OpenRLHF on Ray with separate actor groups, and many in-house systems): dedicated inference GPUs and training GPUs, connected by weight broadcast. Pros: each side tuned separately, and rollouts can overlap with training (asynchronous RL with bounded staleness). Cons: idle time if the sides are unbalanced, weight-sync bandwidth, and off-policy lag to correct.\nAgentic RL adds environment workers (sandboxes, tools) that must scale independently, and very long rollouts push toward asynchronous designs, sometimes carrying partial rollouts across steps.",
    "pattern": "Colocated: same GPUs alternate phases, resharding weights. Disaggregated: separate pools, async overlap, weight broadcast, staleness."
  },
  {
    "id": "llm-rl-62",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: verl (HybridFlow) and OpenRLHF documentation; TRL GRPOTrainer documentation",
    "chapter": "RL20 The rollout and training loop",
    "prompt": "Your RL run is misbehaving. Give a debugging checklist in order.",
    "answer": "1. Grader: rerun it on saved rollouts; hand-check 20 positives and 20 negatives. False positives are the most common silent bug.\n2. Data band: the fraction of zero-variance groups. Near 100% means no signal (too easy or too hard).\n3. Log-prob consistency: compare engine log-probs with training log-probs for the same tokens before any update; ratios should be about 1. Large gaps point to numerics, wrong masks, wrong chat templates or off-by-one token alignment.\n4. Masks: loss only on generated tokens, not prompt or tool outputs; padding excluded; EOS included.\n5. Advantage sanity: sign, scale, sums to zero per group.\n6. Step size: approximate KL and clip fraction per update, grad norm; lower the LR if spiky.\n7. Entropy and length curves: collapse, or runaway growth (often truncation handling or length bias).\n8. Samples: read rollouts from the start, middle and end of training.\n9. Reproduce at small scale with a known-good config before changing algorithms.",
    "pattern": "Grader first, then data band, log-prob agreement, masks, advantages, step size, entropy and length, samples, small repro."
  },
  {
    "id": "llm-rl-build-01",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: verl (HybridFlow) and OpenRLHF documentation; TRL GRPOTrainer documentation",
    "chapter": "RL20 The rollout and training loop",
    "prompt": "Build this (RL track): REINFORCE and PPO from scratch on classic control",
    "answer": "Spec: Implement REINFORCE (with and without a baseline), actor-critic with GAE, and PPO-clip from scratch in PyTorch on CartPole and one continuous task (e.g. Pendulum), and compare with a reference implementation.\n\nSteps:\n1. REINFORCE with reward-to-go; add a learned value baseline; measure the variance of gradient estimates across 100 batches with and without it.\n2. Actor-critic with GAE; sweep lambda in {0, 0.9, 0.95, 1}.\n3. PPO-clip with minibatch epochs, advantage normalization, value loss and entropy bonus; log approximate KL and clip fraction.\n4. 5 seeds per configuration; plot mean and spread; compare with a reference implementation (e.g. CleanRL) on the same task.\n\nSuccess looks like: PPO solves CartPole reliably across seeds, your curves fall in the range of the reference implementation, and a plot shows how the baseline and lambda change gradient variance.",
    "pattern": "Build this: REINFORCE and PPO from scratch on classic control"
  },
  {
    "id": "llm-rl-build-02",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: verl (HybridFlow) and OpenRLHF documentation; TRL GRPOTrainer documentation",
    "chapter": "RL20 The rollout and training loop",
    "prompt": "Build this (RL track): GRPO variants ablation: vanilla vs Dr. GRPO vs DAPO-style",
    "answer": "Spec: On your W29 GRPO math setup, compare loss and advantage variants one change at a time.\n\nSteps:\n1. Baseline: vanilla GRPO (std normalization, per-sequence mean, symmetric clip 0.2, small KL).\n2. Changes, each on its own: no std division; token-level loss; clip-higher (0.2 / 0.28); dynamic sampling; KL removed.\n3. Same prompts, budget and eval; 2 to 3 seeds for the most important arms.\n4. Track accuracy, response length (split by correct and wrong), entropy, and the fraction of zero-variance groups.\n\nSuccess looks like: A table and curves showing which change moved accuracy, length and entropy, agreeing with (or, with evidence, contradicting) the Dr. GRPO and DAPO claims at your scale.",
    "pattern": "Build this: GRPO variants ablation: vanilla vs Dr. GRPO vs DAPO-style"
  },
  {
    "id": "llm-rl-build-03",
    "deck": "RL deep track (with P5, W27-30)",
    "source": "Reading: verl (HybridFlow) and OpenRLHF documentation; TRL GRPOTrainer documentation",
    "chapter": "RL20 The rollout and training loop",
    "prompt": "Build this (RL track): A reward-hacking audit of your own environment",
    "answer": "Spec: Red-team one of your RL environments: find the ways a policy could get reward without solving the task, then prove your fixes work.\n\nSteps:\n1. List candidate exploits (test editing, special-casing, output format tricks, grader parsing bugs, timeouts treated as passes).\n2. Write a scripted cheating policy for each and run it through the grader.\n3. Fix the grader or environment; rerun the cheats; then run a short RL training and scan rollouts for new exploits (pattern search plus reading).\n4. Record which exploits the trained policy actually found.\n\nSuccess looks like: Every scripted cheat gets zero reward after the fixes, a short RL run shows no new exploit in sampled transcripts, and the audit is written so a teammate can rerun it on the next environment.",
    "pattern": "Build this: A reward-hacking audit of your own environment"
  }
];
