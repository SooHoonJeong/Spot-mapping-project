"use client";

import Link from "next/link";
import { ArrowRight, Calendar, MapPin } from "lucide-react";
import { EVENTS } from "../lib/events";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

export function FeaturedEvents() {
  const { t } = useTranslation();
  const featured = EVENTS.slice(0, 3);
  return (
    <section id="featured" className="border-t border-border bg-secondary/40">
      <div className="mx-auto w-full max-w-7xl px-4 py-16">
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

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {featured.map((event) => (
            <Link
              key={event.id}
              href="/events"
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={event.image || "/placeholder.svg"}
                  alt={event.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  crossOrigin="anonymous"
                />
                <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
                  {t(`categories.${event.category}`)}
                </span>
                <span className="absolute right-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-bold text-foreground">
                  {event.price}
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-card-foreground">
                  {event.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {event.description}
                </p>
                <div className="mt-4 flex flex-col gap-1.5 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Calendar className="size-4 text-primary" />
                    {event.date} · {event.time}
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin className="size-4 text-primary" />
                    {event.venue}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
