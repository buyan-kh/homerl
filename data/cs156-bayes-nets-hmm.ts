import type { Question } from "../lib/types";

export const CS156_BAYES_NETS_HMM: Question[] = [
  {
    id: "bn-paths",
    deck: "CS 156 Bayes Nets and HMMs",
    chapter: "Independence",
    source: "CS 156 lecture: Inference in Bayes Nets / Probabilistic Reasoning Over Time, slides 3-8",
    prompt:
      "How do you check whether two variables are guaranteed independent in a Bayes net, possibly given evidence?",
    answer:
      "Look at every undirected path between the two variables. Split each path into consecutive triples. A path is blocked if even one of those triples is inactive given the evidence. Independence is guaranteed only when every path is blocked, meaning there are no active paths.",
    pattern: "All undirected paths. One inactive triple blocks a path. No active paths means independence is guaranteed.",
  },
  {
    id: "bn-b-indep-d-given-a",
    deck: "CS 156 Bayes Nets and HMMs",
    chapter: "Independence",
    source: "CS 156 lecture, slide 3",
    prompt:
      "In a Bayes net, A points to B and C, and C points to D. Is B independent of D given A? Why?",
    answer:
      "Yes. The only undirected path from B to D is B-A-C-D. That path includes the triples B-A-C and A-C-D. B-A-C is a common-cause (fork) triple with A observed, so it is inactive. One inactive triple blocks the whole path, so there are no active paths, and B is independent of D given A.",
    pattern: "Only path is BACD. The fork BAC is inactive given A, so the path is blocked.",
  },
  {
    id: "bn-one-inactive",
    deck: "CS 156 Bayes Nets and HMMs",
    chapter: "Independence",
    source: "CS 156 lecture, slide 3",
    prompt:
      "If a path from X to Y has several triples, and only one of those triples is inactive given the evidence, is the path active or blocked?",
    answer:
      "Blocked. All it takes to block a path is a single inactive segment.",
    pattern: "One inactive triple is enough to inactivate the whole path.",
  },
  {
    id: "bn-fork-trd",
    deck: "CS 156 Bayes Nets and HMMs",
    chapter: "Independence",
    source: "CS 156 lecture, slides 4-8",
    prompt:
      "In the rain network, R (raining) points to T (traffic) and D (roof drips), and both T and D point to S (I'm sad). When is the path T-R-D active, and when is it inactive?",
    answer:
      "T-R-D is a common-cause, or fork, path: T <- R -> D. It is active when R is not given, and inactive when R is given.",
    pattern: "A fork is active if the middle node is unobserved, and inactive if the middle node is observed.",
  },
  {
    id: "bn-collider-tsd",
    deck: "CS 156 Bayes Nets and HMMs",
    chapter: "Independence",
    source: "CS 156 lecture, slides 4-8",
    prompt:
      "In the same rain network (R -> T, R -> D, T -> S, D -> S), when is the path T-S-D active, and when is it inactive?",
    answer:
      "T-S-D is a common-effect, or collider, path: T -> S <- D. It is inactive when S is not given, and active when S is given.",
    pattern: "A collider is inactive if the middle node is unobserved, and active if the middle node is observed.",
  },
  {
    id: "bn-t-indep-d",
    deck: "CS 156 Bayes Nets and HMMs",
    chapter: "Independence",
    source: "CS 156 lecture, slide 5",
    prompt:
      "In the rain network (R -> T, R -> D, T -> S, D -> S), is T independent of D when we have no evidence? Why?",
    answer:
      "No. There are two paths, T-S-D and T-R-D. T-S-D is a collider with S unobserved, so it is inactive. T-R-D is a fork with R unobserved, so it is active. One active path means independence is not guaranteed.",
    pattern: "TSD is inactive, but TRD is active, so no independence.",
  },
  {
    id: "bn-iclicker-t-d-given-r",
    deck: "CS 156 Bayes Nets and HMMs",
    chapter: "Independence",
    source: "CS 156 lecture, iClicker on slide 6, solution on slide 7",
    prompt:
      "iClicker. In the rain network (R -> T, R -> D, T -> S, D -> S), is T independent of D given R? A. Yes, we can guarantee independence. B. No, we cannot guarantee independence.",
    answer:
      "A. Yes, we can guarantee independence. The two paths are T-S-D and T-R-D. Given only R, the collider T-S-D stays inactive because S is not observed, and the fork T-R-D becomes inactive because R is observed. There are no active paths, so independence is guaranteed.",
    pattern: "Both TSD and TRD are inactive given R, so T is independent of D given R.",
  },
  {
    id: "bn-t-d-given-r-s",
    deck: "CS 156 Bayes Nets and HMMs",
    chapter: "Independence",
    source: "CS 156 lecture, slide 8",
    prompt:
      "In the same rain network, is T independent of D given both R and S? Why?",
    answer:
      "No. T-R-D is still inactive because R is given, but T-S-D becomes active because S is given. One active path is enough, so independence is not guaranteed.",
    pattern: "Conditioning on the collider S opens the T-S-D path, even though R blocks T-R-D.",
  },
  {
    id: "inf-query-evidence-hidden",
    deck: "CS 156 Bayes Nets and HMMs",
    chapter: "Inference by Enumeration",
    source: "CS 156 lecture, slide 9",
    prompt:
      "In the general probabilistic inference setup, what are evidence variables, query variables, and hidden variables, and what probability do we want?",
    answer:
      "Evidence variables E1 through Ek are the ones we have observed, with values e1 through ek. Query variables Q are the ones we want to know about. Hidden variables are the remaining variables we did not observe and are not querying. We want the conditional distribution P(Q | E1=e1, ..., Ek=ek).",
    pattern: "Want P(query | evidence). Hidden variables get summed out.",
  },
  {
    id: "inf-alarm-roles",
    deck: "CS 156 Bayes Nets and HMMs",
    chapter: "Inference by Enumeration",
    source: "CS 156 lecture, slide 10",
    prompt:
      "In the alarm network, B (burglary) and E (earthquake) both point to A (alarm), and A points to J (John calls) and M (Mary calls). John and Mary called, and we want to know if there was a burglary. What are the query, evidence, and hidden variables?",
    answer:
      "Query: B. Evidence: J and M. Hidden: E and A.",
    pattern: "We care about burglary, we observed the two calls, and earthquake and alarm are hidden.",
  },
  {
    id: "inf-iclicker-which-prob",
    deck: "CS 156 Bayes Nets and HMMs",
    chapter: "Inference by Enumeration",
    source: "CS 156 lecture, yellow-box question on slide 10, used on slide 11",
    prompt:
      "John and Mary called, and we want to know if there was a burglary. Query is B, evidence is J and M, and hidden variables are E and A. What probability are we looking for? A. P(+b, +j, +m). B. P(+b | +j, +m). C. P(+b, +j, +m, -e, +a). D. P(+b, +j, +m | -e, +a).",
    answer:
      "B. P(+b | +j, +m). We want the probability of a burglary given the evidence we actually have, the two calls. A is a joint, not a conditional. C and D invent values for the hidden variables E and A, which we did not observe.",
    pattern: "Query given evidence: P(+b | +j, +m). Do not assign values to hidden variables.",
  },
  {
    id: "inf-enumeration-def",
    deck: "CS 156 Bayes Nets and HMMs",
    chapter: "Inference by Enumeration",
    source: "CS 156 lecture, slide 11",
    prompt:
      "What is inference by enumeration, and how does it compute P(+b | +j, +m) in the alarm network?",
    answer:
      "Inference by enumeration is the basic exact inference method for Bayes nets. By definition, P(+b | +j, +m) = P(+b, +j, +m) / P(+j, +m). The joint P(+b, +j, +m) is found by summing the full joint over every setting of the hidden variables E and A, four terms in all: all combinations of +/-e and +/-a.",
    pattern: "Conditional = joint over evidence, then sum out hidden variables, then divide (normalize).",
  },
  {
    id: "inf-sum-out",
    deck: "CS 156 Bayes Nets and HMMs",
    chapter: "Inference by Enumeration",
    source: "CS 156 lecture, slide 11",
    prompt:
      "Write P(+b, +j, +m) as a sum over the hidden variables E and A.",
    answer:
      "P(+b, +j, +m) = P(+b, +j, +m, +e, +a) + P(+b, +j, +m, +e, -a) + P(+b, +j, +m, -e, +a) + P(+b, +j, +m, -e, -a).",
    pattern: "P(X) = P(X, +y) + P(X, -y), applied to both E and A.",
  },
  {
    id: "inf-iclicker-factorization",
    deck: "CS 156 Bayes Nets and HMMs",
    chapter: "Inference by Enumeration",
    source: "CS 156 lecture, yellow-box question on slide 13, used on slides 14-19",
    prompt:
      "In the alarm network, B and E are roots, both point to A, and A points to J and M. What is P(+b, +j, +m, +e, +a)? A. P(+b) P(+j) P(+m) P(+e) P(+a). B. P(+b) P(+e) P(+a | +b, +e) P(+j | +a) P(+m | +a). C. P(+j) P(+m) P(+a | +j, +m) P(+b | +a) P(+e | +a). D. P(+b) P(+e) P(+a | +b) P(+a | +e) P(+j | +a) P(+m | +a). E. P(+b) P(+j) P(+m) P(+e) P(+a | +b, +e, +j, +m).",
    answer:
      "B. P(+b) P(+e) P(+a | +b, +e) P(+j | +a) P(+m | +a). The Bayes net factorization uses each node's probability given only its parents: B and E have no parents, A's parents are B and E, and J and M each have parent A. A is wrong because the variables are not independent. C points the arrows the wrong way. D splits P(A | B, E) into two factors as if B and E were separate parents in two CPTs. E conditions A on J and M as well, which are children, not parents.",
    pattern: "Joint = product of each variable given only its parents.",
  },
  {
    id: "inf-iclicker-pa-given-be",
    deck: "CS 156 Bayes Nets and HMMs",
    chapter: "Inference by Enumeration",
    source: "CS 156 lecture, iClicker on slide 17, solution on slide 18",
    prompt:
      "iClicker. In the alarm CPT, P(A | B, E) has the row +b, +e, +a equal to 0.95, and the row +b, +e, -a equal to 0.05. What is P(+a | +b, +e)?",
    answer:
      "0.95. Read it straight from the P(A | B, E) table at burglary, earthquake, and alarm all true.",
    pattern: "Look up the matching row in P(A | B, E): +b, +e, +a is 0.95.",
  },
  {
    id: "inf-joint-all-true",
    deck: "CS 156 Bayes Nets and HMMs",
    chapter: "Inference by Enumeration",
    source: "CS 156 lecture, slides 14-19",
    prompt:
      "The alarm network tables are: P(+b) = 0.001, P(+e) = 0.002, P(+a | +b, +e) = 0.95, P(+j | +a) = 0.9, and P(+m | +a) = 0.7. Compute P(+b, +j, +m, +e, +a).",
    answer:
      "0.001 x 0.002 x 0.95 x 0.9 x 0.7 = 1.2 x 10^-6.",
    pattern: "Use the Bayes net factorization, then multiply the five CPT entries.",
  },
  {
    id: "inf-iclicker-pj-given-na",
    deck: "CS 156 Bayes Nets and HMMs",
    chapter: "Inference by Enumeration",
    source: "CS 156 lecture, iClicker on slide 21, solution on slide 22",
    prompt:
      "iClicker. In the alarm CPT, P(J | A) has +a, +j equal to 0.9 and -a, +j equal to 0.05. What is P(+j | -a)?",
    answer:
      "0.05. That is P(John calls | alarm is false), from the P(J | A) table.",
    pattern: "Look up P(J | A) at -a, +j, which is 0.05, not the 0.9 that goes with +a.",
  },
  {
    id: "inf-joint-plus-e-minus-a",
    deck: "CS 156 Bayes Nets and HMMs",
    chapter: "Inference by Enumeration",
    source: "CS 156 lecture, slides 20-22",
    prompt:
      "Using P(+b) = 0.001, P(+e) = 0.002, P(-a | +b, +e) = 0.05, P(+j | -a) = 0.05, and P(+m | -a) = 0.01, compute P(+b, +j, +m, +e, -a).",
    answer:
      "0.001 x 0.002 x 0.05 x 0.05 x 0.01 = 5 x 10^-11.",
    pattern: "Same factorization, but now A is false, so use the -a rows, including the small call probabilities.",
  },
  {
    id: "inf-other-two-joints",
    deck: "CS 156 Bayes Nets and HMMs",
    chapter: "Inference by Enumeration",
    source: "CS 156 lecture, slides 23-24",
    prompt:
      "The remaining two terms in P(+b, +j, +m) use P(-e) = 0.998, P(+a | +b, -e) = 0.94, P(-a | +b, -e) = 0.06, P(+j | +a) = 0.9, P(+m | +a) = 0.7, P(+j | -a) = 0.05, and P(+m | -a) = 0.01. What are P(+b, +j, +m, -e, +a) and P(+b, +j, +m, -e, -a)?",
    answer:
      "P(+b, +j, +m, -e, +a) = 0.001 x 0.998 x 0.94 x 0.9 x 0.7 = 0.000591. P(+b, +j, +m, -e, -a) = 0.001 x 0.998 x 0.06 x 0.05 x 0.01 = 3 x 10^-8.",
    pattern: "The -e, +a term is the big one. The -e, -a term is tiny because John and Mary rarely call if the alarm is off.",
  },
  {
    id: "inf-joint-bjm",
    deck: "CS 156 Bayes Nets and HMMs",
    chapter: "Inference by Enumeration",
    source: "CS 156 lecture, slide 25",
    prompt:
      "The four terms of P(+b, +j, +m) are 1.2 x 10^-6, 5 x 10^-11, 0.000591, and 3 x 10^-8. What is P(+b, +j, +m)?",
    answer:
      "0.000592. Almost all of the mass comes from the -e, +a term, 0.000591.",
    pattern: "Sum the four complete assignments. The lecture's rounded total is 0.000592.",
  },
  {
    id: "inf-normalize",
    deck: "CS 156 Bayes Nets and HMMs",
    chapter: "Inference by Enumeration",
    source: "CS 156 lecture, slides 25-27",
    prompt:
      "P(+b, +j, +m) = 0.000592 and P(-b, +j, +m) = 0.001492. How do you get P(+b | +j, +m) and P(-b | +j, +m)? What are the values?",
    answer:
      "Those two joints are not yet conditionals. Normalize by their sum: Z = 0.000592 + 0.001492 = 0.002084. Then P(+b | +j, +m) = 0.000592 / 0.002084 = 0.284, and P(-b | +j, +m) = 0.001492 / 0.002084 = 0.716. Even after both calls, no burglary is still more likely, because a burglary is so rare a priori.",
    pattern: "Z = P(+b, +j, +m) + P(-b, +j, +m). The conditionals are 0.284 and 0.716.",
  },
  {
    id: "inf-summary",
    deck: "CS 156 Bayes Nets and HMMs",
    chapter: "Inference by Enumeration",
    source: "CS 156 lecture, slide 28",
    prompt:
      "What are the main takeaways about Bayes nets from this lecture?",
    answer:
      "Bayes nets compactly encode joint distributions. Guaranteed independences can be read off the graph. Inference by enumeration is the basic exact inference method, and variable elimination can make it more efficient. There are also approximate methods that use randomized sampling.",
    pattern: "Compact joints, independences from the graph, enumeration as exact inference, plus faster exact and approximate methods.",
  },
  {
    id: "mc-why-time",
    deck: "CS 156 Bayes Nets and HMMs",
    chapter: "Markov Chains",
    source: "CS 156 lecture, slides 29-30",
    prompt:
      "Why do we introduce time into our models, and what is the basic idea for doing that?",
    answer:
      "The world changes, so we need to track it and predict it, for things like robot localization, medical monitoring, and speech recognition. The basic idea is to have a set of state random variables Xt at each discrete time step. Those state variables may be observable or unobservable.",
    pattern: "One state Xt per time step. Time is discrete. Used when we have a sequence of observations.",
  },
  {
    id: "mc-first-order",
    deck: "CS 156 Bayes Nets and HMMs",
    chapter: "Markov Chains",
    source: "CS 156 lecture, slide 31",
    prompt:
      "What is the first-order Markov assumption, written as a conditional probability?",
    answer:
      "The state Xt depends only on the previous state Xt-1, not on the earlier states. In symbols, P(Xt | X1:t-1) = P(Xt | Xt-1), where X1:t-1 means X1, X2, ..., Xt-1.",
    pattern: "First-order Markov: Xt depends only on Xt-1.",
  },
  {
    id: "mc-params-stationarity",
    deck: "CS 156 Bayes Nets and HMMs",
    chapter: "Markov Chains",
    source: "CS 156 lecture, slide 32",
    prompt:
      "What parameters define a Markov chain, and what is the stationarity assumption?",
    answer:
      "A Markov chain is defined by initial state probabilities P(X1) and transition probabilities P(Xt | Xt-1), also called the dynamics. Stationarity says those transition probabilities are the same at every time t.",
    pattern: "Need P(X1) and P(Xt | Xt-1). Stationarity: the transition model does not change with t.",
  },
  {
    id: "mc-iclicker-joint",
    deck: "CS 156 Bayes Nets and HMMs",
    chapter: "Markov Chains",
    source: "CS 156 lecture, yellow-box question on slide 33, solution on slide 34",
    prompt:
      "A Markov chain is the Bayes net X1 -> X2 -> X3 -> ... -> Xt. What is P(X1, X2, X3)? A. P(X1) P(X2) P(X3). B. P(X1 | X2) P(X2 | X3) P(X3). C. P(X1) P(X2 | X1) P(X3 | X2). D. P(X1) + P(X2) + P(X3).",
    answer:
      "C. P(X1) P(X2 | X1) P(X3 | X2). That is the Bayes net factorization along the chain. More generally, P(X1, X2, ..., Xt) = P(X1) P(X2 | X1) ... P(Xt | Xt-1). A treats the times as independent. B points the arrows backward. D adds instead of multiplying.",
    pattern: "Joint of a chain is the initial distribution times each one-step transition.",
  },
  {
    id: "mc-weather-cpt",
    deck: "CS 156 Bayes Nets and HMMs",
    chapter: "Markov Chains",
    source: "CS 156 lecture, slide 35",
    prompt:
      "In the weather Markov chain the states are {rain, sun}. What are the four transition probabilities P(Xt | Xt-1)?",
    answer:
      "P(sun | sun) = 0.9, P(rain | sun) = 0.1, P(sun | rain) = 0.3, and P(rain | rain) = 0.7.",
    pattern: "Sun usually stays sun (0.9). Rain usually stays rain (0.7). The off-diagonal values are 0.1 and 0.3.",
  },
  {
    id: "mc-p-x2-sun",
    deck: "CS 156 Bayes Nets and HMMs",
    chapter: "Markov Chains",
    source: "CS 156 lecture, slides 36-37",
    prompt:
      "The weather chain starts with P(X1 = sun) = 1.0, so P(X1 = rain) = 0. P(sun | sun) = 0.9 and P(sun | rain) = 0.3. What is P(X2 = sun), and how do you get it?",
    answer:
      "P(X2 = sun) = P(X2 = sun | X1 = sun) P(X1 = sun) + P(X2 = sun | X1 = rain) P(X1 = rain) = 0.9 * 1.0 + 0.3 * 0.0 = 0.9.",
    pattern: "Total probability: sum over yesterday's weather, using the transition model.",
  },
  {
    id: "mc-iclicker-p-x2-rain",
    deck: "CS 156 Bayes Nets and HMMs",
    chapter: "Markov Chains",
    source: "CS 156 lecture, iClicker on slide 36, solution on slide 37",
    prompt:
      "iClicker. The weather chain starts with P(X1 = sun) = 1.0, and we just found P(X2 = sun) = 0.9. What is P(X2 = rain)?",
    answer:
      "0.1. Rain and sun are the only two states, so P(X2 = rain) = 1 - 0.9 = 0.1.",
    pattern: "The two state probabilities have to add to 1.",
  },
  {
    id: "mc-iclicker-p-x3-sun",
    deck: "CS 156 Bayes Nets and HMMs",
    chapter: "Markov Chains",
    source: "CS 156 lecture, iClicker on slide 38, solution on slide 39",
    prompt:
      "iClicker. The weather chain has P(X2 = sun) = 0.9 and P(X2 = rain) = 0.1, with P(sun | sun) = 0.9 and P(sun | rain) = 0.3. What is P(X3 = sun)?",
    answer:
      "0.84. P(X3 = sun) = P(sun | sun) P(X2 = sun) + P(sun | rain) P(X2 = rain) = 0.9 * 0.9 + 0.3 * 0.1 = 0.81 + 0.03 = 0.84. Then P(X3 = rain) = 1 - 0.84 = 0.16.",
    pattern: "Same one-step update as day 2, but now starting from (0.9, 0.1).",
  },
  {
    id: "mc-mini-forward",
    deck: "CS 156 Bayes Nets and HMMs",
    chapter: "Markov Chains",
    source: "CS 156 lecture, slides 40-41",
    prompt:
      "What does the mini-forward algorithm compute, and what happens to the weather distribution as you run it for more and more days?",
    answer:
      "It computes P(X) on some day t by repeatedly pushing the current distribution through the transition model. In the weather example, starting from all sun you get P(sun) = 1.0, 0.9, 0.84, 0.804, and so on, toward 0.75. Starting from all rain you get 0.0, 0.3, 0.48, 0.588, toward the same 0.75. Any starting distribution [p, 1-p] heads to [0.75, 0.25].",
    pattern: "Forward-simulate the chain. Different starts wash out and meet at the same long-run distribution.",
  },
  {
    id: "mc-stationary-def",
    deck: "CS 156 Bayes Nets and HMMs",
    chapter: "Markov Chains",
    source: "CS 156 lecture, slide 42",
    prompt:
      "What is the stationary distribution of a Markov chain?",
    answer:
      "For most chains, the influence of the initial distribution fades over time, and the distribution you end up in does not depend on where you started. That long-run distribution is the stationary distribution. It satisfies P_inf(X) = P_inf+1(X): once you are in it, one more transition leaves it unchanged.",
    pattern: "The long-run distribution, independent of the start, and a fixed point of the transition model.",
  },
  {
    id: "mc-stationary-weather",
    deck: "CS 156 Bayes Nets and HMMs",
    chapter: "Markov Chains",
    source: "CS 156 lecture, slide 43",
    prompt:
      "In the weather chain, P(sun | sun) = 0.9 and P(sun | rain) = 0.3. What is P(sun) on a date far in the future, such as November 9, 2046, and how do you solve for it?",
    answer:
      "Let s = P_inf(sun) and r = P_inf(rain). Stationarity gives s = 0.9 s + 0.3 r, so 0.1 s = 0.3 r, or s = 3r. Also s + r = 1, so r = 1 - s. Then s = 3(1 - s), so s = 3/4 and r = 1/4. So P_inf(sun) = 3/4 and P_inf(rain) = 1/4. The far-future answer does not depend on today's weather.",
    pattern: "Set s = 0.9s + 0.3r and s + r = 1. The solution is 3/4 sun, 1/4 rain.",
  },
  {
    id: "hmm-why",
    deck: "CS 156 Bayes Nets and HMMs",
    chapter: "Hidden Markov Models",
    source: "CS 156 lecture, slides 44-45",
    prompt:
      "What extra piece do we add when we go from a Markov chain to a hidden Markov model?",
    answer:
      "For most agents we have both transition probabilities, which say how the state evolves, and observations or evidence that we use to update our beliefs. At each time t there is a hidden state Xt, which is unobservable, and an observable evidence variable Et.",
    pattern: "Markov chain: just hidden (or fully observed) states. HMM: hidden states plus evidence at each step.",
  },
  {
    id: "hmm-models",
    deck: "CS 156 Bayes Nets and HMMs",
    chapter: "Hidden Markov Models",
    source: "CS 156 lecture, slides 46-47",
    prompt:
      "An HMM has an underlying Markov chain over states X, plus evidence at each time step. What are the transition model and the emission (sensor) model, and which three distributions define the HMM?",
    answer:
      "The transition model is P(Xt | Xt-1). The emission or sensor model is P(Et | Xt). The HMM is defined by the initial distribution P(X1), the transitions P(Xt | Xt-1), and the emissions P(Et | Xt).",
    pattern: "Three pieces: P(X1), P(Xt | Xt-1), and P(Et | Xt).",
  },
  {
    id: "hmm-weather",
    deck: "CS 156 Bayes Nets and HMMs",
    chapter: "Hidden Markov Models",
    source: "CS 156 lecture, slide 48",
    prompt:
      "In the weather HMM, the hidden chain is Rain_{t-1} -> Rain_t -> Rain_{t+1}, and each rain variable points to an umbrella variable at the same time. What are the states and the emissions, and which three distributions define this HMM?",
    answer:
      "The hidden state Xt is whether it is raining that day. The emission Ut is whether we see an umbrella that day. The model is defined by the initial distribution P(X1), the transitions P(Xt | Xt-1), and the emissions P(Ut | Xt).",
    pattern: "Hidden weather, observed umbrellas. Umbrella depends only on that day's rain.",
  },
  {
    id: "hmm-robot",
    deck: "CS 156 Bayes Nets and HMMs",
    chapter: "Hidden Markov Models",
    source: "CS 156 lecture, slides 49-52",
    prompt:
      "The lecture's robot localization animation shows a map with a cloud of possible positions and a robot taking sensor readings. How is that an HMM?",
    answer:
      "The hidden state is the robot's position (and usually heading) on the map. The transition model says how that position changes when the robot moves. The emissions are the sensor readings, such as range scans of nearby walls. The cloud of possible positions is the belief over the hidden state, updated as new evidence comes in.",
    pattern: "Hidden pose, motion as transitions, sensors as emissions, belief as the distribution over pose.",
  },
];
