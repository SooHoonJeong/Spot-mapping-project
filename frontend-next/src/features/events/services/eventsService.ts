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

export interface EventArea {
  id: number;
  name: string;
  color: string;
  shape: "AREA" | "LINE";
  areaGroupId: number | null;
  geometry: { type: string; coordinates: number[][][] | number[][] };
}

export interface EventAreaGroup {
  id: number;
  name: string;
  color: string;
}

// GET /api/events/{id}는 POST /api/events의 응답과 같은 모양이라고 가정 — 백엔드팀이 둘을
// 같은 리소스 표현으로 맞춰준다고 확인해줌. format이 "ONLINE"이면 location/areaGroups/areas는
// null 또는 빈 배열로 온다.
export interface EventDetailResponse {
  id: number;
  title: string;
  description: string;
  tags: string[];
  region: string;
  startAt: string;
  format: "OFFLINE" | "ONLINE";
  location: {
    address: string;
    building: string;
    detailAddress: string;
    lat: number;
    lng: number;
  } | null;
  areaGroups: EventAreaGroup[];
  areas: EventArea[];
  photoUrls: string[];
  price: number | null;
  maxAttendees: number | null;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  tags: string[];
  region: string;
  startAt: string;
  format: "OFFLINE" | "ONLINE";
  location?: {
    address: string;
    building: string;
    detailAddress: string;
    lat: number;
    lng: number;
  };
  areaGroups?: { tempId: string; name: string; color: string }[];
  areas?: {
    type: "FeatureCollection";
    features: {
      type: "Feature";
      geometry: { type: string; coordinates: number[][][] | number[][] };
      properties: { name: string; color: string; shape: "area" | "line"; groupTempId?: string };
    }[];
  };
  photoKeys?: string[];
  price?: number | null;
  maxAttendees?: number | null;
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

  async createEvent(payload: CreateEventRequest) {
    const response = await API.post("/api/events", payload);
    return response.data.data as EventDetailResponse;
  },
};
