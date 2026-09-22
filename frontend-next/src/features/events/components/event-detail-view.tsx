"use client";

import dynamic from "next/dynamic";
import DOMPurify from "dompurify";
import { Calendar, MapPin, Tag } from "lucide-react";
import type { BoundaryLayer } from "@/features/mypage/lib/location";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

const EventStaticMap = dynamic(() => import("./event-static-map"), { ssr: false });

// Shared by the real /events/[id] page and the create-event wizard's preview step, so a host
// can trust that what they see while creating an event is what visitors will actually see.
export type EventDetailData = {
  title: string;
  descriptionHtml: string;
  tags: string[];
  startAt: string;
  region: string;
  address: string;
  building: string;
  detailAddress: string;
  lat: number;
  lng: number;
  photos: string[];
  layers: BoundaryLayer[];
};

export function EventDetailView({ event }: { event: EventDetailData }) {
  const { t } = useTranslation();
  const coverPhoto = event.photos[0];
  // Rich text from the event description editor is rendered as real HTML (so headings, bold
  // text and embedded photos actually show up) — DOMPurify strips anything that could execute
  // script before it ever reaches the DOM, since this page is public and other hosts' content
  // ends up here too.
  const safeDescription = DOMPurify.sanitize(event.descriptionHtml);

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10">
      {coverPhoto && (
        <div className="mb-6 aspect-video w-full overflow-hidden rounded-2xl border border-border bg-muted">
          <img src={coverPhoto} alt={event.title} className="size-full object-cover" />
        </div>
      )}

      <h1 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
        {event.title}
      </h1>

      {event.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {event.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground"
            >
              <Tag className="size-3" />
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-1.5 text-sm text-muted-foreground">
        {event.startAt && (
          <span className="flex items-center gap-2">
            <Calendar className="size-4 text-primary" />
            {event.startAt}
          </span>
        )}
        <span className="flex items-center gap-2">
          <MapPin className="size-4 text-primary" />
          {[event.building, event.detailAddress, event.address].filter(Boolean).join(" · ")}
        </span>
      </div>

      {safeDescription && (
        <div
          className="prose prose-sm mt-6 max-w-none text-foreground [&_img]:rounded-xl"
          dangerouslySetInnerHTML={{ __html: safeDescription }}
        />
      )}

      <div className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">
          {t("mypage.create.mapLabel")}
        </h2>
        <div className="mt-3 h-72 overflow-hidden rounded-2xl border border-border shadow-sm">
          <EventStaticMap center={{ lat: event.lat, lng: event.lng }} layers={event.layers} />
        </div>
      </div>

      {event.photos.length > 1 && (
        <div className="mt-8 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {event.photos.slice(1).map((url) => (
            <div key={url} className="aspect-square overflow-hidden rounded-xl border border-border bg-muted">
              <img src={url} alt={event.title} className="size-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
