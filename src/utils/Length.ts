import type { LineString, MultiLineString, Position } from "geojson";
import {
  distanceText,
  type UnitSystem,
} from "../components/utils/UnitHelpers";
import { FeatureType, type MapFeature } from "../types/FeatureTypes";

const EARTH_RADIUS_M = 6371008.8;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function haversineMeters(a: Position, b: Position): number {
  const dLat = toRadians(b[1] - a[1]);
  const dLon = toRadians(b[0] - a[0]);
  const lat1 = toRadians(a[1]);
  const lat2 = toRadians(b[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

function lineLengthMeters(coordinates: Position[]): number {
  let total = 0;
  for (let i = 1; i < coordinates.length; i++) {
    total += haversineMeters(coordinates[i - 1], coordinates[i]);
  }
  return total;
}

export function geometryLengthMeters(
  geometry: LineString | MultiLineString,
): number {
  const lines =
    geometry.type === "LineString"
      ? [geometry.coordinates]
      : geometry.coordinates;
  return Math.round(
    lines.reduce((sum, line) => sum + lineLengthMeters(line), 0),
  );
}

export function formatLength(
  meters: number | null,
  unitSystem: UnitSystem,
): string | null {
  if (meters === null || meters <= 0) {
    return null;
  }
  return distanceText({ distanceInMeters: meters, unitSystem });
}

export function getFeatureLengthMeters(feature: MapFeature): number | null {
  const { properties, geometry } = feature;

  if (
    properties.type === FeatureType.Trail &&
    properties.lengthMeters !== null &&
    properties.lengthMeters > 0
  ) {
    return properties.lengthMeters;
  }

  const measured = geometryLengthMeters(geometry);
  return measured > 0 ? measured : null;
}
