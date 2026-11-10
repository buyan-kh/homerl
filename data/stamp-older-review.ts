import type { Question } from "../lib/types";

export const STAMP_OLDER_REVIEW: Question[] = [
  {
    id: "old-1a",
    deck: "Stamp older review",
    source: "Stamp older review.pdf",
    chapter: "Passwords",
    prompt: "Why do we hash passwords that are stored in a password file?",
    answer:
      "So the file does not hold plaintext passwords. If an attacker steals the file, they still must crack hashes instead of reading passwords directly. At login the system hashes the typed password and compares hashes.",
    pattern: "Store hashes, never plaintext passwords.",
  },
  {
    id: "old-1b",
    deck: "Stamp older review",
    source: "Stamp older review.pdf",
    chapter: "Passwords",
    prompt:
      "Why is it better to hash passwords than to encrypt the password file with a symmetric cipher?",
    answer:
      "Encryption needs a decryption key that the system can use, so that key becomes a single point of failure: steal the key and every password opens. Hashing is one-way; there is no key that decrypts the file back to passwords.",
    pattern: "Hashing avoids a master decryption key sitting next to the file.",
  },
  {
    id: "old-2a",
    deck: "Stamp older review",
    source: "Stamp older review.pdf",
    chapter: "Protocols",
    prompt:
      "Timestamps and nonces are both used in security protocols to prevent replay attacks. Give one significant advantage of a timestamp over a nonce.",
    answer: "A timestamp usually needs fewer messages, so the protocol is more efficient.",
    pattern: "Timestamp: fewer messages. Nonce: no clock issues.",
  },
  {
    id: "old-2b",
    deck: "Stamp older review",
    source: "Stamp older review.pdf",
    chapter: "Protocols",
    prompt:
      "Timestamps and nonces are both used in security protocols to prevent replay attacks. Give one significant advantage of a nonce over a timestamp.",
    answer:
      "With a nonce, time is not a security-critical parameter, so clock skew and synchronized clocks are not an issue.",
    pattern: "Timestamp: fewer messages. Nonce: no clock issues.",
  },
  {
    id: "old-3a",
    deck: "Stamp older review",
    source: "Stamp older review.pdf",
    chapter: "Covert channels",
    prompt:
      "Methods used to prevent covert channels are inherently weak. Is it better to use such weak methods or to do nothing at all? Why?",
    answer:
      "Use the weak methods. They still raise the effort needed to leak information, which matters in a high-security setting.",
    pattern:
      "Weak covert-channel and inference controls: still use them. Weak encryption: usually do nothing.",
  },
  {
    id: "old-3b",
    deck: "Stamp older review",
    source: "Stamp older review.pdf",
    chapter: "Crypto",
    prompt:
      "Suppose that the only cryptosystem you have access to is known to be weak. Is it better to use this weak system to encrypt your data or to do nothing at all? Why?",
    answer:
      "Generally do nothing. Weak encryption can create a false sense of security, and an attacker who breaks it gets the plaintext.",
    pattern:
      "Weak covert-channel and inference controls: still use them. Weak encryption: usually do nothing.",
  },
  {
    id: "old-3c",
    deck: "Stamp older review",
    source: "Stamp older review.pdf",
    chapter: "Inference control",
    prompt:
      "Methods used for inference control are inherently weak. Is it better to use such weak methods or to do nothing at all? Why?",
    answer:
      "Use the weak methods. They still make inference harder, even if they cannot block it completely.",
    pattern:
      "Weak covert-channel and inference controls: still use them. Weak encryption: usually do nothing.",
  },
  {
    id: "old-4a",
    deck: "Stamp older review",
    source: "Stamp older review.pdf",
    chapter: "Biometrics",
    prompt: "With respect to biometrics, what is the authentication problem?",
    answer:
      "Authentication asks: is this subject who they claim to be? It is a one-to-one compare of a fresh sample against one enrolled template, and the subject is usually cooperative.",
    pattern: "Authentication = 1-to-1 verification of a claimed identity.",
  },
  {
    id: "old-4b",
    deck: "Stamp older review",
    source: "Stamp older review.pdf",
    chapter: "Biometrics",
    prompt: "With respect to biometrics, what is the identification problem?",
    answer:
      "Identification asks: who is this subject? It compares one sample against many enrolled templates (one-to-many). Subjects are often uncooperative, so enrollment data can be poor.",
    pattern: "Identification = 1-to-many search for an identity.",
  },
  {
    id: "old-4c",
    deck: "Stamp older review",
    source: "Stamp older review.pdf",
    chapter: "Biometrics",
    prompt: "Which is inherently easier, authentication or identification? Why?",
    answer:
      "Authentication is easier because it is one comparison, so there is less chance of a false match. Identification does many comparisons, so the error chance grows.",
    pattern: "More comparisons means more chances to be wrong, so identification is harder.",
  },
  {
    id: "old-5a",
    deck: "Stamp older review",
    source: "Stamp older review.pdf",
    chapter: "Access control",
    prompt: "Give one significant advantage of capabilities over ACLs.",
    answer:
      "Delegation is easy: pass the capability. Capabilities also help with the confused deputy problem because the rights travel with the opaque reference the program holds, not with a forgeable resource name alone.",
    pattern: "Capabilities: easy delegation and confused-deputy resistance.",
  },
  {
    id: "old-5b",
    deck: "Stamp older review",
    source: "Stamp older review.pdf",
    chapter: "Access control",
    prompt: "Give one significant advantage of ACLs over capabilities.",
    answer:
      "It is easy to see (and revoke) who can access a given object: read that object's column. With capabilities you must hunt through subjects' C-lists to answer the same question.",
    pattern: "ACLs: easy per-object review and revoke.",
  },
  {
    id: "old-6a",
    deck: "Stamp older review",
    source: "Stamp older review.pdf",
    chapter: "Passwords",
    prompt:
      "Passwords use 128 possible characters. Truncate or pad with A to 16 characters, split into X0 (first 8) and X1 (last 8), store Y0 = h(X0) and Y1 = h(X1). What is the expected work for an exhaustive search to recover one specific password?",
    answer:
      "Each half has 128^8 = 2^56 candidates. Expected work to recover both halves is (2^56)/2 + (2^56)/2 = 2^56.",
    pattern: "Split hashes: expected work is about the size of one half when halves are equal.",
  },
  {
    id: "old-6b",
    deck: "Stamp older review",
    source: "Stamp older review.pdf",
    chapter: "Passwords",
    prompt:
      "Under that same 8-and-8 split hashing scheme (128-char alphabet), how could you attack a specific password in a way that would, in general, provide a significant shortcut over an exhaustive search and also provide an improvement over a standard dictionary attack?",
    answer:
      "Crack the two halves independently (and use padding structure). Short passwords make X1 all A's, so Y1 is a known constant and you only search X0. Slightly longer passwords put only a few real characters in X1, so that half is cheap. Even in the worst case, two searches of size 128^8 beat one search of size 128^16. Dictionary / rainbow methods can also target each half separately.",
    pattern: "Attack halves alone; padding turns part of the password into an easy target.",
  },
  {
    id: "old-7a",
    deck: "Stamp older review",
    source: "Stamp older review.pdf",
    chapter: "Firewalls",
    prompt: "At which layer of the protocol stack does a packet filter operate?",
    answer: "The network layer.",
    pattern: "Packet filter: network. Stateful packet filter: transport. Application proxy: application.",
  },
  {
    id: "old-7b",
    deck: "Stamp older review",
    source: "Stamp older review.pdf",
    chapter: "Firewalls",
    prompt: "At which layer of the protocol stack does a stateful packet filter operate?",
    answer: "The transport layer.",
    pattern: "Packet filter: network. Stateful packet filter: transport. Application proxy: application.",
  },
  {
    id: "old-7c",
    deck: "Stamp older review",
    source: "Stamp older review.pdf",
    chapter: "Firewalls",
    prompt: "At which layer of the protocol stack does an application proxy operate?",
    answer: "The application layer.",
    pattern: "Packet filter: network. Stateful packet filter: transport. Application proxy: application.",
  },
  {
    id: "old-8a",
    deck: "Stamp older review",
    source: "Stamp older review.pdf",
    chapter: "Protocols",
    prompt:
      "Shared key KAB. 3-message protocol, Msg3 is RB.\nMsg1: \"Alice\", E(K, RA, KAB)\nMsg2: RA, E(RB, KAB)\nPractical for multi-user Bob? Who is securely authenticated? Is K secure? If not, give an attack.",
    answer:
      "Inferred from protocol analysis (no official key). Practical: yes, Alice's name is in the clear. Alice authenticated: yes, only a holder of KAB can build Msg1. Bob authenticated: yes, E(RB, KAB) proves Bob has KAB, and RA matches. K secure: yes, K is bound with RA under KAB.",
    pattern: "Cleartext identity plus E(K, RA, KAB) is a solid shared-key pattern.",
  },
  {
    id: "old-8b",
    deck: "Stamp older review",
    source: "Stamp older review.pdf",
    chapter: "Protocols",
    prompt:
      "Shared key KAB. 3-message protocol, Msg3 is RB.\nMsg1: \"Alice\", RA\nMsg2: E(K, RA, RB, KAB)\nPractical? Who is authenticated? Is K secure? If not, give an attack.",
    answer:
      "Inferred from protocol analysis (no official key). Practical: yes. Alice authenticated: yes, she must decrypt Msg2 to return RB. Bob authenticated: yes, only Bob can build E(K, RA, RB, KAB). K secure: yes, it sits with both nonces under KAB.",
    pattern: "Bob encrypts K with both nonces; Alice's return of RB proves she opened it.",
  },
  {
    id: "old-8c",
    deck: "Stamp older review",
    source: "Stamp older review.pdf",
    chapter: "Protocols",
    prompt:
      "Shared key KAB. 3-message protocol, Msg3 is RB.\nMsg1: E(\"Alice\", K, RA, KAB)\nMsg2: RA, E(RB, KAB)\nPractical? Who is authenticated? Is K secure? If not, give an attack.",
    answer:
      "Inferred from protocol analysis (no official key). Practical: no. Alice's identity is inside the ciphertext, so Bob cannot tell which user's key to use to decrypt it. Skip the other columns once it is not practical, or note that if Bob already knew it was Alice, both sides have KAB so authentication and K would work, but a server with many users cannot get that far.",
    pattern: "If the identity needed to choose KAB is encrypted, the server cannot start the lookup.",
  },
  {
    id: "old-9a",
    deck: "Stamp older review",
    source: "Stamp older review.pdf",
    chapter: "Protocols",
    prompt:
      "Public-key 3-message protocol, Msg3 is RB.\nMsg1: {\"Alice\", K, RA}Bob\nMsg2: RA, RB\nPractical? Who is authenticated? Is K secure? If not, give an attack.",
    answer:
      "Inferred from protocol analysis (no official key). Practical: yes. Alice authenticated: no. Anyone can encrypt to Bob, so Trudy sends {\"Alice\", K, RA}Bob. Bob authenticated: no. Msg2 is RA, RB in the clear; anyone can send it. K secure: no. Trudy chose K.",
    pattern: "Encrypting to Bob alone does not authenticate Alice, and cleartext Msg2 authenticates nobody.",
  },
  {
    id: "old-9b",
    deck: "Stamp older review",
    source: "Stamp older review.pdf",
    chapter: "Protocols",
    prompt:
      "Public-key 3-message protocol, Msg3 is RB.\nMsg1: \"Alice\", {K, RA}Bob\nMsg2: RA, {RB}Alice\nPractical? Who is authenticated? Is K secure? If not, give an attack.",
    answer:
      "Inferred from protocol analysis (no official key). Practical: yes. Alice authenticated: no. Trudy can send \"Alice\", {K, RA}Bob for a K she picks. Bob authenticated: no. Anyone can encrypt {RB}Alice; that ciphertext does not prove Bob. K secure: no. Trudy planted K.",
    pattern: "Public-key encryption to Alice or Bob is not a signature. Bind with [ ] signatures or a shared key.",
  },
  {
    id: "old-9c",
    deck: "Stamp older review",
    source: "Stamp older review.pdf",
    chapter: "Protocols",
    prompt:
      "Public-key 3-message protocol, Msg3 is RB.\nMsg1: {\"Alice\", K, RA, RB}Bob\nMsg2: RA, {RB}Alice\nPractical? Who is authenticated? Is K secure? If not, give an attack.",
    answer:
      "Inferred from protocol analysis (no official key). Practical: yes. Alice authenticated: no. Anyone can encrypt Msg1 to Bob. Bob authenticated: no. {RB}Alice can be built by anyone who sees RB (including from Msg1 if Alice chose it, or by inventing RB). K secure: no. Trudy chooses K and impersonates Alice.",
    pattern: "Still no signature or shared-key proof, so Trudy can spoof Alice and plant K.",
  },
  {
    id: "old-10a",
    deck: "Stamp older review",
    source: "Stamp older review.pdf",
    chapter: "Fiat-Shamir",
    prompt:
      "Fiat-Shamir: N = 63, v = 43. First iteration: x = 37, e = 0, y = 10. Precisely what does Bob compute to verify this iteration?",
    answer:
      "Bob checks y^2 = x * v^e mod N. With e = 0 this is y^2 = x mod 63.\n10^2 = 100, and 100 mod 63 = 37, which equals x, so Bob accepts.",
    pattern: "Verify y^2 vs x * v^e mod N. When e = 0, that is just y^2 = x.",
  },
  {
    id: "old-10b",
    deck: "Stamp older review",
    source: "Stamp older review.pdf",
    chapter: "Fiat-Shamir",
    prompt:
      "Fiat-Shamir: N = 63, v = 43. Second iteration: x = 37, e = 1, y = 4. Find S and verify v = S^2 mod N. Hint: 10^{-1} mod 63 = 19.",
    answer:
      "From the e = 0 round, y = r = 10. From e = 1, y = rS = 4, so S = 4 * 10^{-1} = 4 * 19 = 76, and 76 mod 63 = 13.\nCheck: 13^2 = 169, 169 mod 63 = 43, which equals v.",
    pattern: "e = 0 leaks r. Then S = y * r^{-1} mod N from an e = 1 round.",
  },
];
