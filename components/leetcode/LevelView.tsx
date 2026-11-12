"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button-clean";
import { StudyProgressBar } from "@/components/StudyProgressBar";
import { CodeWorkspace } from "@/components/leetcode/CodeWorkspace";
import type { LcItem, LcLevelMeta } from "@/data/leetcode/types";
import {
  getServerLcProgress,
  loadLcProgress,
  markItemSolved,
  markStepSolved,
  resetLevelProgress,
  subscribeLcProgress,
} from "@/lib/leetcode-progress";

function useLcProgress() {
  return useSyncExternalStore(subscribeLcProgress, loadLcProgress, getServerLcProgress);
}

function selectedKey(slug: string) {
  return `homerl-leetcode-selected:${slug}`;
}

export function LevelView({ meta, items }: { meta: LcLevelMeta; items: LcItem[] }) {
  const progress = useLcProgress();
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<"whole" | "breakdown">("whole");
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const saved = Number(sessionStorage.getItem(selectedKey(meta.slug)));
    if (Number.isInteger(saved) && saved >= 0 && saved < items.length) setIndex(saved);
  }, [meta.slug, items.length]);

  const item = items[index];
  const solvedCount = items.filter((it) => progress.solved[it.id]).length;
  const steps = item?.breakdown ?? [];
  const totalSteps = steps.length + 1;
  const doneSteps = progress.steps[item?.id ?? ""] ?? [];

  function choose(next: number) {
    setIndex(next);
    setMode("whole");
    setStepIndex(0);
    sessionStorage.setItem(selectedKey(meta.slug), String(next));
  }

  function openBreakdown() {
    setMode("breakdown");
    const firstOpen = steps.findIndex((_, i) => !doneSteps.includes(i));
    setStepIndex(firstOpen < 0 ? steps.length : firstOpen);
  }

  function resetLevel() {
    if (!confirm(`Clear solved marks and saved code for every problem in ${meta.title}?`)) return;
    resetLevelProgress(items.map((it) => it.id));
  }

  if (!item) return null;

  const onFinalStep = mode === "breakdown" && stepIndex >= steps.length;
  const activeStep = mode === "breakdown" && !onFinalStep ? steps[stepIndex] : null;

  return (
    <div className="mx-auto grid w-full min-w-0 max-w-[64rem] grid-cols-1 items-start gap-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-8">
      <aside className="flex w-full flex-col gap-4 lg:sticky lg:top-4">
        <Link href="/leetcode" className="inline-flex min-h-11 items-center font-mono text-xs text-stone-500 hover:text-stone-800">
          ← leetcode levels
        </Link>
        <div className="flex flex-col gap-1">
          <p className="font-mono text-xs tracking-wide text-stone-500 uppercase">homeRL</p>
          <h1 className="text-xl font-semibold text-stone-900">{meta.title}</h1>
          <p className="text-sm leading-6 text-muted-foreground">{meta.description}</p>
        </div>
        <StudyProgressBar label="Solved" learned={solvedCount} total={items.length} style={{ width: "100%" }} />
        <nav aria-label="Problems in this level" className="flex flex-col gap-1">
          {items.map((it, i) => {
            const done = !!progress.solved[it.id];
            return (
              <button
                key={it.id}
                type="button"
                onClick={() => choose(i)}
                aria-current={i === index ? "true" : undefined}
                className={`flex w-full items-start gap-2 rounded-md px-2.5 py-2 text-left text-sm leading-5 transition-colors ${
                  i === index ? "bg-stone-900 text-white" : "text-stone-800 hover:bg-muted"
                }`}
              >
                <span className={`mt-0.5 w-5 shrink-0 font-mono text-xs ${i === index ? "text-stone-300" : "text-stone-500"}`}>{i + 1}</span>
                <span className="min-w-0 flex-1">{it.title}</span>
                {done ? (
                  <span className={`shrink-0 font-mono text-xs ${i === index ? "text-emerald-300" : "text-emerald-700"}`} aria-label="solved">
                    ✓
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
        <div>
          <Button type="button" size="sm" variant="secondary" onClick={resetLevel}>
            Reset this level
          </Button>
        </div>
      </aside>

      <section className="flex min-w-0 flex-col items-start gap-4">
        <p className="font-mono text-xs text-stone-500">
          Problem {index + 1} of {items.length} · {item.pattern}
          {progress.solved[item.id] ? " · solved" : ""}
        </p>
        <h2 className="text-2xl font-semibold text-stone-900">{item.title}</h2>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" variant={mode === "whole" ? "primary" : "secondary"} onClick={() => setMode("whole")}>
            Whole problem
          </Button>
          {steps.length > 0 ? (
            <Button type="button" size="sm" variant={mode === "breakdown" ? "primary" : "secondary"} onClick={openBreakdown}>
              Break down ({totalSteps} steps)
            </Button>
          ) : null}
          <div className="ml-auto flex gap-2">
            <Button type="button" size="sm" variant="ghost" onClick={() => choose((index - 1 + items.length) % items.length)}>
              Previous
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => choose((index + 1) % items.length)}>
              Next
            </Button>
          </div>
        </div>

        {mode === "breakdown" ? (
          <ol className="flex w-full flex-wrap gap-2" aria-label="Breakdown steps">
            {[...steps.map((s) => s.title), "Whole problem"].map((title, i) => {
              const done = i < steps.length ? doneSteps.includes(i) : !!progress.solved[item.id];
              const active = i === stepIndex;
              return (
                <li key={`${title}-${i}`}>
                  <button
                    type="button"
                    onClick={() => setStepIndex(i)}
                    className={`rounded-md border px-2.5 py-1.5 text-left text-xs leading-4 transition-colors ${
                      active ? "border-stone-900 bg-stone-900 text-white" : done ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-border bg-card text-stone-700 hover:bg-muted"
                    }`}
                  >
                    <span className="font-mono">Step {i + 1}</span> · {title}
                    {done ? " ✓" : ""}
                  </button>
                </li>
              );
            })}
          </ol>
        ) : null}

        {activeStep ? (
          <div className="flex w-full flex-col gap-3">
            <h3 className="text-base font-semibold text-stone-900">
              Step {stepIndex + 1} of {totalSteps}: {activeStep.title}
            </h3>
            <CodeWorkspace
              key={`${item.id}#${stepIndex}`}
              unit={activeStep}
              draftKey={`${item.id}#${stepIndex}`}
              solved={doneSteps.includes(stepIndex)}
              onSolved={() => markStepSolved(item.id, stepIndex)}
            />
            <div>
              <Button type="button" size="sm" variant="secondary" onClick={() => setStepIndex(stepIndex + 1)}>
                {stepIndex + 1 < steps.length ? "Next step" : "On to the whole problem"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex w-full flex-col gap-3">
            {onFinalStep ? (
              <h3 className="text-base font-semibold text-stone-900">
                Step {totalSteps} of {totalSteps}: the whole problem
              </h3>
            ) : null}
            <CodeWorkspace
              key={`${item.id}#full`}
              unit={item}
              draftKey={`${item.id}#full`}
              hints={item.hints}
              solved={!!progress.solved[item.id]}
              onSolved={() => markItemSolved(item.id)}
            />
          </div>
        )}
      </section>
    </div>
  );
}
