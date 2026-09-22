"use client";

import { Calendar, MapPin, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppEvent } from "../lib/events";

export function EventCard({
  event,
  active,
  onSelect,
}: {
  event: AppEvent;
  active: boolean;
  onSelect: (id: number) => void;
}) {
  return (
    <button
      type="button"
      id={`event-${event.id}`}
      onClick={() => onSelect(event.id)}
      className={cn(
        "group flex w-full flex-col gap-2 rounded-xl border bg-card p-3 text-left transition-all hover:border-primary/60 hover:shadow-md",
        active
          ? "border-primary shadow-md ring-2 ring-primary/30"
          : "border-border",
      )}
    >
      <h3 className="text-base font-semibold text-card-foreground">
        {event.title}
      </h3>
      <p className="line-clamp-2 text-xs text-muted-foreground">
        {event.description}
      </p>
      <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Calendar className="size-3.5 shrink-0" />
          {event.startDate}
        </span>
        <span className="flex items-center gap-1.5 truncate">
          <MapPin className="size-3.5 shrink-0" />
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
  );
}
