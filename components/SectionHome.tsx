"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { getCourse, type DeckDefinition } from "@/lib/decks";
import { getServerMemory, loadMemory, subscribeMemory } from "@/lib/storage";
import { StudyProgressBar } from "@/components/StudyProgressBar";
import { CONTENT_LIST } from "@/lib/content-layout";
import { deckStats } from "@/lib/scheduler";

const COLUMN = CONTENT_LIST;

function useDeckMemory(deckSlug: string) {
  return useSyncExternalStore(
    (cb) => subscribeMemory(deckSlug, cb),
    () => loadMemory(deckSlug),
    () => getServerMemory(deckSlug),
  );
}

function SectionRow({ section }: { section: DeckDefinition }) {
  const memory = useDeckMemory(section.slug);
  const stats = deckStats(section.questions, memory);

  return (
    <Link
      href={`/${section.slug}`}
      className="flex w-full flex-col items-start gap-2 rounded-lg border border-border bg-card p-4 text-left shadow-sm transition-colors hover:bg-muted/40"
    >
      <span className="flex items-center gap-2 font-mono text-xs text-stone-500">
        /{section.slug}
        {section.kind === "book" ? (
          <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Book
          </span>
        ) : null}
      </span>
      <h2 className="text-lg font-semibold text-stone-900">{section.title}</h2>
      <p className="text-sm leading-6 text-muted-foreground">{section.description}</p>
      <StudyProgressBar
        label={`${section.title} progress`}
        learned={stats.learned}
        total={stats.total}
        isLabelHidden
        style={{ width: "100%" }}
      />
      <p className="font-mono text-xs text-stone-500">
        {stats.seen} touched · {stats.total} cards
      </p>
    </Link>
  );
}

export function SectionHome({ courseSlug }: { courseSlug: string }) {
  const course = getCourse(courseSlug);
  if (!course) return null;

  return (
    <div className={COLUMN}>
      <Link href="/" className="font-mono text-xs text-stone-500 hover:text-stone-800">
        ← All classes
      </Link>
      <p className="font-mono text-xs tracking-wide text-stone-500 uppercase">homeRL</p>
      <h1 className="text-2xl font-semibold text-stone-900">{course.title}</h1>
      <p className="text-sm leading-6 text-muted-foreground">{course.description}</p>
      <div className="flex w-full flex-col gap-3">
        {course.sections.map((section) => (
          <SectionRow key={section.slug} section={section} />
        ))}
      </div>
    </div>
  );
}
