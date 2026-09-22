"use client";

import Link from "next/link";
import { CalendarDays, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

export function Hero() {
  const { t } = useTranslation();
  const stats = [
    { value: "3.5k+", label: t("hero.statsEvents") },
    { value: "120+", label: t("hero.statsNeighborhoods") },
    { value: "48k", label: t("hero.statsAttendees") },
  ];

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/events/hero-crowd.png"
          alt="A lively outdoor community event at golden hour"
          className="h-full w-full object-cover"
          crossOrigin="anonymous"
        />
        <div className="absolute inset-0 bg-foreground/60" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-14 md:py-20">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">
            <MapPin className="size-4" />
            {t("hero.badge")}
          </span>
          <h1 className="mt-5 text-balance text-4xl font-bold leading-tight tracking-tight text-background md:text-6xl">
            {t("hero.title")}
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-lg text-background/85">
            {t("hero.description")}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              nativeButton={false}
              className="h-12 gap-2 px-6 text-base"
              render={<Link href="/map" />}
            >
              <Search className="size-5" />
              {t("hero.exploreMap")}
            </Button>
            <Button
              nativeButton={false}
              variant="secondary"
              className="h-12 gap-2 px-6 text-base"
              render={<Link href="/my-page" />}
            >
              <CalendarDays className="size-5" />
              {t("hero.promoteEvent")}
            </Button>
          </div>

          <dl className="mt-8 grid max-w-md grid-cols-3 gap-5">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-2xl font-bold text-background md:text-3xl">
                  {stat.value}
                </dt>
                <dd className="text-sm text-background/75">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
