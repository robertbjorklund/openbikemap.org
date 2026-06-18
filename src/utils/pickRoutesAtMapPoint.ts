import type * as maplibregl from "maplibre-gl";
import { isFeatureVisibleUnderFilters } from "../components/MapFilterRules";
import { mapFeatureFromMvt } from "../components/MvtFeature";
import type MapFilters from "../MapFilters";
import { formatRouteDisplayTitle } from "../types/RouteNetwork";
import { FeatureType, type MapFeature, type RouteFeature } from "../types/FeatureTypes";

/** Pick radius around the click — helps when lines are stacked tightly. */
export const ROUTE_PICK_RADIUS_PX = 10;

const BICYCLE_NETWORK_SORT_ORDER: Record<string, number> = {
  icn: 0,
  ncn: 1,
  rcn: 2,
  lcn: 3,
};

/** One entry per logical route (groupId when present, otherwise feature id). */
export function routeDisambiguationKey(feature: MapFeature): string {
  if (feature.properties.type !== FeatureType.Route) {
    return feature.properties.id;
  }
  return feature.properties.groupId ?? feature.properties.id;
}

function networkSortOrder(feature: RouteFeature): number {
  if (feature.properties.osmRouteType === "mtb") {
    return 100;
  }
  const network = feature.properties.network?.trim().toLowerCase();
  if (network && network in BICYCLE_NETWORK_SORT_ORDER) {
    return BICYCLE_NETWORK_SORT_ORDER[network];
  }
  return 50;
}

export function sortRouteDisambiguationCandidates(
  features: MapFeature[],
): MapFeature[] {
  const routes = features.filter(
    (feature): feature is RouteFeature =>
      feature.properties.type === FeatureType.Route,
  );
  const sortedRoutes = [...routes].sort((left, right) => {
    const orderDelta = networkSortOrder(left) - networkSortOrder(right);
    if (orderDelta !== 0) {
      return orderDelta;
    }
    const leftTitle = formatRouteDisplayTitle(
      left.properties.name,
      left.properties.ref,
    );
    const rightTitle = formatRouteDisplayTitle(
      right.properties.name,
      right.properties.ref,
    );
    return leftTitle.localeCompare(rightTitle, undefined, {
      sensitivity: "base",
    });
  });
  return sortedRoutes;
}

function pickBBoxFromPoint(
  point: maplibregl.PointLike,
  radiusPx: number,
): [maplibregl.PointLike, maplibregl.PointLike] {
  const x = "x" in point ? point.x : point[0];
  const y = "y" in point ? point.y : point[1];
  return [
    [x - radiusPx, y - radiusPx],
    [x + radiusPx, y + radiusPx],
  ];
}

export function pickDistinctRoutesAtPoint(
  map: maplibregl.Map,
  point: maplibregl.PointLike,
  routeLayerIds: string[],
  filters: MapFilters,
  radiusPx = ROUTE_PICK_RADIUS_PX,
): MapFeature[] {
  if (routeLayerIds.length === 0) {
    return [];
  }

  const hits = map.queryRenderedFeatures(pickBBoxFromPoint(point, radiusPx), {
    layers: routeLayerIds,
  });

  const seen = new Set<string>();
  const candidates: MapFeature[] = [];

  for (const hit of hits) {
    const sourceLayer = (
      hit.layer as { "source-layer"?: string } | undefined
    )?.["source-layer"];
    if (sourceLayer !== "routes") {
      continue;
    }

    const mapFeature = mapFeatureFromMvt(
      hit as maplibregl.MapGeoJSONFeature,
      sourceLayer,
    );
    if (
      !mapFeature ||
      mapFeature.properties.type !== FeatureType.Route ||
      !isFeatureVisibleUnderFilters(mapFeature, filters)
    ) {
      continue;
    }

    const key = routeDisambiguationKey(mapFeature);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    candidates.push(mapFeature);
  }

  return sortRouteDisambiguationCandidates(candidates);
}
