"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import { useEvents } from "../lib/useEvents";
import { TagFilter } from "./tag-filter";
import { EventCard } from "./event-card";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

function MapLoadingFallback() {
  const { t } = useTranslation();
  return (
    <div className="flex h-full w-full items-center justify-center bg-muted">
      <span className="text-sm text-muted-foreground">{t("mapExplorer.loadingMap")}</span>
    </div>
  );
}

const EventMap = dynamic(() => import("./event-map"), {
  ssr: false,
  loading: MapLoadingFallback,
});

export function MapExplorer() {
  const { t } = useTranslation();
  const [tag, setTag] = useState<string | "All">("All");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { events, totalElements, loading, error } = useEvents({
    tag: tag === "All" ? undefined : tag,
    size: 100,
  });

  const availableTags = Array.from(new Set(events.flatMap((e) => e.tags)));

  return (
    <section id="explore" className="mx-auto w-full max-w-7xl px-4 py-8 md:py-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
            {t("mapExplorer.title")}
          </h2>
          <p className="mt-2 max-w-xl text-pretty text-muted-foreground">
            {t("mapExplorer.description")}
          </p>
        </div>
        <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <MapPin className="size-4 text-primary" />
          {t("mapExplorer.eventsInArea", { count: totalElements })}
        </p>
      </div>

      <div className="mt-6">
        <TagFilter tags={availableTags} selected={tag} onChange={setTag} />
      </div>

      {error && (
        <p className="mt-4 rounded-2xl border border-dashed border-destructive/40 p-6 text-center text-sm text-destructive">
          {t("mapExplorer.errorState")}
        </p>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <div className="order-2 flex max-h-[640px] flex-col gap-3 overflow-y-auto pr-1 lg:order-1">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              active={event.id === selectedId}
              onSelect={setSelectedId}
            />
          ))}
          {!loading && events.length === 0 && (
            <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              {t("mapExplorer.emptyState")}
            </p>
          )}
        </div>

        <div className="order-1 h-[420px] overflow-hidden rounded-2xl border shadow-sm lg:order-2 lg:sticky lg:top-20 lg:h-[640px]">
          <EventMap
            events={events}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
      </div>
    </section>
  );
}
