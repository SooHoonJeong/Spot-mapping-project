"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Loader2 } from "lucide-react";
import { MAP_CENTER } from "@/features/events/lib/events";
import {
  buildingFrom,
  type NominatimResult,
  type SelectedLocation,
} from "../lib/location";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

function markerIcon() {
  const size = 40;
  return L.divIcon({
    className: "event-pin",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    html: `
      <div style="filter: drop-shadow(0 4px 6px rgb(0 0 0 / 0.3));">
        <svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 1C9.92 1 5 5.92 5 12c0 7.5 11 19 11 19s11-11.5 11-19C27 5.92 22.08 1 16 1Z" fill="#ff6a00" stroke="white" stroke-width="2"/>
          <circle cx="16" cy="12" r="4" fill="white"/>
        </svg>
      </div>`,
  });
}

function ClickHandler({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function Recenter({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 16, { duration: 0.8 });
  }, [position, map]);
  return null;
}

function AutoResize() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

export default function LocationMap({
  value,
  onChange,
}: {
  value: SelectedLocation | null;
  onChange: (loc: SelectedLocation) => void;
}) {
  const { t } = useTranslation();
  const [resolving, setResolving] = useState(false);
  const position: [number, number] | null = value
    ? [value.lat, value.lng]
    : null;

  async function pickFromMap(lat: number, lng: number) {
    // Optimistic update so the marker moves immediately.
    onChange({
      address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      building: t("mypage.create.selectedPoint"),
      lat,
      lng,
    });
    try {
      setResolving(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&namedetails=1&lat=${lat}&lon=${lng}`,
      );
      const data: NominatimResult = await res.json();
      if (data && data.display_name) {
        onChange({
          address: data.display_name,
          building: buildingFrom(data),
          lat,
          lng,
        });
      }
    } catch {
      // keep the optimistic coordinates
    } finally {
      setResolving(false);
    }
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={position ?? MAP_CENTER}
        zoom={13}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <ClickHandler onPick={pickFromMap} />
        <Recenter position={position} />
        <AutoResize />
        {position && <Marker position={position} icon={markerIcon()} />}
      </MapContainer>
      {resolving && (
        <div className="absolute right-3 top-3 z-[1000] flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1.5 text-xs font-medium shadow-md backdrop-blur">
          <Loader2 className="size-3.5 animate-spin text-primary" />
          {t("mypage.create.locating")}
        </div>
      )}
    </div>
  );
}
