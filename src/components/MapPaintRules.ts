import * as maplibregl from "maplibre-gl";
import {
  IMBA_TRAIL_LINE_COLOR_EXPRESSION,
  MTB_TRAIL_LINE_COLOR_EXPRESSION,
} from "../types/MtbTrailColors";
import { ROUTE_NETWORK_LINE_COLOR_EXPRESSION } from "../types/RouteNetwork";

const TRAIL_STS_LINE_LAYER_IDS = new Set(["trails", "trails-label"]);
const TRAIL_IMBA_LINE_LAYER_IDS = new Set(["trails-imba"]);
const TRAIL_DASHED_LINE_LAYER_IDS = new Set([
  "trails",
  "trails-casing",
  "trails-imba",
]);
const MTB_TRAIL_DASHARRAY: [number, number] = [1, 2];
/** Retired layer — hide if present in cached tile styles */
const LEGACY_IMBA_SYMBOL_LAYER_ID = "trails-imba-symbols";
const ROUTE_LINE_LAYER_IDS = new Set(["routes", "routes-label"]);

function trailLineColor(): maplibregl.ExpressionSpecification {
  return JSON.parse(
    JSON.stringify(MTB_TRAIL_LINE_COLOR_EXPRESSION),
  ) as maplibregl.ExpressionSpecification;
}

function imbaTrailLineColor(): maplibregl.ExpressionSpecification {
  return JSON.parse(
    JSON.stringify(IMBA_TRAIL_LINE_COLOR_EXPRESSION),
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

function withTrailDash(
  layer: maplibregl.LayerSpecification,
): maplibregl.LayerSpecification {
  if (layer.type !== "line" || !TRAIL_DASHED_LINE_LAYER_IDS.has(layer.id)) {
    return layer;
  }
  return {
    ...layer,
    paint: { ...layer.paint, "line-dasharray": MTB_TRAIL_DASHARRAY },
  };
}

/** Bake trail/route colors into the style (same rules as the filter swatches). */
export function applyPaintRulesToStyleLayers(
  layers: maplibregl.LayerSpecification[],
): maplibregl.LayerSpecification[] {
  const trailColor = trailLineColor();
  const imbaColor = imbaTrailLineColor();
  const routeColor = routeLineColor();

  return layers.map((layer) => {
    if (layer.id === LEGACY_IMBA_SYMBOL_LAYER_ID) {
      return {
        ...layer,
        layout: { ...layer.layout, visibility: "none" as const },
      };
    }
    let updated = layer;
    if (TRAIL_STS_LINE_LAYER_IDS.has(layer.id)) {
      updated = withPaintColor(
        updated,
        layer.id.endsWith("-label") ? "text-color" : "line-color",
        trailColor,
      );
    }
    if (TRAIL_IMBA_LINE_LAYER_IDS.has(layer.id)) {
      updated = withPaintColor(updated, "line-color", imbaColor);
    }
    if (ROUTE_LINE_LAYER_IDS.has(layer.id)) {
      updated = withPaintColor(
        updated,
        layer.id.endsWith("-label") ? "text-color" : "line-color",
        routeColor,
      );
    }
    return withTrailDash(updated);
  });
}

export function applyPaintRulesToMap(map: maplibregl.Map): void {
  if (!map.isStyleLoaded()) {
    return;
  }

  for (const layerId of TRAIL_DASHED_LINE_LAYER_IDS) {
    if (!map.getLayer(layerId)) {
      continue;
    }
    map.setPaintProperty(layerId, "line-dasharray", MTB_TRAIL_DASHARRAY);
  }

  for (const layerId of TRAIL_STS_LINE_LAYER_IDS) {
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

  for (const layerId of TRAIL_IMBA_LINE_LAYER_IDS) {
    if (!map.getLayer(layerId)) {
      continue;
    }
    map.setPaintProperty(layerId, "line-color", imbaTrailLineColor());
  }

  if (map.getLayer(LEGACY_IMBA_SYMBOL_LAYER_ID)) {
    map.setLayoutProperty(LEGACY_IMBA_SYMBOL_LAYER_ID, "visibility", "none");
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
