import * as maplibregl from "maplibre-gl";
import { MTB_TRAIL_LINE_COLOR_EXPRESSION } from "../types/MtbTrailColors";
import { ROUTE_NETWORK_LINE_COLOR_EXPRESSION } from "../types/RouteNetwork";

const TRAIL_LINE_LAYER_IDS = new Set(["trails", "trails-label"]);
const ROUTE_LINE_LAYER_IDS = new Set(["routes", "routes-label"]);

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

function withPaintColor(
  layer: maplibregl.LayerSpecification,
  property: "line-color" | "text-color",
  color: maplibregl.ExpressionSpecification,
): maplibregl.LayerSpecification {
  if (layer.type === "line" && property === "line-color") {
    return {
      ...layer,
      paint: { ...layer.paint, "line-color": color },
    };
  }
  if (layer.type === "symbol" && property === "text-color") {
    return {
      ...layer,
      paint: { ...layer.paint, "text-color": color },
    };
  }
  return layer;
}

/** Bake trail/route colors into the style (same rules as the filter swatches). */
export function applyPaintRulesToStyleLayers(
  layers: maplibregl.LayerSpecification[],
): maplibregl.LayerSpecification[] {
  const trailColor = trailLineColor();
  const routeColor = routeLineColor();

  return layers.map((layer) => {
    if (TRAIL_LINE_LAYER_IDS.has(layer.id)) {
      return withPaintColor(
        layer,
        layer.id.endsWith("-label") ? "text-color" : "line-color",
        trailColor,
      );
    }
    if (ROUTE_LINE_LAYER_IDS.has(layer.id)) {
      return withPaintColor(
        layer,
        layer.id.endsWith("-label") ? "text-color" : "line-color",
        routeColor,
      );
    }
    return layer;
  });
}

export function applyPaintRulesToMap(map: maplibregl.Map): void {
  if (!map.isStyleLoaded()) {
    return;
  }

  for (const layerId of TRAIL_LINE_LAYER_IDS) {
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

  for (const layerId of ROUTE_LINE_LAYER_IDS) {
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
