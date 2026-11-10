"use client";

import katex from "katex";
import { splitProtocolNotation } from "@/lib/crypto-notation-latex";

import "katex/dist/katex.min.css";

type ProtocolTextProps = {
  text: string;
  className?: string;
};

function renderLatex(latex: string) {
  try {
    return katex.renderToString(latex, {
      throwOnError: false,
      displayMode: false,
      strict: "ignore",
    });
  } catch {
    return latex;
  }
}

export function ProtocolText({ text, className }: ProtocolTextProps) {
  const segments = splitProtocolNotation(text);

  return (
    <span className={className}>
      {segments.map((seg, i) =>
        seg.kind === "text" ? (
          <span key={i}>{seg.value}</span>
        ) : (
          <span
            key={i}
            className="protocol-math mx-0.5 align-baseline [&_.katex]:text-[1.05em]"
            dangerouslySetInnerHTML={{ __html: renderLatex(seg.latex) }}
            aria-label={seg.latex}
          />
        ),
      )}
    </span>
  );
}
