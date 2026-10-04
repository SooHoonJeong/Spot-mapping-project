"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import { useEvents } from "../lib/useEvents";
import { TagFilter } from "./tag-filter";
import { EventCard } from "./event-card";
import type { MapOrigin } from "./event-map";
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

const NEARBY_RADIUS_KM = 2;

export function MapExplorer() {
  const { t } = useTranslation();
  const [tag, setTag] = useState<string | "All">("All");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // 지도에 들어오면 현재 위치를 먼저 확인하고, 그 주변 NEARBY_RADIUS_KM 이내 이벤트만 불러온다.
  // 위치 권한이 없거나 가져오지 못하면 반경 없이 전체 이벤트를 보여준다.
  const [origin, setOrigin] = useState<MapOrigin | null>(null);
  const [locationStatus, setLocationStatus] = useState<"locating" | "ready" | "unavailable">(
    "locating",
  );

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("unavailable");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus("ready");
      },
      () => setLocationStatus("unavailable"),
      { timeout: 8000, maximumAge: 60000 },
    );
  }, []);

  const { events, totalElements, loading, error } = useEvents(
    {
      tag: tag === "All" ? undefined : tag,
      lat: origin?.lat,
      lng: origin?.lng,
      radius: origin ? NEARBY_RADIUS_KM : undefined,
      size: 100,
    },
    { enabled: locationStatus !== "locating" },
  );

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
          {origin
            ? t("mapExplorer.eventsNearby", { radius: NEARBY_RADIUS_KM, count: totalElements })
            : t("mapExplorer.eventsInArea", { count: totalElements })}
        </p>
      </div>

      {locationStatus === "locating" && (
        <p className="mt-3 text-xs text-muted-foreground">{t("mapExplorer.locating")}</p>
      )}
      {locationStatus === "unavailable" && (
        <p className="mt-3 text-xs text-muted-foreground">{t("mapExplorer.locationUnavailable")}</p>
      )}

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
            origin={origin}
            radiusKm={NEARBY_RADIUS_KM}
          />
        </div>
      </div>
    </section>
  );
}
