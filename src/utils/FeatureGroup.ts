import type { LineString, MultiLineString, Position } from "geojson";
import type * as maplibregl from "maplibre-gl";
import { mapFeatureFromMvt } from "../components/MvtFeature";
import { FeatureType, type MapFeature } from "../types/FeatureTypes";
import { mergeElevationProfilesFromFeatures } from "./geometryElevationPath";

export type { FeatureGroupKey, RouteGroupKey, TrailGroupKey } from "../types/FeatureGroupKeys";
export {
  getFeatureGroupKey,
  getRouteLinkKeys,
  getTrailGroupKey,
  matchesGroupKey,
  matchesTrailGroupKey,
  normalizeRouteName,
  normalizeTrailName,
} from "../types/FeatureGroupKeys";

function getLineStrings(
  geometry: LineString | MultiLineString,
): Position[][] {
  if (geometry.type === "LineString") {
    return geometry.coordinates.length >= 2 ? [geometry.coordinates] : [];
  }
  return geometry.coordinates.filter((line) => line.length >= 2);
}

/** Merge vector-tile clips that share the same feature id (one clip per tile). */
export function mergeTileClips(features: MapFeature[]): MapFeature[] {
  const groups = new Map<string, MapFeature[]>();
  for (const feature of features) {
    const group = groups.get(feature.properties.id) ?? [];
    group.push(feature);
    groups.set(feature.properties.id, group);
  }

  return [...groups.values()].map((group) => {
    if (group.length === 1) {
      return group[0];
    }
    const sameId = group.every(
      (feature) => feature.properties.id === group[0].properties.id,
    );
    if (sameId) {
      return mergeFeatureGeometries(group[0], group);
    }
    return mergeSegmentGroup(group[0], group);
  });
}

function mergeFeatureGeometries(
  primary: MapFeature,
  parts: MapFeature[],
): MapFeature {
  const lines = parts.flatMap((part) => getLineStrings(part.geometry));
  if (lines.length === 0) {
    return primary;
  }
  if (lines.length === 1) {
    return {
      ...primary,
      geometry: { type: "LineString", coordinates: lines[0] },
    };
  }
  return {
    ...primary,
    geometry: { type: "MultiLineString", coordinates: lines },
  };
}

const ROUTE_TILE_CLIP_LAYERS = [
  "tappable-route",
  "routes",
  "routes-casing",
] as const;

const TRAIL_TILE_CLIP_LAYERS = [
  "tappable-trail",
  "trails",
  "trails-casing",
  "trails-imba",
] as const;

/**
 * Tile clips for the clicked segment only (same feature id on screen).
 * Full logical groups resolve via the API — do not scan all loaded MVT routes.
 */
export function findRelatedFeatures(
  map: maplibregl.Map,
  primary: MapFeature,
): MapFeature[] {
  const sourceLayer =
    primary.properties.type === FeatureType.Route ? "routes" : "trails";
  const layerIds =
    primary.properties.type === FeatureType.Route
      ? ROUTE_TILE_CLIP_LAYERS
      : TRAIL_TILE_CLIP_LAYERS;

  if (!map.getSource("openbikemap")) {
    return [primary];
  }

  const layers = layerIds.filter((layerId) => map.getLayer(layerId));
  if (layers.length === 0) {
    return [primary];
  }

  const primaryId = primary.properties.id;
  const matches: MapFeature[] = [];
  for (const raw of map.queryRenderedFeatures({ layers })) {
    if (raw.source !== "openbikemap" || raw.sourceLayer !== sourceLayer) {
      continue;
    }
    const feature = mapFeatureFromMvt(
      raw as maplibregl.MapGeoJSONFeature,
      sourceLayer,
    );
    if (feature?.properties.id === primaryId) {
      matches.push(feature);
    }
  }

  if (matches.length === 0) {
    return [primary];
  }

  return mergeTileClips(matches);
}

/** One GeoJSON feature per line for reliable highlight rendering. */
export function featuresForHighlight(feature: MapFeature): MapFeature[] {
  const lines = getLineStrings(feature.geometry);
  if (lines.length === 0) {
    return [];
  }
  if (lines.length === 1) {
    return [
      {
        ...feature,
        geometry: { type: "LineString", coordinates: lines[0] },
      },
    ];
  }
  return lines.map(
    (coordinates) =>
      ({
        type: "Feature",
        geometry: { type: "LineString", coordinates },
        properties: feature.properties,
      }) as MapFeature,
  );
}

export function mergeSegmentGroup(
  primary: MapFeature,
  segments: MapFeature[],
  options?: { mergeElevation?: boolean },
): MapFeature {
  const mergeElevation = options?.mergeElevation !== false;
  const uniqueSegments = [
    ...new Map(segments.map((s) => [s.properties.id, s])).values(),
  ];

  if (uniqueSegments.length <= 1) {
    return primary;
  }

  const lines = uniqueSegments.flatMap((segment) =>
    getLineStrings(segment.geometry),
  );

  if (lines.length === 0) {
    return primary;
  }

  const geometry: MultiLineString = {
    type: "MultiLineString",
    coordinates: lines,
  };

  if (primary.properties.type === FeatureType.Trail) {
    const totalLength = uniqueSegments.reduce((sum, segment) => {
      if (segment.properties.type !== FeatureType.Trail) {
        return sum;
      }
      return sum + (segment.properties.lengthMeters ?? 0);
    }, 0);

    return {
      type: "Feature",
      geometry,
      properties: {
        ...primary.properties,
        lengthMeters:
          totalLength > 0 ? totalLength : primary.properties.lengthMeters,
        elevationProfile: mergeElevation
          ? mergeElevationProfilesFromFeatures(uniqueSegments)
          : primary.properties.elevationProfile,
      },
    };
  }

  return {
    type: "Feature",
    geometry,
    properties: {
      ...primary.properties,
      elevationProfile: mergeElevation
        ? mergeElevationProfilesFromFeatures(uniqueSegments)
        : primary.properties.elevationProfile,
    },
  };
}

export function getSegmentCount(feature: MapFeature): number {
  return getLineStrings(feature.geometry).length;
}
