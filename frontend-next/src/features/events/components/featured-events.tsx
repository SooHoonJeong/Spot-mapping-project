"use client";

import Link from "next/link";
import { ArrowRight, Calendar, MapPin } from "lucide-react";
import { useEvents } from "../lib/useEvents";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

export function FeaturedEvents() {
  const { t } = useTranslation();
  const { events, loading, error } = useEvents({ size: 3 });

  return (
    <section id="featured" className="border-t border-border bg-secondary/40">
      <div className="mx-auto w-full max-w-7xl px-4 py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              {t("featuredEvents.eyebrow")}
            </p>
            <h2 className="mt-1 text-balance text-3xl font-bold tracking-tight md:text-4xl">
              {t("featuredEvents.title")}
            </h2>
          </div>
          <Link
            href="/events"
            className="hidden items-center gap-1.5 text-sm font-semibold text-primary hover:underline sm:flex"
          >
            {t("featuredEvents.seeAll")}
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {loading && (
          <p className="mt-8 text-sm text-muted-foreground">{t("featuredEvents.loading")}</p>
        )}
        {error && (
          <p className="mt-8 text-sm text-destructive">{t("featuredEvents.errorState")}</p>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="group overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <h3 className="text-base font-semibold text-card-foreground">
                  {event.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {event.description}
                </p>
                <div className="mt-3 flex flex-col gap-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Calendar className="size-4 text-primary" />
                    {event.startDate}
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin className="size-4 text-primary" />
                    {event.region}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
