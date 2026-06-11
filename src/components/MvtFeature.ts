import type { LineString, MultiLineString } from "geojson";
import type * as maplibregl from "maplibre-gl";
import {
  FeatureType,
  SourceType,
  Status,
  type MapFeature,
  type RouteProperties,
  type TrailCategory,
  type TrailProperties,
} from "../types/FeatureTypes";

function asString(value: unknown): string | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  return String(value);
}

function asNumber(value: unknown): number | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function asBoolean(value: unknown): boolean | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  if (value === true || value === "true" || value === "yes" || value === 1) {
    return true;
  }
  if (value === false || value === "false" || value === "no" || value === 0) {
    return false;
  }
  return null;
}

export function mapFeatureFromMvt(
  feature: maplibregl.MapGeoJSONFeature,
  sourceLayer: string,
): MapFeature | null {
  const id = asString(feature.properties?.id);
  if (!id || !feature.geometry) {
    return null;
  }

  if (sourceLayer === "routes") {
    const osmId = asString(feature.properties.osmId);
    const properties: RouteProperties = {
      type: FeatureType.Route,
      id,
      name: asString(feature.properties.name),
      ref: asString(feature.properties.ref),
      network: asString(feature.properties.network),
      distance: null,
      roundtrip: null,
      pavedRatio: asNumber(feature.properties.pavedRatio),
      elevationProfile: null,
      status: Status.Operating,
      sources: osmId
        ? [{ type: SourceType.OpenStreetMap, id: osmId }]
        : [],
    };
    return {
      type: "Feature",
      geometry: feature.geometry as LineString | MultiLineString,
      properties,
    };
  }

  if (sourceLayer === "trails") {
    const category = asString(feature.properties.category) as TrailCategory | null;
    if (!category) {
      return null;
    }
    const properties: TrailProperties = {
      type: FeatureType.Trail,
      id,
      category,
      name: asString(feature.properties.name),
      ref: asString(feature.properties.ref),
      surface: asString(feature.properties.surface),
      smoothness: null,
      tracktype: null,
      mtbScale: asNumber(feature.properties.mtbScale),
      sacScale: null,
      bicycle: null,
      lit: asBoolean(feature.properties.lit),
      oneway: null,
      network: asString(feature.properties.network),
      lengthMeters: asNumber(feature.properties.lengthMeters),
      elevationProfile: null,
      status: Status.Operating,
      sources: [],
    };
    return {
      type: "Feature",
      geometry: feature.geometry as LineString | MultiLineString,
      properties,
    };
  }

  return null;
}
