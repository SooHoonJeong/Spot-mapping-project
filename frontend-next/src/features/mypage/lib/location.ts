export type SelectedLocation = {
  address: string;
  building: string;
  region: string;
  lat: number;
  lng: number;
};

export type BoundaryPoint = {
  lat: number;
  lng: number;
};

// Boundary point with a stable id, used only while editing on the boundary editor page. React
// needs a key that survives deleting a point from the middle of the list — using the array
// index as key there causes Leaflet's per-marker drag state to attach to the wrong point after
// reconciliation reindexes the remaining markers.
export type EditableBoundaryPoint = BoundaryPoint & { id: number };

// A single named, colored event-area polygon. An event can have several — e.g. "메인 무대"
// and "푸드트럭 구역" as separate shapes — which is why boundaries live behind a small
// layer concept instead of being one flat point list.
export type BoundaryLayer = {
  id: number;
  name: string;
  color: string;
  points: BoundaryPoint[];
  // null when the layer isn't in any group. Grouped layers share the group's color and can be
  // shown/hidden together — e.g. all "시설물" layers at once — instead of one at a time.
  groupId: number | null;
  // "area" closes into a filled polygon once it has 3+ points (e.g. a stage or vendor zone).
  // "line" always stays an open path connecting its points in order (e.g. a route or fence
  // line) — it never closes into a filled shape no matter how many points it has.
  shape: "area" | "line";
};

// A named bucket of layers, offering bulk operations (show/hide all members, recolor all
// members) that would otherwise require touching each layer individually.
export type LayerGroup = {
  id: number;
  name: string;
  color: string;
  visible: boolean;
};

// Preset swatches offered when creating or recoloring a layer — a small fixed palette keeps
// layers visually distinct without a full color picker.
export const LAYER_COLORS = [
  "#2451c7", // navy/blue (brand accent, default for the first layer)
  "#f97316", // orange
  "#16a34a", // green
  "#9333ea", // purple
  "#db2777", // pink
  "#0d9488", // teal
] as const;

export type NominatimResult = {
  display_name: string;
  name?: string;
  lat: string;
  lon: string;
  address?: Record<string, string>;
};

export function buildingFrom(result: NominatimResult): string {
  const a = result.address ?? {};
  return (
    result.name ||
    a.building ||
    a.amenity ||
    a.shop ||
    a.tourism ||
    a.office ||
    a.leisure ||
    result.display_name.split(",")[0] ||
    ""
  );
}

// 도시/지역 단위 라벨을 주소에서 자동으로 뽑아냄. Nominatim의 addressdetails 응답은 나라마다
// 어떤 키에 시/도 정보가 들어있는지 달라서, 가장 그럴듯한 것부터 순서대로 시도한다.
export function regionFrom(result: NominatimResult): string {
  const a = result.address ?? {};
  return (
    a.city ||
    a.town ||
    a.county ||
    a.state ||
    a.province ||
    a.state_district ||
    result.display_name.split(",").slice(-2, -1)[0]?.trim() ||
    ""
  );
}
