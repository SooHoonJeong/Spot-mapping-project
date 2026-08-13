"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Calendar, Clock, MapPin, Search, Users, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { EVENTS, type EventCategory, type EventFormat } from "../lib/events";
import { CategoryFilter } from "./category-filter";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

const FORMATS: (EventFormat | "All")[] = ["All", "In person", "Online"];

export function EventsBrowser() {
  const { t } = useTranslation();
  const [category, setCategory] = useState<EventCategory | "All">("All");
  const [format, setFormat] = useState<EventFormat | "All">("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return EVENTS.filter((event) => {
      const matchesCategory =
        category === "All" || event.category === category;
      const matchesFormat = format === "All" || event.format === format;
      const matchesQuery =
        query.trim() === "" ||
        `${event.title} ${event.venue} ${event.description}`
          .toLowerCase()
          .includes(query.toLowerCase());
      return matchesCategory && matchesFormat && matchesQuery;
    });
  }, [category, format, query]);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10">
      {/* Search + format toggle */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("eventsBrowser.searchPlaceholder")}
            className="h-11 w-full rounded-full border border-border bg-card pl-9 pr-4 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex gap-2">
          {FORMATS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFormat(f)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                f === format
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground",
              )}
            >
              {t(`formats.${f}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <CategoryFilter selected={category} onChange={setCategory} />
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        {t(
          filtered.length === 1
            ? "eventsBrowser.resultsCount_one"
            : "eventsBrowser.resultsCount_other",
          { count: filtered.length },
        )}
      </p>

      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((event) => (
          <Link
            key={event.id}
            href="/map"
            className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative h-44 overflow-hidden">
              <img
                src={event.image || "/placeholder.svg"}
                alt={event.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                crossOrigin="anonymous"
              />
              <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
                {t(`categories.${event.category}`)}
              </span>
              <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold text-foreground">
                {event.format === "Online" ? (
                  <Video className="size-3" />
                ) : (
                  <MapPin className="size-3" />
                )}
                {t(`formats.${event.format}`)}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-semibold text-card-foreground">
                  {event.title}
                </h3>
                <span className="shrink-0 text-sm font-bold text-primary">
                  {event.price}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {event.description}
              </p>
              <div className="mt-4 flex flex-col gap-1.5 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Calendar className="size-4 text-primary" />
                  {event.date}
                  <Clock className="ml-1 size-4 text-primary" />
                  {event.time}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="size-4 text-primary" />
                  {event.venue}
                </span>
                <span className="flex items-center gap-2">
                  <Users className="size-4 text-primary" />
                  {event.attendees.toLocaleString()}
                  {t("eventsBrowser.going")}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-10 rounded-2xl border border-dashed p-12 text-center text-sm text-muted-foreground">
          {t("eventsBrowser.emptyState")}
        </p>
      )}
    </section>
  );
}
