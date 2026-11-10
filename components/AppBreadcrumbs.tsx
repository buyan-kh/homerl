"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { BreadcrumbItem, Breadcrumbs } from "@astryxdesign/core/Breadcrumbs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getCourse, getDeck } from "@/lib/decks";

type Crumb = {
  key: string;
  label: string;
  href?: string;
};

function crumbsForPath(pathname: string): Crumb[] {
  const trimmed = pathname.replace(/\/$/, "") || "/";
  if (trimmed === "/") return [];

  const slug = trimmed.replace(/^\//, "");
  const deck = getDeck(slug);
  if (deck) {
    const course = getCourse(deck.courseSlug);
    const trail: Crumb[] = [{ key: "home", label: "All classes", href: "/" }];
    if (course) {
      trail.push({ key: course.slug, label: course.title, href: `/${course.slug}` });
    }
    trail.push({ key: deck.slug, label: deck.title });
    return trail;
  }

  const course = getCourse(slug);
  if (course) {
    return [
      { key: "home", label: "All classes", href: "/" },
      { key: course.slug, label: course.title },
    ];
  }

  const segments = slug.split("/").filter(Boolean);
  if (segments.length === 0) return [];
  let path = "";
  return segments.map((segment, index) => {
    path += `/${segment}`;
    const label = segment.replace(/-/g, " ");
    const isLast = index === segments.length - 1;
    return {
      key: path,
      label: label.charAt(0).toUpperCase() + label.slice(1),
      href: isLast ? undefined : path,
    };
  });
}

export function AppBreadcrumbs() {
  const pathname = usePathname();
  const crumbs = useMemo(() => crumbsForPath(pathname), [pathname]);

  if (crumbs.length < 2) {
    return (
      <header className="flex min-h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-2 pt-[env(safe-area-inset-top)] md:hidden">
        <SidebarTrigger className="size-11! shrink-0" />
        <p className="truncate text-sm font-medium">homeRL</p>
      </header>
    );
  }

  return (
    <header className="flex min-h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-2 pt-[env(safe-area-inset-top)] sm:px-4">
      <SidebarTrigger className="size-11! shrink-0 md:hidden" />
      <div className="min-w-0 flex-1 overflow-x-auto">
        <Breadcrumbs variant="supporting" label="Study location" className="w-max flex-nowrap">
          {crumbs.map((crumb, index) => (
          <BreadcrumbItem
            key={crumb.key}
            href={crumb.href}
            isCurrent={index === crumbs.length - 1}
            className="[&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center"
          >
              {crumb.label}
            </BreadcrumbItem>
          ))}
        </Breadcrumbs>
      </div>
    </header>
  );
}
