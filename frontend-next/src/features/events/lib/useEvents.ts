"use client";

import { useEffect, useState } from "react";
import { eventsService, type EventListParams } from "../services/eventsService";
import type { AppEvent } from "./events";

export function useEvents(params: EventListParams) {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const key = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    eventsService
      .getEvents(params)
      .then((result) => {
        if (cancelled) return;
        setEvents(result.content);
        setTotalElements(result.totalElements);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { events, totalElements, loading, error };
}
