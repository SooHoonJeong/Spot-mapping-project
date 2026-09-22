import API from "@/api/axios";
import type { AppEvent } from "../lib/events";

export interface EventListParams {
  keyword?: string;
  tag?: string;
  region?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  sort?: string;
  page?: number;
  size?: number;
}

export interface EventListResult {
  content: AppEvent[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

// TODO: 백엔드 스펙 미확정 — GET /api/events/{id}가 실제로 이 경로/모양인지 확인 필요.
// POST /api/events 요청 스펙과 대칭이 되도록 가정해서 만들어둠(location 중첩, areas GeoJSON 등).
export interface EventDetailResponse {
  id: number;
  title: string;
  description: string;
  tags: string[];
  region: string;
  startAt: string;
  location: {
    address: string;
    building: string;
    detailAddress: string;
    lat: number;
    lng: number;
  };
  areas: {
    type: "FeatureCollection";
    features: {
      type: "Feature";
      geometry: { type: string; coordinates: number[][][] | number[][] };
      properties: { name: string; color: string; shape: "area" | "line"; groupTempId?: string };
    }[];
  };
  photos: string[];
}

export const eventsService = {
  async getEvents(params: EventListParams = {}) {
    const response = await API.get("/api/events", { params });
    return response.data.data as EventListResult;
  },

  async getEventById(id: number | string) {
    const response = await API.get(`/api/events/${id}`);
    return response.data.data as EventDetailResponse;
  },
};
