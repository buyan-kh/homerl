"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button-clean";
import { CodeEditor } from "@/components/leetcode/CodeEditor";
import { PromptText } from "@/components/leetcode/PromptText";
import type { LcUnit } from "@/data/leetcode/types";
import { clearDraft, loadDraft, saveDraft } from "@/lib/leetcode-progress";
import {
  checkPython,
  isPythonLoaded,
  runPython,
  TimeoutError,
  type CheckResult,
  type RunResult,
} from "@/lib/leetcode-runner";

type Output =
  | { kind: "idle" }
  | { kind: "busy"; label: string }
  | { kind: "run"; result: RunResult }
  | { kind: "check"; result: CheckResult }
  | { kind: "error"; message: string };

type CodeWorkspaceProps = {
  unit: LcUnit;
  /** localStorage key for the draft, unique per problem or step. */
  draftKey: string;
  hints?: string[];
  solved: boolean;
  onSolved: () => void;
};

export function CodeWorkspace({ unit, draftKey, hints = [], solved, onSolved }: CodeWorkspaceProps) {
  const [code, setCode] = useState(unit.starter);
  const [output, setOutput] = useState<Output>({ kind: "idle" });
  const [hintsShown, setHintsShown] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setCode(loadDraft(draftKey) ?? unit.starter);
    setOutput({ kind: "idle" });
    setHintsShown(0);
    setShowSolution(false);
  }, [draftKey, unit.starter]);

  function updateCode(next: string) {
    setCode(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveDraft(draftKey, next), 400);
  }

  const busy = output.kind === "busy";

  function loadingLabel(action: string) {
    return isPythonLoaded() ? action : "Loading Python in your browser. The first run takes a few seconds...";
  }

  async function run() {
    if (busy) return;
    setOutput({ kind: "busy", label: loadingLabel("Running...") });
    try {
      const result = await runPython(code);
      setOutput({ kind: "run", result });
    } catch (err) {
      setOutput({ kind: "error", message: err instanceof TimeoutError ? err.message : `Could not run: ${(err as Error).message}` });
    }
  }

  async function check() {
    if (busy) return;
    setOutput({ kind: "busy", label: loadingLabel("Checking against the hidden tests...") });
    try {
      const result = await checkPython(code, unit);
      setOutput({ kind: "check", result });
      if (!result.fatal && result.results.length > 0 && result.results.every((r) => r.ok)) onSolved();
    } catch (err) {
      setOutput({ kind: "error", message: err instanceof TimeoutError ? err.message : `Could not check: ${(err as Error).message}` });
    }
  }

  function reset() {
    if (code !== unit.starter && !confirm("Reset the editor to the starter code? Your current code is lost.")) return;
    clearDraft(draftKey);
    setCode(unit.starter);
    setOutput({ kind: "idle" });
  }

  function revealSolution() {
    if (showSolution) {
      setShowSolution(false);
      return;
    }
    if (!confirm("Show the reference solution? Try a hint first if you have not.")) return;
    setShowSolution(true);
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <PromptText text={unit.prompt} />

      <CodeEditor value={code} onChange={updateCode} onRun={run} onCheck={check} />

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" onClick={check} disabled={busy}>
          Check
        </Button>
        <Button type="button" variant="secondary" onClick={run} disabled={busy}>
          Run
        </Button>
        <Button type="button" variant="secondary" onClick={reset} disabled={busy}>
          Reset
        </Button>
        {hints.length > 0 ? (
          <Button
            type="button"
            variant="secondary"
            onClick={() => setHintsShown((n) => Math.min(n + 1, hints.length))}
            disabled={hintsShown >= hints.length}
          >
            {hintsShown === 0 ? "Hint" : hintsShown >= hints.length ? "No more hints" : `Hint ${hintsShown + 1} of ${hints.length}`}
          </Button>
        ) : null}
        <Button type="button" variant="ghost" onClick={revealSolution}>
          {showSolution ? "Hide solution" : "Show solution"}
        </Button>
        {solved ? (
          <span className="rounded-sm bg-emerald-50 px-2 py-0.5 font-mono text-xs text-emerald-700">Solved</span>
        ) : null}
      </div>
      <p className="font-mono text-xs text-stone-500">
        Cmd or Ctrl+Enter runs. Add Shift to check. Run shows print output; Check grades against hidden tests.
      </p>

      {hintsShown > 0 ? (
        <ol className="flex w-full list-decimal flex-col gap-1 rounded-lg border border-amber-200 bg-amber-50 py-3 pr-4 pl-8 text-sm leading-6 text-amber-900">
          {hints.slice(0, hintsShown).map((hint) => (
            <li key={hint}>{hint}</li>
          ))}
        </ol>
      ) : null}

      <OutputPanel output={output} />

      {showSolution ? (
        <div className="flex w-full flex-col gap-2">
          <p className="font-mono text-xs tracking-wide text-stone-500 uppercase">Reference solution</p>
          <pre className="w-full overflow-x-auto rounded-lg border border-stone-200 bg-white p-3 font-mono text-[13px] leading-5 text-stone-800">
            {unit.solution}
          </pre>
          <div>
            <Button type="button" size="sm" variant="secondary" onClick={() => updateCode(unit.solution)}>
              Copy into editor
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function OutputPanel({ output }: { output: Output }) {
  if (output.kind === "idle") return null;
  if (output.kind === "busy") {
    return (
      <div className="w-full rounded-lg border border-border bg-card p-3 font-mono text-xs text-stone-600" role="status">
        {output.label}
      </div>
    );
  }
  if (output.kind === "error") {
    return (
      <pre className="w-full overflow-x-auto rounded-lg border border-red-200 bg-red-50 p-3 font-mono text-xs leading-5 whitespace-pre-wrap text-red-800" role="alert">
        {output.message}
      </pre>
    );
  }
  if (output.kind === "run") {
    const { stdout, error } = output.result;
    return (
      <div className="flex w-full flex-col gap-2">
        <p className="font-mono text-xs tracking-wide text-stone-500 uppercase">Output</p>
        <pre className="w-full overflow-x-auto rounded-lg border border-border bg-stone-950 p-3 font-mono text-xs leading-5 whitespace-pre-wrap text-stone-100">
          {stdout || (error ? "" : "(no output: add print(...) to see values)")}
          {error ? <span className="text-red-300">{(stdout ? "\n" : "") + error}</span> : null}
        </pre>
      </div>
    );
  }
  const { fatal, stdout, results } = output.result;
  const passed = results.filter((r) => r.ok).length;
  const allOk = !fatal && results.length > 0 && passed === results.length;
  return (
    <div className="flex w-full flex-col gap-2" role="status">
      <p className={`text-sm font-semibold ${allOk ? "text-emerald-700" : "text-red-700"}`}>
        {fatal ? "Your code did not load" : allOk ? `All ${results.length} tests passed` : `${passed} of ${results.length} tests passed`}
      </p>
      {fatal ? (
        <pre className="w-full overflow-x-auto rounded-lg border border-red-200 bg-red-50 p-3 font-mono text-xs leading-5 whitespace-pre-wrap text-red-800">
          {fatal}
        </pre>
      ) : null}
      <ul className="flex w-full flex-col gap-1.5">
        {results.map((r, i) => (
          <li
            key={i}
            className={`w-full overflow-x-auto rounded-md border px-3 py-2 font-mono text-xs leading-5 ${
              r.ok ? "border-emerald-200 bg-emerald-50/60 text-emerald-900" : "border-red-200 bg-red-50 text-red-900"
            }`}
          >
            <div className="font-semibold">
              {r.ok ? "Pass" : "Fail"} · test {i + 1}
            </div>
            <div className="whitespace-pre-wrap break-all">input: {r.input}</div>
            <div className="whitespace-pre-wrap break-all">expected: {r.expected}</div>
            {!r.ok ? <div className="whitespace-pre-wrap break-all">got: {r.got}</div> : null}
          </li>
        ))}
      </ul>
      {stdout ? (
        <>
          <p className="font-mono text-xs tracking-wide text-stone-500 uppercase">Printed while testing</p>
          <pre className="max-h-48 w-full overflow-auto rounded-lg border border-border bg-stone-950 p-3 font-mono text-xs leading-5 whitespace-pre-wrap text-stone-100">
            {stdout}
          </pre>
        </>
      ) : null}
    </div>
  );
}
