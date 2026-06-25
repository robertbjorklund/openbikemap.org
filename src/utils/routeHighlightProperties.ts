import type * as maplibregl from "maplibre-gl";
import {
  FeatureType,
  type MapFeature,
  type RouteFeature,
  type RouteProperties,
  type TrailFeature,
  type TrailProperties,
} from "../types/FeatureTypes";
import { imbaTrailColor, mtbTrailColor } from "../types/MtbTrailColors";
import { featuresForHighlight } from "./FeatureGroup";
import { mtbRouteColor } from "../types/MtbRouteColors";
import { routeNetworkColor } from "../types/RouteNetwork";

/** MapLibre filter: draw route overlay layers. */
export const ROUTE_HIGHLIGHT_OVERLAY_FILTER: maplibregl.ExpressionFilterSpecification =
  ["==", ["get", "type"], FeatureType.Route];

/** MapLibre filter: STS (non-IMBA) trail overlay layers. */
export const STS_TRAIL_HIGHLIGHT_OVERLAY_FILTER: maplibregl.ExpressionFilterSpecification =
  [
    "all",
    ["==", ["get", "type"], FeatureType.Trail],
    ["!=", ["get", "isImbaTrail"], true],
  ];

/** MapLibre filter: IMBA trail overlay layers. */
export const IMBA_TRAIL_HIGHLIGHT_OVERLAY_FILTER: maplibregl.ExpressionFilterSpecification =
  [
    "all",
    ["==", ["get", "type"], FeatureType.Trail],
    ["==", ["get", "isImbaTrail"], true],
  ];

/** MapLibre filter: route + trail label overlay layers. */
export const HIGHLIGHT_LABEL_OVERLAY_FILTER: maplibregl.ExpressionFilterSpecification =
  [
    "in",
    ["get", "type"],
    ["literal", [FeatureType.Route, FeatureType.Trail]],
  ];

export function computeRouteHighlightColor(
  properties: RouteProperties,
): string {
  if (properties.osmRouteType === "mtb") {
    return mtbRouteColor(properties.osmColour);
  }
  return routeNetworkColor(
    properties.network,
    properties.ref,
    properties.name,
  );
}

export function computeTrailHighlightColor(
  properties: TrailProperties,
): string {
  if (properties.mtbScaleImba !== null) {
    return imbaTrailColor(properties.mtbScaleImba);
  }
  return mtbTrailColor(properties.mtbScale);
}

export function normalizeRouteHighlightFeature(
  feature: MapFeature,
): MapFeature {
  if (feature.properties.type !== FeatureType.Route) {
    return feature;
  }

  const props = feature.properties as RouteProperties & {
    color?: string | null;
  };

  return {
    ...feature,
    properties: {
      ...props,
      type: FeatureType.Route,
      osmRouteType: props.osmRouteType ?? "bicycle",
      color: props.color ?? computeRouteHighlightColor(props),
    },
  } as RouteFeature;
}

export function normalizeTrailHighlightFeature(
  feature: MapFeature,
): MapFeature {
  if (feature.properties.type !== FeatureType.Trail) {
    return feature;
  }

  const props = feature.properties as TrailProperties & {
    color?: string | null;
    isImbaTrail?: boolean;
  };
  const isImbaTrail = props.mtbScaleImba !== null;

  return {
    ...feature,
    properties: {
      ...props,
      type: FeatureType.Trail,
      isImbaTrail,
      color: props.color ?? computeTrailHighlightColor(props),
    },
  } as TrailFeature;
}

function normalizeHighlightFeature(feature: MapFeature): MapFeature {
  if (feature.properties.type === FeatureType.Route) {
    return normalizeRouteHighlightFeature(feature);
  }
  if (feature.properties.type === FeatureType.Trail) {
    return normalizeTrailHighlightFeature(feature);
  }
  return feature;
}

/** Max line parts in highlight GeoJSON before skipping per-line split. */
const HIGHLIGHT_MAX_LINE_PARTS = 150;

export function normalizeHighlightFeatures(
  features: MapFeature[],
): MapFeature[] {
  const parts = features.flatMap((feature) => featuresForHighlight(feature));
  if (parts.length > HIGHLIGHT_MAX_LINE_PARTS) {
    return features.map((feature) => normalizeHighlightFeature(feature));
  }
  return parts.map((part) => normalizeHighlightFeature(part));
}
