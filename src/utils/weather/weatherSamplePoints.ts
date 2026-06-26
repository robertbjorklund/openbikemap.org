import turfLength from "@turf/length";
import turfLineSliceAlong from "@turf/line-slice-along";
import type { Feature, LineString, MultiLineString, Position } from "geojson";
import { FeatureType, type MapFeature } from "../../types/FeatureTypes";
import { getFeatureLengthMeters } from "../Length";
import { concatenateLineStrings } from "../geometryElevationPath";
import type { RouteGroupSelection } from "../../components/SelectedObject";
import type { WeatherSamplePoint } from "./weatherTypes";

export const WEATHER_MAX_ROUTE_METERS = 150_000;

function midpointAlongLine(line: LineString): Position | null {
  if (line.coordinates.length < 2) {
    return null;
  }

  const routeFeature: Feature<LineString> = {
    type: "Feature",
    geometry: line,
    properties: {},
  };

  const lengthKm = turfLength(routeFeature, { units: "kilometers" });
  if (lengthKm <= 0) {
    return line.coordinates[0];
  }

  const slice = turfLineSliceAlong(routeFeature, 0, lengthKm / 2, {
    units: "kilometers",
  });
  const coords = slice.geometry.coordinates;
  return coords[coords.length - 1] ?? line.coordinates[0];
}

function midpointCoord(
  geometry: LineString | MultiLineString,
): Position | null {
  const line = concatenateLineStrings([geometry]);
  if (!line) {
    return null;
  }
  return midpointAlongLine(line);
}

function toSamplePoint(coord: Position): WeatherSamplePoint {
  return { label: "", lat: coord[1], lng: coord[0] };
}

/** Hide weather on multi-stage route overview (e.g. Sverigeleden). */
export function shouldShowFeatureWeather(
  feature: MapFeature,
  routeGroup?: RouteGroupSelection,
): boolean {
  if (
    routeGroup &&
    !routeGroup.activeStageId &&
    routeGroup.stageFeatures.length > 1
  ) {
    return false;
  }

  if (feature.properties.type !== FeatureType.Route) {
    return true;
  }

  const lengthMeters = getFeatureLengthMeters(feature) ?? 0;
  return lengthMeters < WEATHER_MAX_ROUTE_METERS;
}

/** One forecast at the lengthwise midpoint of the feature geometry. */
export function getWeatherSamplePoints(
  feature: MapFeature,
): WeatherSamplePoint[] {
  const coord = midpointCoord(feature.geometry);
  if (!coord) {
    return [];
  }

  return [toSamplePoint(coord)];
}
