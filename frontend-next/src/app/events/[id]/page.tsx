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

// GET /api/events/{id}의 areas(GeoJSON FeatureCollection)를 지도 표시용 BoundaryLayer[]로
// 되돌린다. Polygon은 닫는 좌표(첫 점 반복)를 다시 제거하고, 좌표 순서를 [lng,lat] → {lat,lng}로.
function featureCollectionToLayers(areas: EventDetailResponse["areas"]): BoundaryLayer[] {
  return areas.features.map((feature, index) => {
    const isPolygon = feature.geometry.type === "Polygon";
    const coordinates = isPolygon
      ? (feature.geometry.coordinates as number[][][])[0].slice(0, -1)
      : (feature.geometry.coordinates as number[][]);
    return {
      id: index,
      name: feature.properties.name,
      color: feature.properties.color,
      shape: feature.properties.shape,
      groupId: null,
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
            address: event.location.address,
            building: event.location.building,
            detailAddress: event.location.detailAddress,
            lat: event.location.lat,
            lng: event.location.lng,
            photos: event.photos,
            layers: featureCollectionToLayers(event.areas),
          }}
        />
      )}
    </PageShell>
  );
}
