import type { LineString, MultiLineString, Position } from "geojson";
import { FeatureType, type MapFeature } from "../../types/FeatureTypes";
import { getFeatureLengthMeters, positionDistanceMeters } from "../Length";
import { concatenateLineStrings } from "../geometryElevationPath";
import type { RouteGroupSelection } from "../../components/SelectedObject";
import type { WeatherSamplePoint } from "./weatherTypes";

export const WEATHER_SHORT_ROUTE_METERS = 30_000;
export const WEATHER_MEDIUM_ROUTE_METERS = 150_000;

/** Start/end closer than this → one forecast (loops, roundtrips). */
export const WEATHER_ENDPOINT_NEAR_METERS = 3_000;

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

function isCircularRoute(feature: MapFeature, endpoints: {
  start: Position;
  end: Position;
}): boolean {
  if (
    feature.properties.type === FeatureType.Route &&
    feature.properties.roundtrip === true
  ) {
    return true;
  }

  return (
    positionDistanceMeters(endpoints.start, endpoints.end) <
    WEATHER_ENDPOINT_NEAR_METERS
  );
}

function shouldSampleEndPoint(
  feature: MapFeature,
  lengthMeters: number,
  endpoints: { start: Position; end: Position },
): boolean {
  if (lengthMeters < WEATHER_SHORT_ROUTE_METERS) {
    return false;
  }
  return !isCircularRoute(feature, endpoints);
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
  return lengthMeters < WEATHER_MEDIUM_ROUTE_METERS;
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
  const points = [toSamplePoint("Start", endpoints.start)];

  if (shouldSampleEndPoint(feature, lengthMeters, endpoints)) {
    points.push(toSamplePoint("End", endpoints.end));
  }

  return points;
}
