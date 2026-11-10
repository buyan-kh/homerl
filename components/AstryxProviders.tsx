"use client";

import Link from "next/link";
import { LinkProvider } from "@astryxdesign/core/Link";
import { Theme } from "@astryxdesign/core/theme";
import type { ComponentProps } from "react";
import { defaultThemeSlug, themes } from "@/astryx-themes";

function AstryxLink({
  href,
  to,
  children,
  ...rest
}: ComponentProps<typeof Link> & { to?: string }) {
  const destination = href ?? to ?? "/";
  return (
    <Link href={destination} {...rest}>
      {children}
    </Link>
  );
}

export function AstryxProviders({ children }: { children: React.ReactNode }) {
  return (
    <Theme theme={themes[defaultThemeSlug]} mode="light">
      <LinkProvider component={AstryxLink}>{children}</LinkProvider>
    </Theme>
  );
}
