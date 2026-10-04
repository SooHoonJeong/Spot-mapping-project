"use client";

import { useCallback, useEffect, useState } from "react";
import { eventsService, type EventListParams } from "../services/eventsService";
import type { AppEvent } from "./events";

// enabled=false면 요청을 보내지 않고 loading 상태로 둔다 — 파라미터(예: 현재 위치)가 준비된 뒤에
// 한 번만 요청하고 싶을 때 쓴다.
export function useEvents(params: EventListParams, { enabled = true } = {}) {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const key = JSON.stringify(params);

  useEffect(() => {
    if (!enabled) return;
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
  }, [key, enabled]);

  return { events, totalElements, loading, error };
}

// "더 보기" 방식 페이지네이션: 필터(params)가 바뀌면 처음부터 다시 불러오고, loadMore()는
// 다음 페이지를 기존 목록 뒤에 이어 붙인다.
export function useInfiniteEvents(params: Omit<EventListParams, "page">) {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const key = JSON.stringify(params);

  useEffect(() => {
    setEvents([]);
    setPage(0);
  }, [key]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    eventsService
      .getEvents({ ...params, page })
      .then((result) => {
        if (cancelled) return;
        setEvents((prev) => (page === 0 ? result.content : [...prev, ...result.content]));
        setTotalElements(result.totalElements);
        setHasNext(result.hasNext);
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
  }, [key, page]);

  const loadMore = useCallback(() => setPage((p) => p + 1), []);

  return { events, totalElements, hasNext, loading, error, loadMore };
}
