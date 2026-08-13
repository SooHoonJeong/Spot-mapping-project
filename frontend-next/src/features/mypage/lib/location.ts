export type SelectedLocation = {
  address: string;
  building: string;
  lat: number;
  lng: number;
};

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
