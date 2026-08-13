"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, Search } from "lucide-react";
import {
  buildingFrom,
  type NominatimResult,
  type SelectedLocation,
} from "../lib/location";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

export function LocationSearch({
  value,
  onChange,
}: {
  value: SelectedLocation | null;
  onChange: (loc: SelectedLocation) => void;
}) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep the input in sync when a location is chosen from the map. `query` is then
  // independently editable afterward, so this can't be replaced by a derived-during-render
  // value — it's a one-time seed from an external source (map click), not a live mirror.
  useEffect(() => {
    if (value?.building) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery(value.building);
    }
  }, [value?.building]);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    if (query.trim().length < 3) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      return;
    }
    debounce.current = setTimeout(async () => {
      try {
        setSearching(true);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&namedetails=1&limit=6&q=${encodeURIComponent(
            query,
          )}`,
        );
        const data: NominatimResult[] = await res.json();
        setResults(data);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [query]);

  function selectResult(r: NominatimResult) {
    onChange({
      address: r.display_name,
      building: buildingFrom(r),
      lat: Number.parseFloat(r.lat),
      lng: Number.parseFloat(r.lon),
    });
    setQuery(buildingFrom(r));
    setOpen(false);
    setResults([]);
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length && setOpen(true)}
          placeholder={t("mypage.create.locationSearchPlaceholder")}
          className="h-11 w-full rounded-lg border border-input bg-background pl-9 pr-9 text-sm outline-none ring-primary/40 transition focus:ring-2"
        />
        {searching && (
          <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute z-[1000] mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-lg">
          {results.map((r, i) => (
            <li key={`${r.lat}-${r.lon}-${i}`}>
              <button
                type="button"
                onClick={() => selectResult(r)}
                className="flex w-full items-start gap-2 rounded-md px-3 py-2 text-left text-sm transition hover:bg-accent"
              >
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>
                  <span className="block font-medium text-popover-foreground">
                    {buildingFrom(r)}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {r.display_name}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
