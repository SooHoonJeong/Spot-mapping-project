"use client";

import { use, useEffect, useState } from "react";
import { PageShell } from "@/components/page-shell";
import {
  eventsService,
  type EventDetailResponse,
} from "@/features/events/services/eventsService";
import { EventDetailView } from "@/features/events/components/event-detail-view";
import type { BoundaryLayer } from "@/features/mypage/lib/location";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

// GET /api/events/{id}의 areas(평평한 배열, 각 항목에 geometry가 그대로 들어있음)를 지도 표시용
// BoundaryLayer[]로 바꾼다. Polygon은 닫는 좌표(첫 점 반복)를 제거하고, 좌표 순서를
// [lng,lat] → {lat,lng}로, shape는 대문자("AREA"/"LINE") → 소문자로 변환한다.
function areasToLayers(areas: EventDetailResponse["areas"]): BoundaryLayer[] {
  return areas.map((area) => {
    const isPolygon = area.geometry.type === "Polygon";
    const coordinates = isPolygon
      ? (area.geometry.coordinates as number[][][])[0].slice(0, -1)
      : (area.geometry.coordinates as number[][]);
    return {
      id: area.id,
      name: area.name,
      color: area.color,
      shape: area.shape.toLowerCase() as "area" | "line",
      groupId: area.areaGroupId,
      points: coordinates.map(([lng, lat]) => ({ lat, lng })),
    };
  });
}

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { t } = useTranslation();
  const [event, setEvent] = useState<EventDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    eventsService
      .getEventById(id)
      .then((data) => {
        if (!cancelled) setEvent(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <PageShell>
      {loading && (
        <p className="mx-auto w-full max-w-3xl px-4 py-16 text-center text-sm text-muted-foreground">
          {t("eventsBrowser.loading")}
        </p>
      )}
      {!loading && (error || !event) && (
        <p className="mx-auto w-full max-w-3xl px-4 py-16 text-center text-sm text-destructive">
          {t("eventsBrowser.errorState")}
        </p>
      )}
      {!loading && event && (
        <EventDetailView
          event={{
            title: event.title,
            descriptionHtml: event.description,
            tags: event.tags,
            startAt: event.startAt,
            region: event.region,
            address: event.location?.address ?? "",
            building: event.location?.building ?? "",
            detailAddress: event.location?.detailAddress ?? "",
            lat: event.location?.lat ?? null,
            lng: event.location?.lng ?? null,
            photos: event.photoUrls,
            layers: event.location ? areasToLayers(event.areas) : [],
            price: event.price,
            maxAttendees: event.maxAttendees,
          }}
        />
      )}
    </PageShell>
  );
}
