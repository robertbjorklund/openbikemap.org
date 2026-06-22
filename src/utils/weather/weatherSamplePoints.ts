import type { LineString, MultiLineString, Position } from "geojson";
import type { MapFeature } from "../../types/FeatureTypes";
import { getFeatureLengthMeters } from "../Length";
import { concatenateLineStrings } from "../geometryElevationPath";
import type { WeatherSamplePoint } from "./weatherTypes";

export const WEATHER_SHORT_ROUTE_METERS = 30_000;
export const WEATHER_MEDIUM_ROUTE_METERS = 150_000;

function endpointCoords(geometry: LineString | MultiLineString): {
  start: Position;
  end: Position;
} | null {
  const line = concatenateLineStrings([geometry]);
  if (!line || line.coordinates.length < 2) {
    return null;
  }
  const coords = line.coordinates;
  return {
    start: coords[0],
    end: coords[coords.length - 1],
  };
}

function toSamplePoint(label: string, coord: Position): WeatherSamplePoint {
  return { label, lat: coord[1], lng: coord[0] };
}

/** Forecast sample location(s) from route/trail length. */
export function getWeatherSamplePoints(
  feature: MapFeature,
): WeatherSamplePoint[] {
  const endpoints = endpointCoords(feature.geometry);
  if (!endpoints) {
    return [];
  }

  const lengthMeters = getFeatureLengthMeters(feature) ?? 0;

  if (lengthMeters < WEATHER_MEDIUM_ROUTE_METERS) {
    const points = [toSamplePoint("Start", endpoints.start)];
    if (lengthMeters >= WEATHER_SHORT_ROUTE_METERS) {
      points.push(toSamplePoint("End", endpoints.end));
    }
    return points;
  }

  return [toSamplePoint("Start", endpoints.start)];
}

export function getStageStartPoint(
  feature: MapFeature,
): WeatherSamplePoint | null {
  const endpoints = endpointCoords(feature.geometry);
  if (!endpoints) {
    return null;
  }
  return toSamplePoint("Start", endpoints.start);
}
