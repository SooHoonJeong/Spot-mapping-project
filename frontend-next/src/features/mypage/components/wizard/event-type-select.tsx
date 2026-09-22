"use client";

import { CalendarCheck, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

export function EventTypeSelect({
  onSelect,
}: {
  onSelect: () => void;
}) {
  const { t } = useTranslation();

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        {t("mypage.create.typeSelect.heading")}
      </h1>
      <p className="mt-1 text-muted-foreground">
        {t("mypage.create.typeSelect.subheading")}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={onSelect}
          className={cn(
            "flex flex-col items-start gap-3 rounded-2xl border-2 border-primary bg-card p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
          )}
        >
          <CalendarCheck className="size-8 text-primary" />
          <h2 className="text-lg font-semibold">{t("mypage.create.typeSelect.simpleTitle")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("mypage.create.typeSelect.simpleDescription")}
          </p>
        </button>

        <div
          className="flex cursor-not-allowed flex-col items-start gap-3 rounded-2xl border border-dashed border-border bg-muted/40 p-6 text-left opacity-70"
          aria-disabled="true"
        >
          <div className="flex w-full items-center justify-between">
            <LayoutDashboard className="size-8 text-muted-foreground" />
            <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
              {t("mypage.create.typeSelect.comingSoon")}
            </span>
          </div>
          <h2 className="text-lg font-semibold text-muted-foreground">
            {t("mypage.create.typeSelect.fullTitle")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("mypage.create.typeSelect.fullDescription")}
          </p>
        </div>
      </div>
    </section>
  );
}
