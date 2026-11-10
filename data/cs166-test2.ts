import type { Question } from "../lib/types";

export const CS166_TEST2: Question[] = [
  {
    id: "6-1a",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    source: "Stamp Test 2 review (current), official solutions",
    prompt:
      "Timestamps and nonces both prevent replay attacks. What is the most significant advantage of a timestamp over a nonce?",
    answer: "Reduces the number of messages.",
    pattern: "Timestamp: fewer messages. Nonce: time is not a security-critical parameter.",
  },
  {
    id: "6-1b",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    source: "Stamp Test 2 review (current), official solutions",
    prompt:
      "Timestamps and nonces both prevent replay attacks. What is the most significant advantage of a nonce over a timestamp?",
    answer: "When using a nonce, time is not a security critical parameter.",
    pattern: "Timestamp: fewer messages. Nonce: time is not a security-critical parameter.",
  },
  {
    id: "6-2a",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    source: "Stamp Test 2 review (current), official solutions",
    prompt: 'What is a "salt," and how is it used when passwords are stored in a file?',
    answer:
      "A salt is a randomly-generated string of bits that is hashed with a password, and then is stored along with the password for verification.",
    pattern: "Salt is random bits, hashed with the password, and stored with that password entry.",
  },
  {
    id: "6-2b",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    source: "Stamp Test 2 review (current), official solutions",
    prompt: "Why is a salt useful when hashing passwords?",
    answer: "A salt makes a forward search attack more difficult.",
    pattern: "The official wording is forward search, not just \"dictionary\" or \"rainbow table.\"",
  },
  {
    id: "6-3a",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    source: "Stamp Test 2 review (current), official solutions",
    prompt:
      "Methods used to prevent covert channels are inherently weak. In a high-security environment, is it better to use such weak methods or to do nothing at all? Explain.",
    answer:
      "It is better to use such techniques, since it is not much of a burden to implement, and it makes Trudy's job more difficult.",
    pattern:
      "Weak covert-channel and inference controls: still use them, low burden, harder for Trudy. Weak encryption: generally do not use it.",
  },
  {
    id: "6-3b",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    source: "Stamp Test 2 review (current), official solutions",
    prompt:
      "Methods used for inference control are inherently weak. Is it better to use such weak methods or to do nothing at all? Explain.",
    answer:
      "It is better to use such techniques, as in part (a), it makes Trudy's job more difficult, while imposing a minimal burden on the good guys.",
    pattern:
      "Weak covert-channel and inference controls: still use them, low burden, harder for Trudy. Weak encryption: generally do not use it.",
  },
  {
    id: "6-3c",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    source: "Stamp Test 2 review (current), official solutions",
    prompt:
      "Suppose that the only cryptosystem you have access to is known to be weak. Is it better to use this weak system to encrypt your data or to do nothing at all? Explain.",
    answer:
      "It would generally be better not to encrypt using a weak cipher, as encryption implies that the data is important, so it is more likely to be filtered out for further investigation.",
    pattern:
      "Do not use a weak cipher. The official reason is that ciphertext flags the data as important and makes it more likely to be pulled for further investigation.",
  },
  {
    id: "6-4a",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    source: "Stamp Test 2 review (current), official solutions",
    prompt: "In terms of Lampson's access control matrix, what are capabilities (C-lists)?",
    answer: "Rows",
    pattern: "Capabilities = rows (by subject). ACLs = columns (by object).",
  },
  {
    id: "6-4b",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    source: "Stamp Test 2 review (current), official solutions",
    prompt: "In terms of Lampson's access control matrix, what are access control lists (ACLs)?",
    answer: "Columns",
    pattern: "Capabilities = rows (by subject). ACLs = columns (by object).",
  },
  {
    id: "6-5a",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    source: "Stamp Test 2 review (current), official solutions",
    prompt:
      "In biometrics, what are the two most significant differences between the authentication problem and the identification problem?",
    answer:
      "Authentication is a 1-to-1 comparison, and we have cooperative subjects.",
    pattern:
      "The official key states the authentication side: 1-to-1 and cooperative subjects. Identification is the contrast, a 1-to-many comparison, often with less cooperative subjects.",
  },
  {
    id: "6-5b",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    source: "Stamp Test 2 review (current), official solutions",
    prompt: "Which is easier, biometric authentication or identification, and why?",
    answer:
      "Authentication is inherently easier than identification, because we have a 1-to-1 comparison instead of a 1-to-many comparison, and each comparison has a chance of an error.",
    pattern: "More comparisons means more chances of an error, so identification is harder.",
  },
  {
    id: "6-6a",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    source: "Stamp Test 2 review (current), official solutions",
    prompt:
      "Passwords use 64 possible characters. They are truncated or padded with A to 16 characters, then split into X0 (first 8) and X1 (last 8). Store Y0 = h(X0) and Y1 = h(X1). What is the expected work for an exhaustive search to recover one specific password?",
    answer: "(64^8 + 64^8) / 2 = 2^{48}",
    pattern: "Expected work is half the sum of the two 64^8 search spaces, which is 64^8 = 2^{48}.",
  },
  {
    id: "6-6b",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    source: "Stamp Test 2 review (current), official solutions",
    prompt:
      "Under that same 8-and-8 split hashing scheme, why would a 10-character password likely be less secure than an 8-character password?",
    answer:
      "Trudy can attack the 2nd half first, and if it is a 10-character password, Trudy will easily determine the last 2 characters, and then she can use that information to make smarter guesses for the first 8 characters.",
    pattern: "The padded second half of a 10-character password is only 2 unknown characters, so it falls first and helps attack X0.",
  },
  {
    id: "6-7a",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    source: "Stamp Test 2 review (current), official solutions",
    prompt: "At which layer of the protocol stack does a packet filter firewall operate?",
    answer: "Network",
    pattern: "Packet filter: network. Stateful packet filter: transport. Application proxy: application.",
  },
  {
    id: "6-7b",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    source: "Stamp Test 2 review (current), official solutions",
    prompt: "At which layer of the protocol stack does a stateful packet filter operate?",
    answer: "Transport",
    pattern: "Packet filter: network. Stateful packet filter: transport. Application proxy: application.",
  },
  {
    id: "6-7c",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    source: "Stamp Test 2 review (current), official solutions",
    prompt: "At which layer of the protocol stack does an application proxy firewall operate?",
    answer: "Application",
    pattern: "Packet filter: network. Stateful packet filter: transport. Application proxy: application.",
  },
  {
    id: "6-8a",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    source: "Stamp Test 2 review (current), official solutions",
    prompt:
      "2-message public-key protocol. Message 2 is always [T+1]Bob. Do not consider replay only within the clock skew. Message 1: {K, [T]Alice}Bob. Practical for Bob as a multi-user server? Alice authenticated? Bob authenticated? Session key K secure? If a later column is no, illustrate the attack.",
    answer:
      "Practical: no. Alice authenticated: yes. Bob authenticated: yes. Session key secure: yes.\nThe solutions key marks practical as no and does not draw an attack, because you ignore the first column when illustrating attacks. The usual reason it is not practical is that Alice's name is not in the message, so Bob would have to try many clients' public keys to check the signature [T]Alice.",
    pattern:
      "Message 2 [T+1]Bob authenticates Bob. (a) is not practical because Alice is not identified in the clear or after a single decryption.",
  },
  {
    id: "6-8b",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    source: "Stamp Test 2 review (current), official solutions",
    prompt:
      "2-message public-key protocol. Message 2 is always [T+1]Bob. Do not consider replay only within the clock skew. Message 1: {Alice, K, [T]Alice}Bob. Practical? Alice authenticated? Bob authenticated? Session key K secure?",
    answer: "Practical: yes. Alice authenticated: yes. Bob authenticated: yes. Session key secure: yes.",
    pattern:
      "Bob decrypts with his private key, sees Alice's name, then checks her signature. Message 2 [T+1]Bob authenticates Bob.",
  },
  {
    id: "6-8c",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    source: "Stamp Test 2 review (current), official solutions",
    prompt:
      "2-message public-key protocol. Message 2 is always [T+1]Bob. Do not consider replay only within the clock skew. Message 1: Alice, {K, T}Bob. Practical? Alice authenticated? Bob authenticated? Session key K secure? If a later column is no, illustrate the attack.",
    answer:
      "Practical: yes. Alice authenticated: no. Bob authenticated: yes. Session key secure: yes.\nAlice is not authenticated, since Trudy can simply pretend to be Alice. There is a separate card for the official attack diagram.",
    pattern:
      "No signature on this message, so Trudy can send Alice, {K, T}Bob. Bob still replies [T+1]Bob, so Bob is authenticated and K still reaches only Bob.",
  },
  {
    id: "6-8c-attack",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    source: "Stamp Test 2 review (current), official solutions",
    prompt:
      "Illustrate a successful attack by Trudy for this public-key protocol. Message 1: Alice, {K, T}Bob. Message 2: [T+1]Bob. Ignore the practicality column. The solutions key says Alice is not authenticated.",
    answer:
      "Alice is not authenticated, since Trudy can simply pretend to be Alice.\nTrudy sends Alice, {K, T}Bob to Bob, and Bob replies [T+1]Bob to Trudy.",
    answerImage: "/cs166/review/q8c-attack.png",
    pattern: "No signature, so Trudy can spoof Alice's name in the clear and pick K herself.",
  },
  {
    id: "6-9a",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    source: "Stamp Test 2 review (current), official solutions",
    prompt:
      "3-message protocol with shared key KAB. Message 3 is RB. Message 1: E(Alice, K, RA, KAB). Message 2: RA, E(RB, KAB). Practical for Bob as a multi-user server? Alice authenticated? Bob authenticated? Session key K secure?",
    answer:
      "Practical: no. Alice authenticated: yes. Bob authenticated: yes. Session key secure: yes.\nThe solutions key marks practical as no and does not draw an attack for this part. The usual reason is that Alice's identity is inside the ciphertext, so Bob cannot tell which shared key KAB to use.",
    pattern: "If the name needed to choose KAB is encrypted, a multi-user server cannot start the lookup.",
  },
  {
    id: "6-9b",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    source: "Stamp Test 2 review (current), official solutions",
    prompt:
      "3-message protocol with shared key KAB. Message 3 is RB. Message 1: Alice, E(Alice, K, KAB), E(Alice, RA, KAB). Message 2: RA, E(Bob, RB, KAB). Practical? Alice authenticated? Bob authenticated? Session key K secure? If a later column is no, illustrate the attack.",
    answer:
      "Practical: yes. Alice authenticated: yes. Bob authenticated: yes. Session key secure: no.\nTrudy intercepts message 1 and replays it, but swaps the two encrypted parts to obtain Alice and Bob's session key. There is a separate card for the official attack diagram.",
    pattern:
      "The two pieces are encrypted separately, so Trudy can swap them and Bob will return K in the clear, thinking it is RA.",
  },
  {
    id: "6-9b-attack",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    source: "Stamp Test 2 review (current), official solutions",
    prompt:
      "Illustrate a successful attack by Trudy for this shared-key protocol. Message 1: Alice, E(Alice, K, KAB), E(Alice, RA, KAB). Message 2: RA, E(Bob, RB, KAB). Message 3 is RB. Ignore the practicality column. The solutions key says the session key is not secure.",
    answer:
      "Trudy intercepts message 1 and replays it, but swaps the two encrypted parts to obtain Alice and Bob's session key.\nShe sends Alice, E(Alice, RA, KAB), E(Alice, K, KAB) to Bob. Bob replies K, E(Bob, RB, KAB), putting the session key in the clear where RA should have been.",
    answerImage: "/cs166/review/q9b-attack.png",
    pattern: "Swap the two ciphertexts so Bob treats K as the nonce RA and sends K in the clear.",
  },
  {
    id: "6-9c",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    source: "Stamp Test 2 review (current), official solutions",
    prompt:
      "3-message protocol with shared key KAB. Message 3 is RB. Message 1: Alice, E(K, KAB), E(RA, K). Message 2: RA, E(RB, KAB). Practical? Alice authenticated? Bob authenticated? Session key K secure?",
    answer: "Practical: yes. Alice authenticated: yes. Bob authenticated: yes. Session key secure: yes.",
    pattern:
      "The official key marks every column yes for (c). E(RA, K) binds the nonce to the session key, and Message 2 and RB complete the authentication.",
  },
  {
    id: "6-10a",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    source: "Stamp Test 2 review (current), official solutions",
    prompt:
      "Fiat-Shamir: N = 55, v = 34. Bob accepts if y^2 = x * v^e mod N. First iteration: x = 4, e = 1, y = 24. Does Bob accept? Show your work.",
    answer:
      "Yes, Bob accepts this iteration. We must show that y^2 = x * v^e mod N, that is, 24^2 = 4 * 34^1 mod 55. This is true since 24^2 = 576 = 26 mod 55 and 4 * 34 = 26 mod 55.",
    pattern: "Check y^2 vs x * v^e mod N. When e = 0, y is r. When e = 1, y = rS, so S = r^{-1} * y.",
  },
  {
    id: "6-10b",
    deck: "CS 166 Test 2",
    chapter: "Ch 6-9",
    source: "Stamp Test 2 review (current), official solutions",
    prompt:
      "Fiat-Shamir: N = 55, v = 34. Second iteration: x = 4, e = 0, y = 13. Find Alice's secret S. Hint: 13^{-1} mod 55 = 17.",
    answer:
      "Since x = r^2 mod 55 = 4 in (a) and (b), we assume that r is the same in both cases. Then from the iteration in (a), we have rS = 24 mod 55 and from (b), we have r = 13. Using the hint, we have S = r^{-1} rS = 17 * 24 mod 55 = 23.\nThe problem does not require it, but you can check that the solution is correct by verifying that v = S^2 mod N, that is, 34 = 23^2 mod 55.",
    pattern: "Same x in both iterations means the same r. From e = 0, r = 13. Then S = 17 * 24 = 23 mod 55.",
  },
];
