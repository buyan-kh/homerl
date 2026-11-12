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

export function ProtocolText({ text, className, plain = false }: ProtocolTextProps) {
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
