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
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const key = JSON.stringify(params);
  // 페이지를 "어떤 필터에서의 몇 페이지인지"로 같이 들고 있어서, 필터가 바뀌는 순간 곧바로 0페이지로
  // 취급된다(별도 effect로 되돌리면 옛 페이지 번호로 요청이 한 번 더 나간다).
  const [pageState, setPageState] = useState({ key, page: 0 });
  const page = pageState.key === key ? pageState.page : 0;

  useEffect(() => {
    setEvents([]);
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

  const loadMore = useCallback(() => setPageState({ key, page: page + 1 }), [key, page]);

  return { events, totalElements, hasNext, loading, error, loadMore };
}
