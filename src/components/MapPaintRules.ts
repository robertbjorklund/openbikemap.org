import * as maplibregl from "maplibre-gl";
import { MTB_TRAIL_LINE_COLOR_EXPRESSION } from "../types/MtbTrailColors";
import { ROUTE_NETWORK_LINE_COLOR_EXPRESSION } from "../types/RouteNetwork";

const TRAIL_LINE_LAYERS = ["trails", "trails-label"] as const;
const ROUTE_LINE_LAYERS = ["routes", "routes-label"] as const;

function trailLineColor(): maplibregl.ExpressionSpecification {
  return JSON.parse(
    JSON.stringify(MTB_TRAIL_LINE_COLOR_EXPRESSION),
  ) as maplibregl.ExpressionSpecification;
}

function routeLineColor(): maplibregl.ExpressionSpecification {
  return JSON.parse(
    JSON.stringify(ROUTE_NETWORK_LINE_COLOR_EXPRESSION),
  ) as maplibregl.ExpressionSpecification;
}

export function applyPaintRulesToMap(map: maplibregl.Map): void {
  if (!map.isStyleLoaded()) {
    return;
  }

  for (const layerId of TRAIL_LINE_LAYERS) {
    if (!map.getLayer(layerId)) {
      continue;
    }
    const color = trailLineColor();
    if (layerId.endsWith("-label")) {
      map.setPaintProperty(layerId, "text-color", color);
    } else {
      map.setPaintProperty(layerId, "line-color", color);
    }
  }

  for (const layerId of ROUTE_LINE_LAYERS) {
    if (!map.getLayer(layerId)) {
      continue;
    }
    const color = routeLineColor();
    if (layerId.endsWith("-label")) {
      map.setPaintProperty(layerId, "text-color", color);
    } else {
      map.setPaintProperty(layerId, "line-color", color);
    }
  }
}
