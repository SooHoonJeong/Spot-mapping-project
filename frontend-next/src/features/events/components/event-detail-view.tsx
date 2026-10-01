"use client";

import dynamic from "next/dynamic";
import DOMPurify from "dompurify";
import { Calendar, Globe2, MapPin, Tag, Users, Wallet } from "lucide-react";
import type { BoundaryLayer } from "@/features/mypage/lib/location";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

const EventStaticMap = dynamic(() => import("./event-static-map"), { ssr: false });

// Shared by the real /events/[id] page and the create-event wizard's preview step, so a host
// can trust that what they see while creating an event is what visitors will actually see.
// lat/lng/layers are null/empty for an ONLINE event, which has no location.
export type EventDetailData = {
  title: string;
  descriptionHtml: string;
  tags: string[];
  startAt: string;
  region: string;
  address: string;
  building: string;
  detailAddress: string;
  lat: number | null;
  lng: number | null;
  photos: string[];
  layers: BoundaryLayer[];
  price?: number | null;
  maxAttendees?: number | null;
};

export function EventDetailView({ event }: { event: EventDetailData }) {
  const { t } = useTranslation();
  const coverPhoto = event.photos[0];
  // Rich text from the event description editor is rendered as real HTML (so headings, bold
  // text and embedded photos actually show up) — DOMPurify strips anything that could execute
  // script before it ever reaches the DOM, since this page is public and other hosts' content
  // ends up here too.
  // Photos inserted via the wizard's photo picker are local blob: object URLs until real
  // upload is wired up — DOMPurify's default allow-list doesn't include that scheme, so it
  // strips the <img src> entirely. blob: can't carry executable script when used as an <img>
  // src, so allowing it here doesn't weaken the XSS protection this sanitize call exists for.
  const safeDescription = DOMPurify.sanitize(event.descriptionHtml, {
    ALLOWED_URI_REGEXP:
      /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|blob):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });

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
        {event.building || event.detailAddress || event.address ? (
          <span className="flex items-center gap-2">
            <MapPin className="size-4 text-primary" />
            {[event.building, event.detailAddress, event.address].filter(Boolean).join(" · ")}
          </span>
        ) : (
          event.region && (
            <span className="flex items-center gap-2">
              <Globe2 className="size-4 text-primary" />
              {t("eventDetail.onlineLocation", { region: event.region })}
            </span>
          )
        )}
        {event.maxAttendees != null && (
          <span className="flex items-center gap-2">
            <Users className="size-4 text-primary" />
            {t("eventDetail.maxAttendees", { count: event.maxAttendees })}
          </span>
        )}
        {event.price != null && (
          <span className="flex items-center gap-2">
            <Wallet className="size-4 text-primary" />
            {event.price === 0
              ? t("eventDetail.free")
              : t("eventDetail.price", { price: event.price.toLocaleString() })}
          </span>
        )}
      </div>

      {safeDescription && (
        <div
          className="prose prose-sm mt-6 max-w-none text-foreground [&_img]:rounded-xl"
          dangerouslySetInnerHTML={{ __html: safeDescription }}
        />
      )}

      {event.lat != null && event.lng != null && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">
            {t("mypage.create.mapLabel")}
          </h2>
          <div className="mt-3 h-72 overflow-hidden rounded-2xl border border-border shadow-sm">
            <EventStaticMap center={{ lat: event.lat, lng: event.lng }} layers={event.layers} />
          </div>
        </div>
      )}

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
