"use client";

import { Fragment } from "react";
import { MapContainer, TileLayer, Marker, Polygon, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { PIN_COLOR } from "../lib/events";
import type { BoundaryLayer } from "@/features/mypage/lib/location";

let pinIcon: L.DivIcon | null = null;
function markerIcon() {
  if (pinIcon) return pinIcon;
  const size = 38;
  pinIcon = L.divIcon({
    className: "event-pin",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    html: `
      <div style="filter: drop-shadow(0 4px 6px rgb(0 0 0 / 0.3));">
        <svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 1C9.92 1 5 5.92 5 12c0 7.5 11 19 11 19s11-11.5 11-19C27 5.92 22.08 1 16 1Z" fill="${PIN_COLOR}" stroke="white" stroke-width="2"/>
          <circle cx="16" cy="12" r="4" fill="white"/>
        </svg>
      </div>`,
  });
  return pinIcon;
}

// Read-only map used to preview/display an event's location and drawn zones — no click-to-draw,
// no dragging. Used by both the create-event wizard's preview step and the real event detail
// page so the two stay visually identical.
export default function EventStaticMap({
  center,
  layers = [],
}: {
  center: { lat: number; lng: number };
  layers?: BoundaryLayer[];
}) {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={16}
      scrollWheelZoom={false}
      dragging={false}
      doubleClickZoom={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <Marker position={[center.lat, center.lng]} icon={markerIcon()} />
      {layers.map((layer) => {
        const positions = layer.points.map((p) => [p.lat, p.lng]) as [number, number][];
        if (layer.shape === "area" && positions.length >= 3) {
          return (
            <Polygon
              key={layer.id}
              positions={positions}
              pathOptions={{ color: layer.color, fillColor: layer.color, fillOpacity: 0.25 }}
            />
          );
        }
        if (positions.length >= 2) {
          return (
            <Fragment key={layer.id}>
              <Polyline positions={positions} pathOptions={{ color: layer.color, weight: 3 }} />
            </Fragment>
          );
        }
        return null;
      })}
    </MapContainer>
  );
}
