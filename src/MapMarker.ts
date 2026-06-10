export interface MapMarker {
  coordinates: [number, number];
}

export function parseMarkers(value: string): MapMarker[] {
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is [number, number] =>
          Array.isArray(item) &&
          item.length === 2 &&
          typeof item[0] === "number" &&
          typeof item[1] === "number",
      )
      .map((coords) => ({ coordinates: coords }));
  } catch {
    return [];
  }
}

export function stringifyMarkers(markers: MapMarker[]): string {
  return JSON.stringify(markers.map((m) => m.coordinates));
}
