"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CATEGORY_COLORS, MAP_CENTER, type AppEvent } from "../lib/events";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

function pinIcon(color: string, active: boolean) {
  const size = active ? 42 : 34;
  return L.divIcon({
    className: "event-pin",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size + 6],
    html: `
      <div style="transform: translateY(0); filter: drop-shadow(0 4px 6px rgb(0 0 0 / 0.3));">
        <svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 1C9.92 1 5 5.92 5 12c0 7.5 11 19 11 19s11-11.5 11-19C27 5.92 22.08 1 16 1Z" fill="${color}" stroke="white" stroke-width="2"/>
          <circle cx="16" cy="12" r="4" fill="white"/>
        </svg>
      </div>`,
  });
}

function MapController({
  selectedId,
  events,
}: {
  selectedId: string | null;
  events: AppEvent[];
}) {
  const map = useMap();

  useEffect(() => {
    if (!selectedId) return;
    const ev = events.find((e) => e.id === selectedId);
    if (ev) {
      map.flyTo([ev.lat, ev.lng], 15, { duration: 0.8 });
    }
  }, [selectedId, events, map]);

  return null;
}

export default function EventMap({
  events,
  selectedId,
  onSelect,
}: {
  events: AppEvent[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <MapContainer
      center={MAP_CENTER}
      zoom={13}
      scrollWheelZoom
      className="h-full w-full"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <MapController selectedId={selectedId} events={events} />
      {events.map((ev) => (
        <Marker
          key={ev.id}
          position={[ev.lat, ev.lng]}
          icon={pinIcon(CATEGORY_COLORS[ev.category], ev.id === selectedId)}
          eventHandlers={{ click: () => onSelect(ev.id) }}
        >
          <Popup>
            <a
              href={`#event-${ev.id}`}
              className="block no-underline"
              onClick={() => onSelect(ev.id)}
            >
              <img
                src={ev.image || "/placeholder.svg"}
                alt={ev.title}
                className="h-24 w-full object-cover"
                crossOrigin="anonymous"
              />
              <div className="p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {t(`categories.${ev.category}`)}
                </p>
                <p className="mt-0.5 text-sm font-semibold leading-tight text-foreground">
                  {ev.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {ev.date} · {ev.time}
                </p>
              </div>
            </a>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
