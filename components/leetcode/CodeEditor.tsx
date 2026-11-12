"use client";

import { useRef, type KeyboardEvent } from "react";

const INDENT = "    ";

type CodeEditorProps = {
  value: string;
  onChange: (next: string) => void;
  onRun?: () => void;
  onCheck?: () => void;
  label?: string;
};

/** A plain textarea tuned for Python: Tab indents 4 spaces, Shift+Tab dedents, Enter keeps indentation. */
export function CodeEditor({ value, onChange, onRun, onCheck, label = "Python code" }: CodeEditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const lines = value.split("\n").length;

  function replace(start: number, end: number, text: string, selStart: number, selEnd: number) {
    const el = ref.current;
    if (!el) return;
    const next = value.slice(0, start) + text + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.selectionStart = selStart;
      el.selectionEnd = selEnd;
    });
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    const el = event.currentTarget;
    const { selectionStart: start, selectionEnd: end } = el;

    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      if (event.shiftKey) onCheck?.();
      else onRun?.();
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const multiLine = value.slice(start, end).includes("\n");
      if (!event.shiftKey && !multiLine) {
        replace(start, end, INDENT, start + INDENT.length, start + INDENT.length);
        return;
      }
      const blockEnd = end;
      const block = value.slice(lineStart, blockEnd);
      const blockLines = block.split("\n");
      let firstDelta = 0;
      let total = 0;
      const changed = blockLines.map((line, i) => {
        if (event.shiftKey) {
          const strip = line.startsWith(INDENT) ? INDENT.length : line.length - line.trimStart().length > 0 ? Math.min(INDENT.length, line.length - line.trimStart().length) : 0;
          if (i === 0) firstDelta = -strip;
          total -= strip;
          return line.slice(strip);
        }
        if (i === 0) firstDelta = INDENT.length;
        total += INDENT.length;
        return INDENT + line;
      });
      const newStart = Math.max(lineStart, start + firstDelta);
      replace(lineStart, blockEnd, changed.join("\n"), multiLine ? newStart : newStart, end + total);
      return;
    }

    if (event.key === "Enter" && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const line = value.slice(lineStart, start);
      let indent = line.match(/^ */)?.[0] ?? "";
      if (line.trimEnd().endsWith(":")) indent += INDENT;
      const text = "\n" + indent;
      replace(start, end, text, start + text.length, start + text.length);
      return;
    }

    if (event.key === "Backspace" && start === end && start > 0) {
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const before = value.slice(lineStart, start);
      if (before.length > 0 && /^ +$/.test(before)) {
        event.preventDefault();
        const remove = before.length % INDENT.length || INDENT.length;
        replace(start - remove, start, "", start - remove, start - remove);
      }
    }
  }

  return (
    <textarea
      ref={ref}
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={onKeyDown}
      spellCheck={false}
      autoCapitalize="off"
      autoComplete="off"
      autoCorrect="off"
      wrap="off"
      rows={Math.min(Math.max(lines + 1, 8), 28)}
      className="w-full resize-y overflow-x-auto rounded-lg border border-border bg-stone-50 p-3 font-mono text-[13px] leading-5 text-stone-900 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-200"
      style={{ tabSize: 4 }}
    />
  );
}
