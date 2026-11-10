import type { Question } from "../lib/types";

export const CS166_TEST2: Question[] = [
  {
    id: "6-1a",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    prompt:
      "Timestamps and nonces both prevent replay attacks. What is the most significant advantage of a timestamp over a nonce?",
    answer: "A timestamp usually needs fewer messages, so the protocol is more efficient.",
    pattern: "Timestamp: fewer messages. Nonce: no clock issues.",
  },
  {
    id: "6-1b",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    prompt:
      "Timestamps and nonces both prevent replay attacks. What is the most significant advantage of a nonce over a timestamp?",
    answer:
      "With a nonce, time is not a security-critical parameter, so clock skew and synchronized clocks are not an issue.",
    pattern: "Timestamp: fewer messages. Nonce: no clock issues.",
  },
  {
    id: "6-2a",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    prompt: 'What is a "salt," and how is it used when passwords are stored in a file?',
    answer:
      "A salt is a non-secret value that is appended (or prepended) to the password before the password is hashed. The salt is stored alongside the hash.",
    pattern: "Salt is public, mixed in before hashing, stored with the hash.",
  },
  {
    id: "6-2b",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    prompt: "Why is a salt useful when hashing passwords?",
    answer:
      "It stops Trudy from using one precomputed dictionary or rainbow table against every user. Each salt needs its own hashes, so a dictionary attack gets much more expensive.",
    pattern: "Salt defeats precomputed hashes, not an exhaustive search of one password.",
  },
  {
    id: "6-3a",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    prompt:
      "Methods used to prevent covert channels are inherently weak. In a high-security environment, is it better to use such weak methods or to do nothing at all? Explain.",
    answer:
      "Use the weak methods. They still raise the effort needed to leak information, which matters in a high-security setting.",
    pattern:
      "Weak covert-channel and inference controls: still use them. Weak encryption: usually do nothing.",
  },
  {
    id: "6-3b",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    prompt:
      "Methods used for inference control are inherently weak. Is it better to use such weak methods or to do nothing at all? Explain.",
    answer:
      "Use the weak methods. They still make inference harder, even if they cannot block it completely.",
    pattern:
      "Weak covert-channel and inference controls: still use them. Weak encryption: usually do nothing.",
  },
  {
    id: "6-3c",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    prompt:
      "Suppose that the only cryptosystem you have access to is known to be weak. Is it better to use this weak system to encrypt your data or to do nothing at all? Explain.",
    answer:
      "Generally do nothing. Weak encryption can create a false sense of security, and an attacker who breaks it gets the plaintext.",
    pattern:
      "Weak covert-channel and inference controls: still use them. Weak encryption: usually do nothing.",
  },
  {
    id: "6-4a",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    prompt: "In terms of Lampson's access control matrix, what are capabilities (C-lists)?",
    answer:
      "Capabilities are the rows of the matrix: for each subject, the list of objects and the rights that subject has to them.",
    pattern: "Capabilities = rows (by subject). ACLs = columns (by object).",
  },
  {
    id: "6-4b",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    prompt: "In terms of Lampson's access control matrix, what are access control lists (ACLs)?",
    answer:
      "ACLs are the columns of the matrix: for each object, the list of subjects and the rights those subjects have to that object.",
    pattern: "Capabilities = rows (by subject). ACLs = columns (by object).",
  },
  {
    id: "6-5a",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    prompt:
      "In biometrics, what are the two most significant differences between the authentication problem and the identification problem?",
    answer:
      "Authentication is a one-to-one comparison and the subject is usually cooperative. Identification is one-to-many (many comparisons) and subjects are often uncooperative, which can mean poor enrollment data.",
    pattern: "Auth: 1-to-1 and cooperative. ID: 1-to-many and often uncooperative.",
  },
  {
    id: "6-5b",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    prompt: "Which is easier, biometric authentication or identification, and why?",
    answer:
      "Authentication is easier because it is one comparison, so there is less chance of a false match. Identification does many comparisons, so the error chance grows.",
    pattern: "More comparisons means more chances to be wrong, so identification is harder.",
  },
  {
    id: "6-6a",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    prompt:
      "Passwords use 64 possible characters. They are truncated or padded with A to 16 characters, then split into X0 (first 8) and X1 (last 8). Store Y0 = h(X0) and Y1 = h(X1). What is the expected work for an exhaustive search to recover one specific password?",
    answer:
      "Each half has 64^8 = 2^48 possibilities. Expected work is (64^8 + 64^8) / 2 = 64^8 = 2^48.",
    pattern: "Split hashes: work is about half the sum of the two search spaces, often dominated by the larger half.",
  },
  {
    id: "6-6b",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    prompt:
      "Under that same 8-and-8 split hashing scheme, why would a 10-character password likely be less secure than an 8-character password?",
    answer:
      "A 10-character password puts two real characters plus six A's into X1, so X1 can be cracked with only 64^2 work. That reveals the last two characters and then a dictionary attack on the first eight gets much easier. An 8-character password makes X1 all padding, so it leaks no password characters.",
    pattern: "Padding in the second half can make part of the password cheap to recover.",
  },
  {
    id: "6-7a",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    prompt: "At which layer of the protocol stack does a packet filter firewall operate?",
    answer: "The network layer.",
    pattern: "Packet filter: network. Stateful packet filter: transport. Application proxy: application.",
  },
  {
    id: "6-7b",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    prompt: "At which layer of the protocol stack does a stateful packet filter operate?",
    answer: "The transport layer.",
    pattern: "Packet filter: network. Stateful packet filter: transport. Application proxy: application.",
  },
  {
    id: "6-7c",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    prompt: "At which layer of the protocol stack does an application proxy firewall operate?",
    answer: "The application layer.",
    pattern: "Packet filter: network. Stateful packet filter: transport. Application proxy: application.",
  },
  {
    id: "6-8a",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    prompt:
      "Public-key protocol, do not consider replay only within the clock skew. Message 1: {K, [T]Alice}Bob. Is it practical for Bob as a multi-user server? Is Alice authenticated? Is Bob authenticated? Is session key K secure? If not, give the attack.",
    answer:
      "Practical: yes, Bob decrypts with his private key and does not need to know who is talking first. Alice: yes, her signature is on T and only Bob can open the ciphertext. Bob: no, anyone can encrypt to Bob, and this message does not prove Bob took part. K: yes for confidentiality to Bob, but Alice cannot be sure she is talking to Bob. Trudy can impersonate Bob toward Alice because Alice never gets a response that only Bob could make.",
    pattern:
      "Ask: can the server choose the right key? Who is bound by a signature or shared key? Can Trudy insert or swap a key?",
  },
  {
    id: "6-8b",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    prompt:
      "Public-key protocol, ignore replay only within clock skew. Message 1: {Alice, K, [T]Alice}Bob. Practical? Alice authenticated? Bob authenticated? K secure? If not, give the attack.",
    answer:
      "Practical: yes. Alice: yes, the signed timestamp is inside the ciphertext, and her name is included. Bob: no, anyone can encrypt a message to Bob. K is confidential to Bob, but Alice has no proof she reached Bob. Same attack idea as 8a: Trudy can stand in for Bob from Alice's point of view.",
    pattern:
      "Ask: can the server choose the right key? Who is bound by a signature or shared key? Can Trudy insert or swap a key?",
  },
  {
    id: "6-8c",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    prompt:
      "Public-key protocol, ignore replay only within clock skew. Message 1: Alice, {K, T}Bob. Practical? Alice authenticated? Bob authenticated? K secure? If not, give the attack.",
    answer:
      "Practical: yes, Alice's name is in the clear. Alice: no, there is no signature, so Trudy can send Alice, {K, T}Bob and pretend to be Alice. Bob: no. K: no, because Trudy can choose K and impersonate Alice.",
    pattern: "If there is no signature or shared-key proof, anyone can spoof Alice.",
  },
  {
    id: "6-9a",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    prompt:
      "Shared key KAB. Message 1: E(Alice, K, RA, KAB). Message 2: RA, E(RB, KAB). Practical for Bob as a multi-user server? Alice authenticated? Bob authenticated? K secure? If not, give the attack.",
    answer:
      "Practical: no. Alice's identity is inside the ciphertext, so Bob cannot tell which user's key to use to decrypt it. Skip the other columns once it is not practical, or note that if Bob already knew it was Alice, both sides have KAB so authentication and K would work, but a server with many users cannot get that far.",
    pattern: "If the identity needed to choose KAB is encrypted, the server cannot start the lookup.",
  },
  {
    id: "6-9b",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    prompt:
      "Shared key KAB. Message 1: Alice, E(Alice, K, KAB), E(Alice, RA, KAB). Message 2: RA, E(Bob, RB, KAB). Practical? Alice authenticated? Bob authenticated? K secure? If not, give the attack.",
    answer:
      "Practical: yes, Alice's name is in the clear. Alice and Bob can be authenticated because each encrypts under KAB. K is not secure: K and RA are in separate ciphertexts, so Trudy can cut-and-paste. She can replace E(Alice, K, KAB) with a ciphertext from another run (or her own) and keep E(Alice, RA, KAB). Bob will still return the matching RA, and the session key Alice and Bob end up using may be one Trudy chose or already knows.",
    pattern: "Separate encryptions of K and the nonce invite a cut-and-paste attack.",
  },
  {
    id: "6-9c",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    prompt:
      "Shared key KAB. Message 1: Alice, E(K, KAB), E(RA, K). Message 2: RA, E(RB, KAB). Practical? Alice authenticated? Bob authenticated? K secure? If not, give the attack.",
    answer:
      "Practical: yes. Alice: not securely, because E(K, KAB) does not bind Alice, and E(RA, K) uses the new session key. Trudy can send Alice, E(K, KAB) for a K she chose, plus E(RA, K), then she can read or fake the RA check. Bob: Message 2 only returns RA in the clear and E(RB, KAB), which does not convince Alice in a strong way that this session's K is fresh and bound to Bob. K: no, Trudy can choose K and impersonate Alice.",
    pattern: "If K is only encrypted under KAB and not bound to Alice and a nonce together, Trudy can plant K.",
  },
  {
    id: "6-10a",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    prompt:
      "Fiat-Shamir: N = 55, v = 34. Bob accepts if y^2 = x * v^e mod N. First iteration: x = 4, e = 1, y = 24. Does Bob accept? Show your work.",
    answer:
      "Left side: y^2 = 24^2 = 576, and 576 mod 55 = 26 (because 55 * 10 = 550, 576 - 550 = 26). Right side: x * v^e = 4 * 34^1 = 136, and 136 mod 55 = 26 (55 * 2 = 110, 136 - 110 = 26). 26 = 26, so Bob accepts.",
    pattern: "Check y^2 vs x * v^e mod N. When e = 0, y is r. When e = 1, y = rS, so S = y * r^{-1}.",
  },
  {
    id: "6-10b",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    prompt:
      "Fiat-Shamir: N = 55, v = 34. Second iteration: x = 4, e = 0, y = 13. Find Alice's secret S. Hint: 13^{-1} mod 55 = 17.",
    answer:
      "When e = 0, y = r, so r = 13 (and 13^2 = 169 = 4 mod 55, which matches x). From the first iteration, e = 1 and y = rS = 24, so S = 24 * 13^{-1} = 24 * 17 = 408, and 408 mod 55 = 23. Check: S^2 = 23^2 = 529, 529 mod 55 = 34, which equals v.",
    pattern: "When e = 0 you learn r. Combine with an e = 1 round to get S = y * r^{-1} mod N.",
  },
];
