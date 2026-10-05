"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import { useEvents } from "../lib/useEvents";
import { TagFilter } from "./tag-filter";
import { EventCard } from "./event-card";
import type { MapOrigin, MapView } from "./event-map";
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

  // 사용자가 지도를 옮기면 그때부터는 "지금 보이는 지도 영역"이 조회 기준이 된다(서버는 중심 좌표 +
  // 반경으로만 검색하므로, 화면을 덮는 원으로 가져온 뒤 화면 안의 것만 목록에 남긴다).
  const [view, setView] = useState<MapView | null>(null);

  const { events, loading, error } = useEvents(
    {
      tag: tag === "All" ? undefined : tag,
      ...(view
        ? {
            lat: Number(view.lat.toFixed(5)),
            lng: Number(view.lng.toFixed(5)),
            radius: Math.ceil(view.radiusKm * 10) / 10,
          }
        : {
            lat: origin?.lat,
            lng: origin?.lng,
            radius: origin ? NEARBY_RADIUS_KM : undefined,
          }),
      size: 100,
    },
    { enabled: locationStatus !== "locating" },
  );

  const visibleEvents = view
    ? events.filter(
        (e) =>
          e.latitude != null &&
          e.longitude != null &&
          e.latitude >= view.bounds.south &&
          e.latitude <= view.bounds.north &&
          e.longitude >= view.bounds.west &&
          e.longitude <= view.bounds.east,
      )
    : events;

  const availableTags = Array.from(new Set(visibleEvents.flatMap((e) => e.tags)));

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
          {view
            ? t("mapExplorer.eventsInView", { count: visibleEvents.length })
            : origin
              ? t("mapExplorer.eventsNearby", {
                  radius: NEARBY_RADIUS_KM,
                  count: visibleEvents.length,
                })
              : t("mapExplorer.eventsInArea", { count: visibleEvents.length })}
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
          {visibleEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              active={event.id === selectedId}
              onSelect={setSelectedId}
            />
          ))}
          {!loading && visibleEvents.length === 0 && (
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
            onViewChange={setView}
          />
        </div>
      </div>
    </section>
  );
}
