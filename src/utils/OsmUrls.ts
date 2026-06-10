import type { Position } from "geojson";
import type { LineString, MultiLineString } from "geojson";
import type { Source } from "../types/FeatureTypes";
import { SourceType } from "../types/FeatureTypes";

export function osmBrowseUrl(sourceId: string): string {
  return `https://www.openstreetmap.org/${sourceId}`;
}

function parseOsmSourceId(sourceId: string): {
  type: "node" | "way" | "relation";
  id: string;
} | null {
  const match = sourceId.match(/^(node|way|relation)\/(\d+)$/);
  if (!match) {
    return null;
  }
  return { type: match[1] as "node" | "way" | "relation", id: match[2] };
}

export function osmEditUrl(
  sourceId: string,
  mapView?: { zoom: number; lat: number; lng: number },
): string | null {
  const parsed = parseOsmSourceId(sourceId);
  if (!parsed) {
    return null;
  }

  const params = new URLSearchParams({ editor: "id" });
  params.set(parsed.type, parsed.id);

  const hash = mapView
    ? `#map=${mapView.zoom}/${mapView.lat}/${mapView.lng}`
    : "";

  return `https://www.openstreetmap.org/edit?${params}${hash}`;
}

export function getPrimaryOsmSource(sources: Source[]): Source | null {
  const osmSources = sources.filter(
    (source) => source.type === SourceType.OpenStreetMap,
  );
  if (osmSources.length === 0) {
    return null;
  }

  const relation = osmSources.find((source) =>
    source.id.startsWith("relation/"),
  );
  return relation ?? osmSources[0];
}

export function geometryCenter(
  geometry: LineString | MultiLineString,
): { lat: number; lng: number } | null {
  const positions =
    geometry.type === "LineString"
      ? geometry.coordinates
      : geometry.coordinates.flat();

  if (positions.length === 0) {
    return null;
  }

  const midpoint = positions[Math.floor(positions.length / 2)] as Position;
  return { lng: midpoint[0], lat: midpoint[1] };
}

export function osmEditUrlForFeature(
  sources: Source[],
  geometry?: LineString | MultiLineString,
): string | null {
  const source = getPrimaryOsmSource(sources);
  if (!source) {
    return null;
  }

  const center = geometry ? geometryCenter(geometry) : null;
  return osmEditUrl(
    source.id,
    center ? { ...center, zoom: 14 } : undefined,
  );
}
