/** Prompt text: prose paragraphs, with 4-space indented lines (signature, examples) shown as code. */
export function PromptText({ text }: { text: string }) {
  const blocks: { code: boolean; lines: string[] }[] = [];
  for (const line of text.split("\n")) {
    const code = line.startsWith("    ");
    const last = blocks[blocks.length - 1];
    if (last && last.code === code && (code || line.trim() !== "")) {
      last.lines.push(code ? line.slice(4) : line);
    } else if (line.trim() === "" && !code) {
      blocks.push({ code: false, lines: [] });
    } else {
      blocks.push({ code, lines: [code ? line.slice(4) : line] });
    }
  }
  return (
    <div className="flex w-full flex-col gap-3">
      {blocks
        .filter((b) => b.lines.length > 0)
        .map((b, i) =>
          b.code ? (
            <pre
              key={i}
              className="w-full overflow-x-auto rounded-md border border-stone-200 bg-stone-50 px-3 py-2 font-mono text-[13px] leading-5 text-stone-800"
            >
              {b.lines.join("\n")}
            </pre>
          ) : (
            <p key={i} className="text-[15px] leading-7 whitespace-pre-wrap text-stone-800">
              {b.lines.join("\n")}
            </p>
          ),
        )}
    </div>
  );
}
