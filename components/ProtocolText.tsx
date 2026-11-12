"use client";

import katex from "katex";
import { splitProtocolNotation } from "@/lib/crypto-notation-latex";

import "katex/dist/katex.min.css";

type ProtocolTextProps = {
  text: string;
  className?: string;
  /** Render the text as-is, with no notation-to-math conversion. */
  plain?: boolean;
};

function renderLatex(latex: string, displayMode: boolean) {
  try {
    return katex.renderToString(latex, {
      throwOnError: false,
      displayMode,
      strict: "ignore",
    });
  } catch {
    return latex;
  }
}

const CODE_FENCE = /```\n?([\s\S]*?)\n?```/g;

/** Text wrapped in triple backticks is shown verbatim as a code block, with no notation conversion. */
export function ProtocolText({ text, className, plain = false }: ProtocolTextProps) {
  if (!text.includes("```")) return <NotationText text={text} className={className} plain={plain} />;
  const parts: { code: boolean; value: string }[] = [];
  let last = 0;
  for (const m of text.matchAll(CODE_FENCE)) {
    const start = m.index ?? 0;
    if (start > last) parts.push({ code: false, value: text.slice(last, start) });
    parts.push({ code: true, value: m[1] ?? "" });
    last = start + m[0].length;
  }
  if (last < text.length) parts.push({ code: false, value: text.slice(last) });
  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.code ? (
          <code
            key={i}
            className="my-2 block overflow-x-auto rounded-md border border-stone-200 bg-stone-50 p-3 font-mono text-[13px] leading-5 font-normal whitespace-pre text-stone-800"
          >
            {part.value}
          </code>
        ) : (
          <NotationText key={i} text={part.value} plain={plain} />
        ),
      )}
    </span>
  );
}

function NotationText({ text, className, plain = false }: ProtocolTextProps) {
  if (plain) return <span className={className}>{text}</span>;
  const segments = splitProtocolNotation(text);

  return (
    <span className={className}>
      {segments.map((seg, i) => {
        if (seg.kind === "text") {
          return <span key={i}>{seg.value}</span>;
        }
        if (seg.kind === "display") {
          return (
            <span
              key={i}
              className="protocol-math my-4 block overflow-x-auto text-left [&_.katex-display]:mx-0 [&_.katex-display]:my-0 [&_.katex]:text-[1.05em]"
              dangerouslySetInnerHTML={{ __html: renderLatex(seg.latex, true) }}
              aria-label={seg.latex}
            />
          );
        }
        return (
          <span
            key={i}
            className="protocol-math mx-0.5 inline-block align-baseline [&_.katex]:text-[1.05em]"
            dangerouslySetInnerHTML={{ __html: renderLatex(seg.latex, false) }}
            aria-label={seg.latex}
          />
        );
      })}
    </span>
  );
}
