/** CS 166 style message notation to inline or display LaTeX. */

export type TextSegment =
  | { kind: "text"; value: string }
  | { kind: "math"; latex: string }
  | { kind: "display"; latex: string };

const KNOWN_NAMES = /^(Alice|Bob|Trudy)$/i;
const EXPLICIT_MATH = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;

function identToLatex(token: string): string {
  const t = token.trim();
  if (!t) return t;

  const quoted = t.match(/^["'](.+)["']$/);
  if (quoted) return `\\text{${quoted[1]}}`;

  const signed = t.match(/^\[([^\]]+)\]_?([A-Za-z][A-Za-z0-9]*)$/);
  if (signed) return `[${identToLatex(signed[1])}]_{\\mathit{${signed[2]}}}`;

  const encrypted = t.match(/^\{([^{}]+)\}_?([A-Za-z][A-Za-z0-9]*)$/);
  if (encrypted) {
    return `\\{${braceInnerToLatex(encrypted[1])}\\}_{\\mathit{${encrypted[2]}}}`;
  }

  if (/^K[A-Z]{2}$/.test(t)) return `K_{${t.slice(1)}}`;
  if (/^[RKTSh][A-Z]$/.test(t)) return `${t[0]}_{${t[1]}}`;
  if (KNOWN_NAMES.test(t)) return `\\mathit{${t}}`;
  if (/^[A-Za-z]\+1$/.test(t)) return `${t[0]}+1`;
  return t;
}

function braceInnerToLatex(inner: string): string {
  return inner.split(/,\s*/).map(identToLatex).join(", ");
}

function callToLatex(fn: string, inner: string): string {
  return `${fn}(${braceInnerToLatex(inner)})`;
}

export function protocolFragmentToLatex(prefix: string | undefined, brace: string, recipient: string): string {
  const body = `\\{${braceInnerToLatex(brace.slice(1, -1))}\\}_{\\mathit{${recipient}}}`;
  if (prefix) return `${identToLatex(prefix)}, ${body}`;
  return body;
}

const AUTO_MATH =
  /E\((?:[^()]|\([^()]*\))*\)|h\((?:[^()]|\([^()]*\))*\)|\{[^{}]+\}(?:_)?[A-Za-z][A-Za-z0-9]*|\[[^\[\]]+\](?:_)?[A-Za-z][A-Za-z0-9]*|\bK[A-Z]{2}\b|\b[RKTS][A-Z]\b|\d+\^\{-1\}|\d+\^{-1}/g;

function autoFragmentToLatex(fragment: string): string {
  const enc = fragment.match(/^E\((.*)\)$/);
  if (enc) return callToLatex("E", enc[1]);

  const hash = fragment.match(/^h\((.*)\)$/);
  if (hash) return callToLatex("h", hash[1]);

  const pub = fragment.match(/^\{([^{}]+)\}(?:_)?([A-Za-z][A-Za-z0-9]*)$/);
  if (pub) return protocolFragmentToLatex(undefined, `{${pub[1]}}`, pub[2]);

  const sig = fragment.match(/^\[([^\]]+)\](?:_)?([A-Za-z][A-Za-z0-9]*)$/);
  if (sig) return `[${identToLatex(sig[1])}]_{\\mathit{${sig[2]}}}`;

  return identToLatex(fragment);
}

function autoSplit(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let last = 0;
  for (const m of text.matchAll(AUTO_MATH)) {
    const start = m.index ?? 0;
    if (start > last) segments.push({ kind: "text", value: text.slice(last, start) });
    segments.push({ kind: "math", latex: autoFragmentToLatex(m[0]) });
    last = start + m[0].length;
  }
  if (last < text.length) segments.push({ kind: "text", value: text.slice(last) });
  return segments.length ? segments : [{ kind: "text", value: text }];
}

export function splitProtocolNotation(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let last = 0;
  for (const m of text.matchAll(EXPLICIT_MATH)) {
    const start = m.index ?? 0;
    if (start > last) segments.push(...autoSplit(text.slice(last, start)));
    if (m[1] != null) {
      segments.push({ kind: "display", latex: m[1].trim() });
    } else {
      segments.push({ kind: "math", latex: (m[2] ?? "").trim() });
    }
    last = start + m[0].length;
  }
  if (last < text.length) segments.push(...autoSplit(text.slice(last)));
  return segments.length ? segments : [{ kind: "text", value: text }];
}
