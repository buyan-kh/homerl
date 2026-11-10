import type { Question } from "../lib/types";

export const AUSTIN_EXAM2: Question[] = [
  {
    id: "austin-1",
    deck: "Austin practice Exam 2",
    source: "Austin practice Exam 2",
    chapter: "Firewalls",
    prompt:
      "Select all true statements about a packet filter.\nA. Operates at the network layer.\nB. Operates at the transport layer.\nC. Defends against a TCP ACK scan.\nD. Is more efficient than an application proxy.\nE. Is aware of TCP connections.",
    answer:
      "A and D. A packet filter works at the network layer and is cheaper than an application proxy. It is not at the transport layer, does not track TCP connections (a stateful filter does), and typically fails against a TCP ACK scan because ACKs are often allowed through.",
    pattern: "Packet filter: network layer, fast, no connection state, weak vs ACK scans.",
  },
  {
    id: "austin-2",
    deck: "Austin practice Exam 2",
    source: "Austin practice Exam 2",
    chapter: "Kerberos",
    prompt:
      "Select all true statements about Kerberos.\nA. The KDC is designed to be stateless to prevent denial of service attacks.\nB. Alice's password is encrypted and stored on her machine.\nC. The protocol uses nonces rather than timestamps for the sake of efficiency.\nD. A ticket granting ticket (TGT) is sent to the KDC to gain access to other resources.\nE. The KDC is a single point of failure for Kerberos.",
    answer:
      "A, D, and E. Tickets keep the KDC largely stateless. The TGT is later presented to the TGS (part of the KDC) for service tickets. The KDC is a single point of failure. B is false (the password stays with Alice and a key derived from it lives at the KDC). C is false (Kerberos uses timestamps, which cuts message count).",
    pattern: "Kerberos: timestamps, TGT then service ticket, KDC is critical and kept mostly stateless.",
  },
  {
    id: "austin-3",
    deck: "Austin practice Exam 2",
    source: "Austin practice Exam 2",
    chapter: "IDS",
    prompt:
      "Select all true statements about intrusion detection systems (IDS).\nA. Anomaly-based IDS are unable to detect slight variants on known attacks.\nB. Provided that there are not too many signatures, signature-based IDS tend to be more efficient.\nC. IDS works by detecting \"unusual\" behavior.\nD. Signature-based IDS more easily provide details about specifics of an attack.\nE. Anomaly-based IDS are generally used to supplement signature-based IDS systems, rather than being used on their own.",
    answer:
      "B, D, and E. Signature systems are efficient with a modest rule set and can name the attack. Anomaly systems usually supplement signatures. A is backwards (signature systems struggle with slight variants; anomaly can still flag them). C describes anomaly detection, not IDS in general.",
    pattern: "Signature: fast and specific. Anomaly: unusual behavior, usually a supplement.",
  },
  {
    id: "austin-4",
    deck: "Austin practice Exam 2",
    source: "Austin practice Exam 2",
    chapter: "Web",
    prompt:
      "Select all true statements about web cookies.\nA. Web cookies provide a strong means of authentication.\nB. They are stored only in the user's web browser.\nC. Web cookies are closely related to IPSec cookies.\nD. Sites use cookies to \"remember\" a returning visitor.\nE. Cross-site request forgery can be prevented by the use of web cookies.",
    answer:
      "B and D. Cookies live in the browser and let a site recognize a return visit. They are not strong authentication by themselves, are unrelated to IPSec anti-DoS cookies, and are part of the CSRF problem rather than a complete CSRF fix.",
    pattern: "Cookies remember browsers. They are not strong auth and do not equal IPSec cookies.",
  },
  {
    id: "austin-5",
    deck: "Austin practice Exam 2",
    source: "Austin practice Exam 2",
    chapter: "Access control",
    prompt:
      "Compared to access control lists, capabilities (select all that are true):\nA. more easily handle delegation.\nB. are easier to implement.\nC. store permissions with the file.\nD. prevent the confused deputy attack.\nE. need a separate system for associating users to files.",
    answer:
      "A, D, and E. Capabilities delegate easily and block the classic confused deputy pattern. Permissions live with the subject, not the file (C is an ACL trait). Finding every subject that can touch one file usually needs extra machinery. ACLs are generally easier to implement in ordinary OS designs, so B is false.",
    pattern: "Capabilities: rows, delegation, anti confused-deputy. ACLs: columns, easier who-has-access.",
  },
  {
    id: "austin-6",
    deck: "Austin practice Exam 2",
    source: "Austin practice Exam 2",
    chapter: "Session keys",
    prompt:
      "R is sent in the clear from Alice to Bob. K is a symmetric key they share. Select all that may be used to establish a secure session key.\nA. h(R, K)\nB. h(K, R)\nC. E(R, K)\nD. E(K, R)\nE. R XOR K",
    answer:
      "A, B, and C. Both sides can compute a hash or E(R, K) without handing Trudy the long-term key. D is bad because R is public, so encrypting K under R is not a safe construction. E is bad because the session key is linearly tied to K: anyone who learns the session key and R recovers K.",
    pattern: "Derive with a hash or E(R, K). Do not encrypt K under public R, and avoid R XOR K.",
  },
  {
    id: "austin-7a",
    deck: "Austin practice Exam 2",
    source: "Austin practice Exam 2",
    chapter: "IPSec / SSL",
    prompt: "What are the primary advantages of IPSec over SSL?",
    answer:
      "IPSec sits at the network layer, so it can protect all IP traffic (not just one app), including UDP and other non-TCP flows, without changing applications. Once a host or gateway is set up, traffic is covered transparently.",
    pattern: "IPSec: network layer, transparent, protects everything on IP.",
  },
  {
    id: "austin-7b",
    deck: "Austin practice Exam 2",
    source: "Austin practice Exam 2",
    chapter: "IPSec / SSL",
    prompt: "What are the primary advantages of SSL over IPSec?",
    answer:
      "SSL lives above TCP in user space, so apps can adopt it without OS or kernel IPSec support. It is finer-grained (per application or session), often easier to deploy on the web, and historically plays nicer with NAT than early IPSec setups.",
    pattern: "SSL: app-level, no OS change required, per-session control.",
  },
  {
    id: "austin-8a",
    deck: "Austin practice Exam 2",
    source: "Austin practice Exam 2",
    chapter: "Definitions",
    prompt: "Define authorization.",
    answer:
      "Authorization decides what an authenticated principal is allowed to do: which resources and which rights.",
    pattern: "AuthN = who you are. AuthZ = what you may do.",
  },
  {
    id: "austin-8b",
    deck: "Austin practice Exam 2",
    source: "Austin practice Exam 2",
    chapter: "Definitions",
    prompt: "Define authentication.",
    answer:
      "Authentication verifies a claimed identity, for example with a password, token, certificate, or biometric.",
    pattern: "AuthN = who you are. AuthZ = what you may do.",
  },
  {
    id: "austin-8c",
    deck: "Austin practice Exam 2",
    source: "Austin practice Exam 2",
    chapter: "Definitions",
    prompt: "Define perfect forward secrecy.",
    answer:
      "Perfect forward secrecy means compromise of long-term keys does not expose past session keys. Each session key must be ephemeral and not recoverable from the long-term secret alone.",
    pattern: "PFS: old session keys stay safe even if the long-term key leaks later.",
  },
  {
    id: "austin-8d",
    deck: "Austin practice Exam 2",
    source: "Austin practice Exam 2",
    chapter: "Definitions",
    prompt: "Define confused deputy.",
    answer:
      "A confused deputy is a program with authority that is tricked into misusing that authority for an attacker, often because it acts on a resource name the attacker chose. Capabilities help because the authority is bound to the reference the deputy holds.",
    pattern: "Deputy has power, attacker aims it. Capabilities bind rights to the handle.",
  },
  {
    id: "austin-8e",
    deck: "Austin practice Exam 2",
    source: "Austin practice Exam 2",
    chapter: "Definitions",
    prompt: "Define two-factor authentication.",
    answer:
      "Two-factor authentication requires two different authentication factors, typically from something you know, something you have, and something you are (for example a password plus a phone OTP).",
    pattern: "2FA = two distinct factor types, not two passwords.",
  },
  {
    id: "austin-9a",
    deck: "Austin practice Exam 2",
    source: "Austin practice Exam 2",
    chapter: "Passwords",
    prompt:
      "Passwords are 18 characters with 128 choices each, stored as h(P, S) with salt S. What is the attacker's expected work to crack one specific password?\nA. 2^125\nB. 2^126\nC. 2^83\nD. 2^18\nE. 2^16",
    answer:
      "A. 2^125. There are 128^18 = (2^7)^18 = 2^126 candidates. Expected exhaustive work is about half of that, 2^125. The salt is known for that account, so it does not change the targeted search size.",
    pattern: "Expected work is about half the keyspace. Salt stops precomputation across users, not a targeted brute force.",
  },
  {
    id: "austin-9b",
    deck: "Austin practice Exam 2",
    source: "Austin practice Exam 2",
    chapter: "Passwords",
    prompt:
      "Same 18-character / 128-choice passwords, but stored as h(L, S1), h(R, S2) where L is the first 6 characters and R is the remaining 12. Expected work to crack one password?\nA. 2^125\nB. 2^126\nC. 2^83\nD. 2^18\nE. 2^16",
    answer:
      "C. 2^83. Crack the halves separately: 128^6 = 2^42 for L and 128^12 = 2^84 for R. Expected work is about 2^41 + 2^83, which is dominated by 2^83.",
    pattern: "Split hashes: total work is roughly the sum of the half searches, usually the longer half.",
  },
  {
    id: "austin-10a",
    deck: "Austin practice Exam 2",
    source: "Austin practice Exam 2",
    chapter: "Security models",
    prompt: "Compare and contrast Bell-LaPadula and Biba's model.",
    answer:
      "Bell-LaPadula protects confidentiality: simple security (no read up) and the *-property (no write down). Biba protects integrity and is roughly the opposite: no read down and no write up. Same lattice idea, different security goal.",
    pattern: "BLP: keep secrets from flowing down. Biba: keep integrity from flowing up.",
  },
  {
    id: "austin-10b",
    deck: "Austin practice Exam 2",
    source: "Austin practice Exam 2",
    chapter: "Security models",
    prompt: "Compare and contrast compartments and multilevel security.",
    answer:
      "Multilevel security uses hierarchical sensitivity levels (for example TS > S > C > U). Compartments are non-hierarchical categories; you need need-to-know for that category. Together, level plus compartments form a lattice for MAC decisions.",
    pattern: "Levels are ranked. Compartments are categories. Lattice = both.",
  },
  {
    id: "austin-11a",
    deck: "Austin practice Exam 2",
    source: "Austin practice Exam 2",
    chapter: "Biometrics",
    prompt:
      "Iris codes (hex): Alice BE43, Bob 9C8B, Charlie 8855. Recognition sample X = C975. Compute d(Alice, X), d(Bob, X), and d(Charlie, X) as the fraction of differing bits.",
    answer:
      "Use 16-bit Hamming distance over bit length.\nAlice XOR X differs in 10 bits: d = 10/16 = 0.625.\nBob XOR X differs in 11 bits: d = 11/16 = 0.6875.\nCharlie XOR X differs in 3 bits: d = 3/16 = 0.1875.",
    pattern: "Iris distance = differing bits / bit length.",
  },
  {
    id: "austin-11b",
    deck: "Austin practice Exam 2",
    source: "Austin practice Exam 2",
    chapter: "Biometrics",
    prompt:
      "With the iris distances from X = C975, and a match when d(x, y) < 0.32, which user matches?\nA. Alice\nB. Bob\nC. Charlie\nD. None of the above",
    answer:
      "C. Charlie. Only Charlie's distance 0.1875 is under 0.32. Alice (0.625) and Bob (0.6875) are far above the threshold.",
    pattern: "Match the smallest Hamming fraction against the threshold.",
  },
  {
    id: "austin-12",
    deck: "Austin practice Exam 2",
    source: "Austin practice Exam 2",
    chapter: "Protocols",
    prompt:
      "Shared key KAB. Msg1 Alice to Bob: \"I'm Alice\", R. Msg2 Bob to Alice: E(R, KAB). Msg3 Alice to Bob: E(R+1, KAB).\nSelect all true statements.\nA. Alice authenticates Bob.\nB. Bob authenticates Alice.\nC. Trudy could use a replay attack to authenticate as Alice.\nD. Trudy could use a replay attack to authenticate as Bob.\nE. This protocol provides perfect forward secrecy.",
    answer:
      "A, B, and C. (Inferred from the protocol shape; no official key.) Bob's E(R, KAB) authenticates Bob to Alice. Alice's E(R+1, KAB) authenticates Alice to Bob. Trudy can replay a full old transcript as Alice if Bob will accept a reused R. She cannot replay as Bob against a fresh R, because she cannot build a new E(R, KAB). There is no ephemeral session key design here, so no PFS.",
    pattern: "Encrypted nonce proves possession of KAB. Watch for full-session replay of Alice.",
  },
  {
    id: "austin-13",
    deck: "Austin practice Exam 2",
    source: "Austin practice Exam 2",
    chapter: "GSM",
    prompt:
      "GSM uses IMSI, RAND challenge, XRES/SRES response, and KC derived from Ki. Give a secure one-message protocol that prevents cell phone cloning and establishes a shared encryption key.",
    answer:
      "Inferred answer (no official key): have the phone use a public-key / tamper-resistant identity instead of only Ki.\nOne-message example: Mobile to home network: IMSI, {K, T}_HN, [IMSI, K, T]_Mobile\nwhere { }_HN is the home network public key and [ ]_Mobile is the phone's signature (private key in secure hardware). The network recovers session key K, checks the timestamp, and verifies the phone signature. Cloning a GSM Ki alone is not enough; the attacker needs the phone private key.",
    pattern: "Kill Ki-only cloning: bind a fresh K with asymmetric crypto and a phone private key.",
  },
  {
    id: "austin-14",
    deck: "Austin practice Exam 2",
    source: "Austin practice Exam 2",
    chapter: "WEP",
    prompt: "Describe some vulnerabilities in the wireless encryption protocol (WEP).",
    answer:
      "WEP's 24-bit IV is too short and repeats, so RC4 keystreams collide. Related-key / FMS attacks recover the key from enough IV traffic. CRC-32 is not cryptographic integrity, so bits can be flipped predictably. The same long-term key is reused. Authentication and key management are weak overall.",
    pattern: "Short IV + RC4 + CRC, not real integrity or key hygiene.",
  },
  {
    id: "austin-15",
    deck: "Austin practice Exam 2",
    source: "Austin practice Exam 2",
    chapter: "Extra credit",
    prompt:
      "Protocol with K = h(RA, RB, S).\nMsg1: \"I'm Alice\", [RA]_Alice\nMsg2: [RB]_Bob\nMsg3: {S}_Bob, E(RA, K)\nMsg4: E(RB, K)\nDoes this provide plausible deniability? If not, modify it so that it does.",
    answer:
      "No. (Inferred.) Signatures [RA]_Alice and [RB]_Bob are transferable proof that Alice and Bob took part, which is the opposite of plausible deniability.\nFix: drop signatures. For example replace Msg1/Msg2 with public-key encryptions of the nonces ({RA}_Bob and {RB}_Alice), or use a MAC under a shared key, so an outsider cannot prove who spoke. Keep the encrypted S and the E(R, K) checks for key confirmation.",
    pattern: "Signatures kill deniability. Prefer encryption or MACs if you need deniability.",
  },
];
