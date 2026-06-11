import type { LineString } from "geojson";
import type { MapFeature } from "../types/FeatureTypes";
import {
  type ElevationData,
  getElevationData,
  getProfileGeometry,
} from "./ElevationProfile";

export function getFeatureElevationData(
  feature: MapFeature,
): ElevationData | null {
  if (feature.geometry.type !== "LineString") {
    return null;
  }

  const profile = feature.properties.elevationProfile;
  if (!profile) {
    return null;
  }

  const profileGeometry = getProfileGeometry(
    feature.geometry as LineString,
    profile,
  );
  return getElevationData(profileGeometry);
}
