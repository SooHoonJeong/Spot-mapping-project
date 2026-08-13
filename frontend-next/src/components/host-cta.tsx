"use client";

import Link from "next/link";
import { useState } from "react";
import { Megaphone, MapPinned, TrendingUp, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import type { Locale } from "@/lib/i18n/translations";

export function HostCta() {
  const { t } = useTranslation();
  const perks = [
    {
      icon: MapPinned,
      title: t("hostCta.perk1Title"),
      description: t("hostCta.perk1Description"),
    },
    {
      icon: TrendingUp,
      title: t("hostCta.perk2Title"),
      description: t("hostCta.perk2Description"),
    },
    {
      icon: Megaphone,
      title: t("hostCta.perk3Title"),
      description: t("hostCta.perk3Description"),
    },
  ];

  return (
    <section id="host" className="mx-auto w-full max-w-7xl px-4 py-16 md:py-20">
      <div className="overflow-hidden rounded-3xl bg-primary px-6 py-12 text-primary-foreground md:px-12 md:py-16">
        <div className="max-w-2xl">
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
            {t("hostCta.title")}
          </h2>
          <p className="mt-3 text-pretty text-primary-foreground/85">
            {t("hostCta.description")}
          </p>
          <Button
            nativeButton={false}
            variant="secondary"
            className="mt-6 h-12 px-6 text-base"
            render={<Link href="/my-page" />}
          >
            {t("hostCta.createEvent")}
          </Button>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {perks.map((perk) => (
            <div
              key={perk.title}
              className="rounded-2xl bg-primary-foreground/10 p-5"
            >
              <perk.icon className="size-7" />
              <h3 className="mt-3 text-lg font-semibold">{perk.title}</h3>
              <p className="mt-1 text-sm text-primary-foreground/80">
                {perk.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const LOCALE_OPTIONS: { value: Locale; label: string }[] = [
  { value: "ko", label: "한국어" },
  { value: "en", label: "English" },
];

export function SiteFooter() {
  const { t, locale, setLocale } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-4 py-10 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          {t("footer.copyright", { year: new Date().getFullYear() })}
        </p>
        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              className="flex items-center gap-1.5 hover:text-foreground"
            >
              <Globe className="size-4" />
              {t("footer.language")}
            </button>
            {open && (
              <div className="absolute bottom-full left-0 z-10 mb-2 w-32 overflow-hidden rounded-lg border border-border bg-card shadow-md">
                {LOCALE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setLocale(option.value);
                      setOpen(false);
                    }}
                    className={cn(
                      "block w-full px-3 py-2 text-left text-sm hover:bg-secondary",
                      option.value === locale
                        ? "font-semibold text-primary"
                        : "text-foreground",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Link href="/events" className="hover:text-foreground">
            {t("nav.events")}
          </Link>
          <Link href="/map" className="hover:text-foreground">
            {t("nav.map")}
          </Link>
          <Link href="/community" className="hover:text-foreground">
            {t("nav.community")}
          </Link>
          <Link href="/my-page" className="hover:text-foreground">
            {t("nav.myPage")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
