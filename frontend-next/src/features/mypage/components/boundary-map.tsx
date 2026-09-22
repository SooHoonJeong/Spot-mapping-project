"use client";

import { Fragment, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polygon,
  Polyline,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MAP_CENTER } from "@/features/events/lib/events";
import type { EditableBoundaryPoint } from "../lib/location";

const VERTEX_SIZE = 16;

// One shared icon per color rather than building a new L.divIcon every render/marker: giving a
// Marker a fresh icon object identity on every re-render (e.g. right as a drag ends) raced with
// Leaflet's own drag cleanup and threw an uncaught "baseVal" TypeError.
const vertexIconCache = new Map<string, L.DivIcon>();
function vertexIcon(color: string) {
  let icon = vertexIconCache.get(color);
  if (!icon) {
    icon = L.divIcon({
      className: "boundary-vertex",
      iconSize: [VERTEX_SIZE, VERTEX_SIZE],
      iconAnchor: [VERTEX_SIZE / 2, VERTEX_SIZE / 2],
      html: `<div style="width:${VERTEX_SIZE}px;height:${VERTEX_SIZE}px;border-radius:9999px;background:#fff;border:2px solid ${color};box-shadow:0 1px 3px rgb(0 0 0 / 0.4);"></div>`,
    });
    vertexIconCache.set(color, icon);
  }
  return icon;
}

let centerIcon: L.DivIcon | null = null;
function centerMarkerIcon() {
  if (centerIcon) return centerIcon;
  const size = 36;
  centerIcon = L.divIcon({
    className: "event-pin",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    html: `
      <div style="filter: drop-shadow(0 4px 6px rgb(0 0 0 / 0.3));">
        <svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 1C9.92 1 5 5.92 5 12c0 7.5 11 19 11 19s11-11.5 11-19C27 5.92 22.08 1 16 1Z" fill="#2451c7" stroke="white" stroke-width="2"/>
          <circle cx="16" cy="12" r="4" fill="white"/>
        </svg>
      </div>`,
  });
  return centerIcon;
}

function ClickHandler({ onAddPoint }: { onAddPoint: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onAddPoint(e.latlng.lat, e.latlng.lng);
    },
  });
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

export type EditorLayer = {
  id: number;
  name: string;
  color: string;
  points: EditableBoundaryPoint[];
  groupId: number | null;
  shape: "area" | "line";
};

export default function BoundaryMap({
  center,
  layers,
  activeLayerId,
  onAddPoint,
  onMovePoint,
  onDeletePoint,
}: {
  center: { lat: number; lng: number } | null;
  layers: EditorLayer[];
  activeLayerId: number;
  onAddPoint: (lat: number, lng: number) => void;
  onMovePoint: (id: number, lat: number, lng: number) => void;
  onDeletePoint: (id: number) => void;
}) {
  const initialCenter: [number, number] = center ? [center.lat, center.lng] : MAP_CENTER;

  return (
    <MapContainer center={initialCenter} zoom={16} scrollWheelZoom className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <ClickHandler onAddPoint={onAddPoint} />
      <AutoResize />
      {center && <Marker position={[center.lat, center.lng]} icon={centerMarkerIcon()} />}
      {layers.map((layer) => {
        const positions = layer.points.map((p) => [p.lat, p.lng]) as [number, number][];
        const isActive = layer.id === activeLayerId;
        const isArea = layer.shape === "area";
        return (
          <Fragment key={layer.id}>
            {isArea && positions.length >= 3 && (
              <Polygon
                positions={positions}
                pathOptions={{
                  color: layer.color,
                  fillColor: layer.color,
                  fillOpacity: isActive ? 0.3 : 0.15,
                  weight: isActive ? 3 : 2,
                }}
              />
            )}
            {isArea && positions.length === 2 && (
              <Polyline
                positions={positions}
                pathOptions={{ color: layer.color, dashArray: "6 6" }}
              />
            )}
            {!isArea && positions.length >= 2 && (
              <Polyline
                positions={positions}
                pathOptions={{ color: layer.color, weight: isActive ? 4 : 3 }}
              />
            )}
            {isActive &&
              layer.points.map((p) => (
                <Marker
                  key={p.id}
                  position={[p.lat, p.lng]}
                  icon={vertexIcon(layer.color)}
                  draggable
                  eventHandlers={{
                    // Swallow single clicks so they don't also bubble to the map's click
                    // handler and add a stray new point right on top of this vertex.
                    click: (e) => {
                      L.DomEvent.stopPropagation(e);
                    },
                    dblclick: (e) => {
                      L.DomEvent.stopPropagation(e);
                      onDeletePoint(p.id);
                    },
                    dragend: (e) => {
                      const { lat, lng } = e.target.getLatLng();
                      onMovePoint(p.id, lat, lng);
                    },
                  }}
                />
              ))}
          </Fragment>
        );
      })}
    </MapContainer>
  );
}
