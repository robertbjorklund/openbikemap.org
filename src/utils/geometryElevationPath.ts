import turfNearestPointOnLine from "@turf/nearest-point-on-line";
import type { LineString, MultiLineString, Position } from "geojson";
import type { ElevationProfile, MapFeature } from "../types/FeatureTypes";
import {
  extractPointsForElevationProfile,
  getProfileGeometry,
} from "./ElevationProfile";

export function getLineStringsFromGeometry(
  geometry: LineString | MultiLineString,
): LineString[] {
  if (geometry.type === "LineString") {
    return geometry.coordinates.length >= 2 ? [geometry] : [];
  }

  return geometry.coordinates
    .filter((line) => line.length >= 2)
    .map(
      (coordinates): LineString => ({
        type: "LineString",
        coordinates,
      }),
    );
}

/** Join line parts into one path for chart sampling and map sync. */
export function concatenateLineStrings(
  geometries: Array<LineString | MultiLineString>,
): LineString | null {
  const coordinates: Position[] = [];

  for (const geometry of geometries) {
    for (const line of getLineStringsFromGeometry(geometry)) {
      for (const coord of line.coordinates) {
        appendCoordinate(coordinates, coord);
      }
    }
  }

  if (coordinates.length < 2) {
    return null;
  }

  return { type: "LineString", coordinates };
}

function appendCoordinate(coordinates: Position[], coord: Position): void {
  if (coordinates.length === 0) {
    coordinates.push(copyHorizontalCoordinate(coord));
    return;
  }

  const last = coordinates[coordinates.length - 1];
  if (last[0] === coord[0] && last[1] === coord[1]) {
    return;
  }

  coordinates.push(copyHorizontalCoordinate(coord));
}

function copyHorizontalCoordinate(coord: Position): Position {
  return coord.length >= 3 ? [coord[0], coord[1], coord[2]] : [coord[0], coord[1]];
}

function profileLineForFeature(feature: MapFeature): LineString | null {
  return concatenateLineStrings([feature.geometry]);
}

function elevationAtPointOn3DLine(
  line: LineString,
  lng: number,
  lat: number,
): number | null {
  const nearest = turfNearestPointOnLine(line, [lng, lat], { units: "meters" });
  const elevation = nearest.geometry.coordinates[2];
  return typeof elevation === "number" ? elevation : null;
}

/**
 * Merge elevation profiles from related segments (route group, tile clips).
 * Re-samples onto the combined path so chart geometry and heights stay aligned.
 */
export function mergeElevationProfilesFromFeatures(
  segments: MapFeature[],
): ElevationProfile | null {
  const uniqueSegments = [
    ...new Map(segments.map((segment) => [segment.properties.id, segment])).values(),
  ];

  if (uniqueSegments.length === 1) {
    return uniqueSegments[0].properties.elevationProfile;
  }

  const segmentsWithProfile = uniqueSegments.filter(
    (segment) => segment.properties.elevationProfile,
  );
  if (segmentsWithProfile.length === 0) {
    return null;
  }

  const displayLine = concatenateLineStrings(
    segmentsWithProfile.map((segment) => segment.geometry),
  );
  if (!displayLine) {
    return null;
  }

  const targetResolution =
    segmentsWithProfile[0].properties.elevationProfile!.targetResolution;

  const merged3DCoordinates: Position[] = [];
  for (const segment of segmentsWithProfile) {
    const profile = segment.properties.elevationProfile!;
    const line = profileLineForFeature(segment);
    if (!line) {
      continue;
    }

    const segmentProfileLine = getProfileGeometry(line, profile);
    for (const coord of segmentProfileLine.coordinates) {
      appendCoordinate(merged3DCoordinates, coord);
    }
  }

  if (merged3DCoordinates.length < 2) {
    return null;
  }

  const merged3D: LineString = {
    type: "LineString",
    coordinates: merged3DCoordinates,
  };

  const { geometry: samplePoints, resolutionInMeters } =
    extractPointsForElevationProfile(displayLine, targetResolution);

  const heights: number[] = [];
  for (const [lng, lat] of samplePoints.coordinates) {
    const elevation = elevationAtPointOn3DLine(merged3D, lng, lat);
    if (elevation === null) {
      return null;
    }
    heights.push(elevation);
  }

  return {
    heights,
    resolution: resolutionInMeters,
    targetResolution,
  };
}
