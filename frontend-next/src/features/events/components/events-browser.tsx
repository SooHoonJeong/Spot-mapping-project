"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Globe2, LocateFixed, MapPin, Plus, Search, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInfiniteEvents } from "../lib/useEvents";
import { formatStartAt, htmlToPlainText } from "../lib/format";
import { TagFilter } from "./tag-filter";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

const PAGE_SIZE = 21;

export function EventsBrowser() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [regionQuery, setRegionQuery] = useState("");
  const [debouncedRegion, setDebouncedRegion] = useState("");
  const [tag, setTag] = useState<string | "All">("All");
  const [nearby, setNearby] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(id);
  }, [query]);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedRegion(regionQuery.trim()), 300);
    return () => clearTimeout(id);
  }, [regionQuery]);

  function toggleNearby() {
    if (nearby) {
      setNearby(null);
      return;
    }
    if (!navigator.geolocation) {
      setLocateError(true);
      return;
    }
    setLocating(true);
    setLocateError(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setNearby({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocateError(true);
        setLocating(false);
      },
    );
  }

  const { events, totalElements, hasNext, loading, error, loadMore } = useInfiniteEvents({
    keyword: debouncedQuery || undefined,
    tag: tag === "All" ? undefined : tag,
    region: debouncedRegion || undefined,
    lat: nearby?.lat,
    lng: nearby?.lng,
    size: PAGE_SIZE,
  });

  const availableTags = Array.from(new Set(events.flatMap((e) => e.tags)));

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("eventsBrowser.searchPlaceholder")}
              className="h-11 w-full rounded-full border border-border bg-card pl-9 pr-4 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="relative w-full sm:max-w-[200px]">
            <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={regionQuery}
              onChange={(e) => setRegionQuery(e.target.value)}
              placeholder={t("eventsBrowser.regionPlaceholder")}
              className="h-11 w-full rounded-full border border-border bg-card pl-9 pr-4 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <Button
            type="button"
            variant={nearby ? "default" : "outline"}
            onClick={toggleNearby}
            disabled={locating}
            className="gap-1.5 rounded-full"
          >
            <LocateFixed className="size-4" />
            {t("eventsBrowser.nearby")}
          </Button>
        </div>
        <Button
          className="gap-2 sm:shrink-0"
          nativeButton={false}
          render={<Link href="/my-page/create" />}
        >
          <Plus className="size-4" />
          {t("myPage.createEvent")}
        </Button>
      </div>

      {locateError && (
        <p className="mt-2 text-xs text-destructive">{t("eventsBrowser.locateError")}</p>
      )}

      <div className="mt-5">
        <TagFilter tags={availableTags} selected={tag} onChange={setTag} />
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        {loading && events.length === 0
          ? t("eventsBrowser.loading")
          : t(
              totalElements === 1
                ? "eventsBrowser.resultsCount_one"
                : "eventsBrowser.resultsCount_other",
              { count: totalElements },
            )}
      </p>

      {error && (
        <p className="mt-4 rounded-2xl border border-dashed border-destructive/40 p-6 text-center text-sm text-destructive">
          {t("eventsBrowser.errorState")}
        </p>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {events.map((event) => {
          const isOnline = event.latitude == null || event.longitude == null;
          return (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <h3 className="text-base font-semibold text-card-foreground">{event.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {htmlToPlainText(event.description)}
              </p>
              <div className="mt-3 flex flex-col gap-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-primary" />
                  {formatStartAt(event.startAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  {isOnline ? (
                    <Globe2 className="size-3.5 text-primary" />
                  ) : (
                    <MapPin className="size-3.5 text-primary" />
                  )}
                  {event.region}
                </span>
              </div>
              {event.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {event.tags.map((eventTag) => (
                    <span
                      key={eventTag}
                      className="flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground"
                    >
                      <Tag className="size-3" />
                      {eventTag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {!loading && !error && events.length === 0 && (
        <p className="mt-10 rounded-2xl border border-dashed p-12 text-center text-sm text-muted-foreground">
          {t("eventsBrowser.emptyState")}
        </p>
      )}

      {hasNext && (
        <div className="mt-8 flex justify-center">
          <Button type="button" variant="outline" onClick={loadMore} disabled={loading}>
            {loading ? t("eventsBrowser.loading") : t("eventsBrowser.loadMore")}
          </Button>
        </div>
      )}
    </section>
  );
}
