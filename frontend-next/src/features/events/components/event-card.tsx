"use client";

import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppEvent } from "../lib/events";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

export function EventCard({
  event,
  active,
  onSelect,
}: {
  event: AppEvent;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      id={`event-${event.id}`}
      onClick={() => onSelect(event.id)}
      className={cn(
        "group flex w-full gap-3 rounded-xl border bg-card p-3 text-left transition-all hover:border-primary/60 hover:shadow-md",
        active
          ? "border-primary shadow-md ring-2 ring-primary/30"
          : "border-border",
      )}
    >
      <img
        src={event.image || "/placeholder.svg"}
        alt={event.title}
        className="h-24 w-24 shrink-0 rounded-lg object-cover"
        crossOrigin="anonymous"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent-foreground">
            {t(`categories.${event.category}`)}
          </span>
          <span className="text-sm font-bold text-primary">{event.price}</span>
        </div>
        <h3 className="mt-1.5 truncate text-base font-semibold text-card-foreground">
          {event.title}
        </h3>
        <div className="mt-1 flex flex-col gap-0.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="size-3.5 shrink-0" />
            {event.date}
            <Clock className="ml-1 size-3.5 shrink-0" />
            {event.time}
          </span>
          <span className="flex items-center gap-1.5 truncate">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">{event.venue}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="size-3.5 shrink-0" />
            {event.attendees.toLocaleString()}
            {t("eventsBrowser.going")}
          </span>
        </div>
      </div>
    </button>
  );
}
