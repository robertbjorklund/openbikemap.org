import type { LineString, MultiLineString, Position } from "geojson";
import type * as maplibregl from "maplibre-gl";
import { mapFeatureFromMvt } from "../components/MvtFeature";
import {
  FeatureType,
  TRAIL_CATEGORY_LABELS,
  type MapFeature,
  type TrailCategory,
} from "../types/FeatureTypes";

const GENERIC_TRAIL_NAMES = new Set(Object.values(TRAIL_CATEGORY_LABELS));

export interface FeatureGroupKey {
  name: string;
  category?: TrailCategory;
  network?: string | null;
  ref?: string | null;
}

function getLineStrings(
  geometry: LineString | MultiLineString,
): Position[][] {
  if (geometry.type === "LineString") {
    return geometry.coordinates.length >= 2 ? [geometry.coordinates] : [];
  }
  return geometry.coordinates.filter((line) => line.length >= 2);
}

export function getFeatureGroupKey(feature: MapFeature): FeatureGroupKey | null {
  const { properties } = feature;

  if (
    properties.type === FeatureType.Trail &&
    properties.name &&
    !GENERIC_TRAIL_NAMES.has(properties.name)
  ) {
    return { name: properties.name, category: properties.category };
  }

  if (properties.type === FeatureType.Route) {
    const name = properties.name || properties.ref;
    if (!name) {
      return null;
    }
    return {
      name,
      network: properties.network,
      ref: properties.ref,
    };
  }

  return null;
}

export function matchesGroupKey(
  feature: MapFeature,
  key: FeatureGroupKey,
): boolean {
  const { properties } = feature;

  if (properties.type === FeatureType.Trail) {
    return (
      properties.name === key.name &&
      (!key.category || properties.category === key.category)
    );
  }

  if (properties.type === FeatureType.Route) {
    const name = properties.name || properties.ref;
    if (name !== key.name) {
      return false;
    }
    if (key.network && properties.network !== key.network) {
      return false;
    }
    if (key.ref && properties.ref !== key.ref) {
      return false;
    }
    return true;
  }

  return false;
}

export function findRelatedFeatures(
  map: maplibregl.Map,
  primary: MapFeature,
): MapFeature[] {
  const groupKey = getFeatureGroupKey(primary);
  if (!groupKey) {
    return [primary];
  }

  const sourceLayer =
    primary.properties.type === FeatureType.Route ? "routes" : "trails";

  if (!map.getSource("openbikemap")) {
    return [primary];
  }

  const rawFeatures = map.querySourceFeatures("openbikemap", {
    sourceLayer,
  });

  const byId = new Map<string, MapFeature>();
  for (const raw of rawFeatures) {
    const feature = mapFeatureFromMvt(
      raw as maplibregl.MapGeoJSONFeature,
      sourceLayer,
    );
    if (feature && matchesGroupKey(feature, groupKey)) {
      byId.set(feature.properties.id, feature);
    }
  }

  if (byId.size === 0) {
    return [primary];
  }

  return [...byId.values()];
}

export function mergeSegmentGroup(
  primary: MapFeature,
  segments: MapFeature[],
): MapFeature {
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
      },
    };
  }

  return {
    type: "Feature",
    geometry,
    properties: primary.properties,
  };
}

export function getSegmentCount(feature: MapFeature): number {
  return getLineStrings(feature.geometry).length;
}
