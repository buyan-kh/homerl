/** CS 166–style message notation → inline LaTeX (Stallings / lecture slides). */

const PROTOCOL_MSG =
  /(?:^|[\s:(])(?:([A-Za-z][A-Za-z0-9]*),\s*)?(\{[^}]+\})([A-Za-z][A-Za-z0-9]*)/g;

const KNOWN_NAMES = /^(Alice|Bob|Trudy)$/i;

function tokenToLatex(token: string): string {
  const t = token.trim();
  const signed = t.match(/^\[T\](\w+)$/);
  if (signed) return `[T]_{\\mathit{${signed[1]}}}`;
  if (KNOWN_NAMES.test(t)) return `\\mathit{${t}}`;
  return t;
}

function braceInnerToLatex(inner: string): string {
  return inner
    .split(/,\s*/)
    .map(tokenToLatex)
    .join(", ");
}

export function protocolFragmentToLatex(prefix: string | undefined, brace: string, recipient: string): string {
  const inner = brace.slice(1, -1);
  const body = `\\{${braceInnerToLatex(inner)}\\}_{\\mathit{${recipient}}}`;
  if (prefix) return `\\mathit{${prefix}}, ${body}`;
  return body;
}

export type TextSegment =
  | { kind: "text"; value: string }
  | { kind: "math"; latex: string };

export function splitProtocolNotation(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let last = 0;
  for (const m of text.matchAll(PROTOCOL_MSG)) {
    const start = m.index ?? 0;
    const lead = m[0].match(/^[\s:(]*/)?.[0]?.length ?? 0;
    const matchStart = start + lead;
    if (matchStart > last) {
      segments.push({ kind: "text", value: text.slice(last, matchStart) });
    }
    segments.push({
      kind: "math",
      latex: protocolFragmentToLatex(m[1], m[2], m[3]),
    });
    last = start + m[0].length;
  }
  if (last < text.length) {
    segments.push({ kind: "text", value: text.slice(last) });
  }
  return segments.length ? segments : [{ kind: "text", value: text }];
}
