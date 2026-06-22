import type { LineString } from "geojson";
import type { MapFeature } from "../types/FeatureTypes";
import {
  type ElevationData,
  getElevationData,
  getProfileGeometry,
} from "./ElevationProfile";
import {
  concatenateLineStrings,
  getLineStringsFromGeometry,
} from "./geometryElevationPath";

export function getFeatureElevationData(
  feature: MapFeature,
): ElevationData | null {
  const profile = feature.properties.elevationProfile;
  if (!profile) {
    return null;
  }

  const geometryLine = concatenateLineStrings([feature.geometry]);
  if (!geometryLine) {
    return null;
  }

  const profileGeometry = getProfileGeometry(geometryLine, profile);
  return getElevationData(profileGeometry);
}

export function getFeatureElevationDisplayLine(
  feature: MapFeature,
): LineString | null {
  return concatenateLineStrings([feature.geometry]);
}

export function featureSupportsElevationChart(feature: MapFeature): boolean {
  if (!feature.properties.elevationProfile) {
    return false;
  }

  return getLineStringsFromGeometry(feature.geometry).length > 0;
}
