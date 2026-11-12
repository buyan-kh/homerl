"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { StudyProgressBar } from "@/components/StudyProgressBar";
import { CONTENT_LIST } from "@/lib/content-layout";
import { getCourse } from "@/lib/decks";
import { LEETCODE_LEVELS } from "@/data/leetcode/meta";
import { getServerLcProgress, loadLcProgress, subscribeLcProgress } from "@/lib/leetcode-progress";

export function LeetCodeHome() {
  const progress = useSyncExternalStore(subscribeLcProgress, loadLcProgress, getServerLcProgress);
  const course = getCourse("leetcode");

  return (
    <div className={CONTENT_LIST}>
      <Link href="/" className="inline-flex min-h-11 items-center font-mono text-xs text-stone-500 hover:text-stone-800">
        ← All classes
      </Link>
      <p className="font-mono text-xs tracking-wide text-stone-500 uppercase">homeRL</p>
      <h1 className="text-2xl font-semibold text-stone-900">{course?.title ?? "LeetCode"}</h1>
      <p className="text-sm leading-6 text-muted-foreground">{course?.description}</p>
      <div className="flex w-full flex-col gap-3">
        {LEETCODE_LEVELS.map((level) => {
          const solved = level.items.filter((it) => progress.solved[it.id]).length;
          const withSteps = level.items.filter((it) => it.steps > 0).length;
          return (
            <Link
              key={level.slug}
              href={`/leetcode/${level.slug}`}
              className="flex w-full flex-col items-start gap-2 rounded-lg border border-border bg-card p-4 text-left shadow-sm transition-colors hover:bg-muted/40"
            >
              <span className="flex items-center gap-2 font-mono text-xs text-stone-500">
                /leetcode/{level.slug}
                {withSteps > 0 ? (
                  <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Break down
                  </span>
                ) : null}
              </span>
              <h2 className="text-lg font-semibold text-stone-900">{level.title}</h2>
              <p className="text-sm leading-6 text-muted-foreground">{level.description}</p>
              <StudyProgressBar label={`${level.title} solved`} learned={solved} total={level.items.length} isLabelHidden style={{ width: "100%" }} />
              <p className="font-mono text-xs text-stone-500">
                {solved} of {level.items.length} solved
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
