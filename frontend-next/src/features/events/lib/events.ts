// Matches the backend's GET /api/events response item shape exactly.
// TODO: 백엔드가 카테고리/온오프라인 구분/장소명/가격/참석자/이미지 필드를 추가하면
// 이 타입과 event-card / event-map / events-browser / featured-events / map-explorer의
// 렌더링을 다시 연결해야 함.
export type AppEvent = {
  id: number;
  title: string;
  description: string;
  tags: string[];
  region: string;
  latitude: number;
  longitude: number;
  startDate: string;
};

// Centered around New York City
export const MAP_CENTER: [number, number] = [40.7178, -73.9857];

export const PIN_COLOR = "#2451c7";
