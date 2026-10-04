"use client";

import Link from "next/link";
import { ArrowRight, Calendar, Globe2, MapPin, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import type { AppEvent } from "../lib/events";
import { formatStartAt, htmlToPlainText } from "../lib/format";

export function EventCard({
  event,
  active,
  onSelect,
}: {
  event: AppEvent;
  active: boolean;
  onSelect: (id: number) => void;
}) {
  const { t } = useTranslation();
  const isOnline = event.latitude == null || event.longitude == null;

  return (
    <div
      id={`event-${event.id}`}
      className={cn(
        "flex w-full flex-col rounded-xl border bg-card transition-all hover:border-primary/60 hover:shadow-md",
        active ? "border-primary shadow-md ring-2 ring-primary/30" : "border-border",
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(event.id)}
        className="flex w-full flex-col gap-2 p-3 text-left"
      >
        <h3 className="text-base font-semibold text-card-foreground">{event.title}</h3>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {htmlToPlainText(event.description)}
        </p>
        <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="size-3.5 shrink-0" />
            {formatStartAt(event.startAt)}
          </span>
          <span className="flex items-center gap-1.5 truncate">
            {isOnline ? (
              <Globe2 className="size-3.5 shrink-0" />
            ) : (
              <MapPin className="size-3.5 shrink-0" />
            )}
            <span className="truncate">{event.region}</span>
          </span>
        </div>
        {event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {event.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium text-accent-foreground"
              >
                <Tag className="size-3" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </button>
      <Link
        href={`/events/${event.id}`}
        className="flex items-center justify-end gap-1 border-t border-border px-3 py-2 text-xs font-semibold text-primary hover:underline"
      >
        {t("eventsBrowser.viewDetail")}
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}
