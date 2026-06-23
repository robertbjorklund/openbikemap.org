import type * as maplibregl from "maplibre-gl";
import {
  FeatureType,
  type MapFeature,
  type RouteFeature,
  type RouteProperties,
} from "../types/FeatureTypes";
import { featuresForHighlight } from "./FeatureGroup";
import { mtbRouteColor } from "../types/MtbRouteColors";
import { routeNetworkColor } from "../types/RouteNetwork";

/** MapLibre filter: draw route overlay layers (not trails). */
export const ROUTE_HIGHLIGHT_OVERLAY_FILTER: maplibregl.ExpressionFilterSpecification =
  ["==", ["get", "type"], FeatureType.Route];

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

export function normalizeHighlightFeatures(
  features: MapFeature[],
): MapFeature[] {
  return features.flatMap((feature) =>
    featuresForHighlight(feature).map((part) =>
      normalizeRouteHighlightFeature(part),
    ),
  );
}
