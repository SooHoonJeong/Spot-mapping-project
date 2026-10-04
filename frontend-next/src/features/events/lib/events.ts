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
  // ONLINE 이벤트는 위치가 없어 null일 수 있다고 가정 (목록 응답 예시는 오프라인만 보여줌).
  latitude: number | null;
  longitude: number | null;
  // 스펙 예시는 startDate("2026-08-01")였지만 실제 서버는 startAt("2026-10-06T11:10:00")을 준다.
  startAt: string;
};

// Default map center: Seoul
export const MAP_CENTER: [number, number] = [37.5665, 126.978];

export const PIN_COLOR = "#2451c7";
