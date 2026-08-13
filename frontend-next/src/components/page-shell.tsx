"use client";

import type { ReactNode } from "react";
import { SiteFooter } from "@/components/host-cta";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageHeading({
  pageKey,
}: {
  pageKey: "map" | "events" | "community" | "myPage" | "myPageCreate";
}) {
  const { t } = useTranslation();
  return (
    <div className="border-b border-border bg-secondary/40">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 md:py-16">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          {t(`pages.${pageKey}.eyebrow`)}
        </p>
        <h1 className="mt-2 text-balance text-3xl font-bold tracking-tight md:text-4xl">
          {t(`pages.${pageKey}.title`)}
        </h1>
        <p className="mt-3 max-w-2xl text-pretty text-muted-foreground">
          {t(`pages.${pageKey}.description`)}
        </p>
      </div>
    </div>
  );
}
