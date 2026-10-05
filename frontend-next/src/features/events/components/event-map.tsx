"use client";

import { useEffect, useRef } from "react";
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MAP_CENTER, PIN_COLOR, type AppEvent } from "../lib/events";
import { formatStartAt } from "../lib/format";

function pinIcon(active: boolean) {
  const size = active ? 42 : 34;
  return L.divIcon({
    className: "event-pin",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size + 6],
    html: `
      <div style="transform: translateY(0); filter: drop-shadow(0 4px 6px rgb(0 0 0 / 0.3));">
        <svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 1C9.92 1 5 5.92 5 12c0 7.5 11 19 11 19s11-11.5 11-19C27 5.92 22.08 1 16 1Z" fill="${PIN_COLOR}" stroke="white" stroke-width="2"/>
          <circle cx="16" cy="12" r="4" fill="white"/>
        </svg>
      </div>`,
  });
}

type MappableEvent = AppEvent & { latitude: number; longitude: number };

function hasCoords(event: AppEvent): event is MappableEvent {
  return event.latitude != null && event.longitude != null;
}

export type MapOrigin = { lat: number; lng: number };

function MapController({
  selectedId,
  events,
  origin,
  radiusKm,
}: {
  selectedId: number | null;
  events: MappableEvent[];
  origin: MapOrigin | null;
  radiusKm: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (!selectedId) return;
    const ev = events.find((e) => e.id === selectedId);
    if (ev) {
      map.flyTo([ev.latitude, ev.longitude], 15, { duration: 0.8 });
    }
  }, [selectedId, events, map]);

  // 현재 위치를 알면 그 주변 radiusKm가 화면에 꽉 차게 시작한다(한 변 = 2 × 반경인 정사각형 기준이라
  // 지도 높이가 작은 모바일에서도 반경이 잘리지 않는다). 필터를 바꿔도 지도는 움직이지 않는다.
  // 지도 컨테이너는 동적 로딩 직후 크기가 0에 가깝게 잡히는 순간이 있어서, 그때 맞추면 줌이 터무니없이
  // 작아진다. 크기가 실제로 잡힌 뒤에 맞추고, 사용자가 지도를 직접 만지기 전까지는 크기가 바뀔 때마다
  // 다시 맞춘다.
  useEffect(() => {
    if (!origin) return;
    const el = map.getContainer();
    let userMoved = false;
    const markMoved = () => {
      userMoved = true;
    };

    const fit = () => {
      if (el.clientWidth === 0 || el.clientHeight === 0) return;
      map.invalidateSize();
      const bounds = L.latLng(origin.lat, origin.lng).toBounds(radiusKm * 2000);
      map.fitBounds(bounds, { animate: false });
    };

    const observer = new ResizeObserver(() => {
      if (!userMoved) fit();
    });
    observer.observe(el);
    el.addEventListener("pointerdown", markMoved);
    el.addEventListener("wheel", markMoved, { passive: true });
    fit();

    return () => {
      observer.disconnect();
      el.removeEventListener("pointerdown", markMoved);
      el.removeEventListener("wheel", markMoved);
    };
  }, [origin, radiusKm, map]);

  // 위치를 모를 때: 처음 불러온 이벤트들이 한 화면에 들어오도록 한 번만 맞춘다. 그 뒤에는 사용자가
  // 지도를 옮긴 영역 기준으로 목록이 바뀌므로, 목록이 바뀔 때마다 지도를 다시 움직이면 안 된다.
  const initialFitDone = useRef(false);
  useEffect(() => {
    if (origin || initialFitDone.current || events.length === 0) return;
    initialFitDone.current = true;
    map.invalidateSize();
    const bounds = L.latLngBounds(events.map((e) => [e.latitude, e.longitude] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [origin, events, map]);

  return null;
}

export type MapView = {
  lat: number;
  lng: number;
  // 화면 모서리까지의 거리 — 이 반경의 원은 보이는 사각형 영역을 모두 덮는다.
  radiusKm: number;
  bounds: { south: number; west: number; north: number; east: number };
};

// 사용자가 직접 지도를 움직인(드래그/휠/핀치/더블클릭/키보드) 경우에만 보이는 영역을 알려준다.
// 카드를 눌러 핀으로 이동하거나 처음 5km에 맞추는 것 같은 코드상의 이동은 무시해야, 카드를 누를 때마다
// 목록이 그 핀 주변으로 줄어들지 않는다.
const USER_MOVE_WINDOW_MS = 1500;

function ViewReporter({ onViewChange }: { onViewChange: (view: MapView) => void }) {
  const map = useMap();

  useEffect(() => {
    const el = map.getContainer();
    let lastUserMove = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const stamp = () => {
      lastUserMove = Date.now();
    };

    const handleMoveEnd = () => {
      if (Date.now() - lastUserMove > USER_MOVE_WINDOW_MS) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        const bounds = map.getBounds();
        const center = bounds.getCenter();
        onViewChange({
          lat: center.lat,
          lng: center.lng,
          radiusKm: center.distanceTo(bounds.getNorthEast()) / 1000,
          bounds: {
            south: bounds.getSouth(),
            west: bounds.getWest(),
            north: bounds.getNorth(),
            east: bounds.getEast(),
          },
        });
      }, 350);
    };

    map.on("dragstart drag", stamp);
    map.on("moveend", handleMoveEnd);
    const domEvents = ["wheel", "touchmove", "dblclick", "keydown"] as const;
    domEvents.forEach((name) => el.addEventListener(name, stamp, { passive: true }));

    return () => {
      clearTimeout(timer);
      map.off("dragstart drag", stamp);
      map.off("moveend", handleMoveEnd);
      domEvents.forEach((name) => el.removeEventListener(name, stamp));
    };
  }, [map, onViewChange]);

  return null;
}

export default function EventMap({
  events,
  selectedId,
  onSelect,
  origin,
  radiusKm,
  onViewChange,
}: {
  events: AppEvent[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  origin: MapOrigin | null;
  radiusKm: number;
  onViewChange: (view: MapView) => void;
}) {
  const mappableEvents = events.filter(hasCoords);

  return (
    <MapContainer
      center={origin ? [origin.lat, origin.lng] : MAP_CENTER}
      zoom={13}
      scrollWheelZoom
      className="h-full w-full"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController
        selectedId={selectedId}
        events={mappableEvents}
        origin={origin}
        radiusKm={radiusKm}
      />
      <ViewReporter onViewChange={onViewChange} />
      {origin && (
        <CircleMarker
          center={[origin.lat, origin.lng]}
          radius={7}
          interactive={false}
          pathOptions={{ color: "white", weight: 3, fillColor: PIN_COLOR, fillOpacity: 1 }}
        />
      )}
      {mappableEvents.map((ev) => (
        <Marker
          key={ev.id}
          position={[ev.latitude, ev.longitude]}
          icon={pinIcon(ev.id === selectedId)}
          eventHandlers={{ click: () => onSelect(ev.id) }}
        >
          <Popup>
            <a href={`/events/${ev.id}`} className="block no-underline">
              <div className="p-3">
                <p className="text-sm font-semibold leading-tight text-foreground">
                  {ev.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {ev.region} · {formatStartAt(ev.startAt)}
                </p>
              </div>
            </a>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
