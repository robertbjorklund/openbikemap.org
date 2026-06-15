import * as maplibregl from "maplibre-gl";
import { OPENBIKEMAP_LINE_MIN_ZOOM } from "../constants/OpenBikeMapLayerZoom";
import {
  IMBA_TRAIL_LINE_COLOR_EXPRESSION,
  MTB_TRAIL_LINE_COLOR_EXPRESSION,
  TRAIL_CASING_LINE_COLOR_EXPRESSION,
  TRAIL_IMBA_LINE_WIDTH_EXPRESSION,
  TRAIL_STS_CENTER_LINE_COLOR,
} from "../types/MtbTrailColors";
import { ROUTE_NETWORK_LINE_COLOR_EXPRESSION } from "../types/RouteNetwork";

const TRAIL_IMBA_LINE_LAYER_ID = "trails-imba";
/** Dashed IMBA lines only — STS uses solid double-line */
const TRAIL_DASHED_LINE_LAYER_IDS = new Set([TRAIL_IMBA_LINE_LAYER_ID]);
/** Path-like dashes — used on IMBA trails */
const MTB_TRAIL_DASHARRAY: [number, number] = [1, 1.5];
/** Retired layer — hide if present in cached tile styles */
const LEGACY_IMBA_SYMBOL_LAYER_ID = "trails-imba-symbols";

const ROUTE_CORE_LINE_LAYER_ID = "routes";
const ROUTE_CASING_LAYER_ID = "routes-casing";
const ROUTE_LABEL_LAYER_ID = "routes-label";
const ROUTE_LABEL_STRIPE_LAYER_ID = "routes-label-stripe";

const TRAIL_CORE_LINE_LAYER_ID = "trails";
const TRAIL_CASING_LAYER_ID = "trails-casing";
const TRAIL_LABEL_LAYER_ID = "trails-label";
const TRAIL_LABEL_STRIPE_LAYER_ID = "trails-label-stripe";

const LINE_CASING_COLOR = "#ffffff";
const LINE_CASING_OPACITY = 0.95;

const ROUTE_LINE_WIDTH: maplibregl.ExpressionSpecification = [
  "interpolate",
  ["linear"],
  ["zoom"],
  OPENBIKEMAP_LINE_MIN_ZOOM,
  1.2,
  10,
  2.2,
  14,
  4,
  16,
  4.5,
];

const ROUTE_CASING_LINE_WIDTH: maplibregl.ExpressionSpecification = [
  "interpolate",
  ["linear"],
  ["zoom"],
  OPENBIKEMAP_LINE_MIN_ZOOM,
  2.5,
  10,
  4.5,
  14,
  8,
  16,
  9,
];

const TRAIL_STS_CENTER_LINE_WIDTH: maplibregl.ExpressionSpecification = [
  "interpolate",
  ["linear"],
  ["zoom"],
  OPENBIKEMAP_LINE_MIN_ZOOM,
  0.8,
  10,
  1.2,
  14,
  2.5,
  16,
  3,
];

const TRAIL_CASING_LINE_WIDTH: maplibregl.ExpressionSpecification = [
  "interpolate",
  ["linear"],
  ["zoom"],
  OPENBIKEMAP_LINE_MIN_ZOOM,
  2,
  10,
  3,
  14,
  6.5,
  16,
  7,
];

const LABEL_TEXT_COLOR = "#212121";
const LABEL_OUTLINE_COLOR = "#ffffff";
const LABEL_OUTLINE_WIDTH = 1.75;
const LABEL_STRIPE_HALO_WIDTH = 5;

const TRAIL_DOUBLE_LINE_LAYOUT: maplibregl.LineLayerSpecification["layout"] = {
  "line-cap": "round",
  "line-join": "round",
};

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

function trailCasingLineColor(): maplibregl.ExpressionSpecification {
  return JSON.parse(
    JSON.stringify(TRAIL_CASING_LINE_COLOR_EXPRESSION),
  ) as maplibregl.ExpressionSpecification;
}

function imbaTrailLineWidth(): maplibregl.ExpressionSpecification {
  return JSON.parse(
    JSON.stringify(TRAIL_IMBA_LINE_WIDTH_EXPRESSION),
  ) as maplibregl.ExpressionSpecification;
}

function routeLineColor(): maplibregl.ExpressionSpecification {
  return JSON.parse(
    JSON.stringify(ROUTE_NETWORK_LINE_COLOR_EXPRESSION),
  ) as maplibregl.ExpressionSpecification;
}

function withCoreLineStyle(
  layer: maplibregl.LayerSpecification,
  layerId: string,
  color: maplibregl.ExpressionSpecification,
  width: maplibregl.ExpressionSpecification,
): maplibregl.LayerSpecification {
  if (layer.id !== layerId || layer.type !== "line") {
    return layer;
  }
  return {
    ...layer,
    paint: {
      ...layer.paint,
      "line-color": color,
      "line-width": width,
    },
  };
}

function withCasingStyle(
  layer: maplibregl.LayerSpecification,
  layerId: string,
  width: maplibregl.ExpressionSpecification,
  color: maplibregl.ExpressionSpecification | string = LINE_CASING_COLOR,
  solid = true,
): maplibregl.LayerSpecification {
  if (layer.id !== layerId || layer.type !== "line") {
    return layer;
  }
  const paint = { ...layer.paint } as Record<string, unknown>;
  if (solid) {
    delete paint["line-dasharray"];
  }
  return {
    ...layer,
    paint: {
      ...paint,
      "line-color": color,
      "line-width": width,
      "line-opacity": LINE_CASING_OPACITY,
    },
  };
}

function withLabelStripeStyle(
  layer: maplibregl.LayerSpecification,
  layerId: string,
  color: maplibregl.ExpressionSpecification,
): maplibregl.LayerSpecification {
  if (layer.id !== layerId || layer.type !== "symbol") {
    return layer;
  }
  return {
    ...layer,
    paint: {
      ...layer.paint,
      "text-color": color,
      "text-halo-color": color,
      "text-halo-width": LABEL_STRIPE_HALO_WIDTH,
    },
  };
}

function withLabelStyle(
  layer: maplibregl.LayerSpecification,
  layerId: string,
): maplibregl.LayerSpecification {
  if (layer.id !== layerId || layer.type !== "symbol") {
    return layer;
  }
  return {
    ...layer,
    paint: {
      ...layer.paint,
      "text-color": LABEL_TEXT_COLOR,
      "text-halo-color": LABEL_OUTLINE_COLOR,
      "text-halo-width": LABEL_OUTLINE_WIDTH,
    },
  };
}

function withStsCenterLineStyle(
  layer: maplibregl.LayerSpecification,
): maplibregl.LayerSpecification {
  if (layer.id !== TRAIL_CORE_LINE_LAYER_ID || layer.type !== "line") {
    return layer;
  }
  const paint = { ...layer.paint } as Record<string, unknown>;
  delete paint["line-dasharray"];
  return {
    ...layer,
    layout: { ...layer.layout, ...TRAIL_DOUBLE_LINE_LAYOUT },
    paint: {
      ...paint,
      "line-color": TRAIL_STS_CENTER_LINE_COLOR,
      "line-width": TRAIL_STS_CENTER_LINE_WIDTH,
    },
  };
}

function withStsOuterLineStyle(
  layer: maplibregl.LayerSpecification,
): maplibregl.LayerSpecification {
  if (layer.id !== TRAIL_CASING_LAYER_ID || layer.type !== "line") {
    return layer;
  }
  const paint = { ...layer.paint } as Record<string, unknown>;
  delete paint["line-dasharray"];
  return {
    ...layer,
    layout: { ...layer.layout, ...TRAIL_DOUBLE_LINE_LAYOUT },
    paint: {
      ...paint,
      "line-color": trailCasingLineColor(),
      "line-width": TRAIL_CASING_LINE_WIDTH,
      "line-opacity": LINE_CASING_OPACITY,
    },
  };
}

function mtbTrailDasharrayForLayer(
  layerId: string,
): number[] | null {
  if (layerId === TRAIL_IMBA_LINE_LAYER_ID) {
    return MTB_TRAIL_DASHARRAY;
  }
  return null;
}

function withTrailDash(
  layer: maplibregl.LayerSpecification,
): maplibregl.LayerSpecification {
  if (layer.type !== "line") {
    return layer;
  }
  const dasharray = mtbTrailDasharrayForLayer(layer.id);
  if (!dasharray) {
    return layer;
  }
  return {
    ...layer,
    paint: { ...layer.paint, "line-dasharray": dasharray },
  };
}

function applyRoutePaintRules(
  layer: maplibregl.LayerSpecification,
): maplibregl.LayerSpecification {
  const color = routeLineColor();
  return withLabelStyle(
    withLabelStripeStyle(
      withCasingStyle(
        withCoreLineStyle(
          layer,
          ROUTE_CORE_LINE_LAYER_ID,
          color,
          ROUTE_LINE_WIDTH,
        ),
        ROUTE_CASING_LAYER_ID,
        ROUTE_CASING_LINE_WIDTH,
      ),
      ROUTE_LABEL_STRIPE_LAYER_ID,
      color,
    ),
    ROUTE_LABEL_LAYER_ID,
  );
}

function applyTrailPaintRules(
  layer: maplibregl.LayerSpecification,
): maplibregl.LayerSpecification {
  const color = trailLineColor();
  let updated = withLabelStyle(
    withLabelStripeStyle(
      withStsOuterLineStyle(
        withStsCenterLineStyle(
          layer,
        ),
      ),
      TRAIL_LABEL_STRIPE_LAYER_ID,
      color,
    ),
    TRAIL_LABEL_LAYER_ID,
  );
  updated = withCoreLineStyle(
    updated,
    TRAIL_IMBA_LINE_LAYER_ID,
    imbaTrailLineColor(),
    imbaTrailLineWidth(),
  );
  return updated;
}

/** Bake trail/route colors into the style (same rules as the filter swatches). */
export function applyPaintRulesToStyleLayers(
  layers: maplibregl.LayerSpecification[],
): maplibregl.LayerSpecification[] {
  return layers.map((layer) => {
    if (layer.id === LEGACY_IMBA_SYMBOL_LAYER_ID) {
      return {
        ...layer,
        layout: { ...layer.layout, visibility: "none" as const },
      };
    }
    return withTrailDash(applyTrailPaintRules(applyRoutePaintRules(layer)));
  });
}

function applyLineFeaturePaintRulesToMap(
  map: maplibregl.Map,
  casingLayerId: string,
  coreLayerId: string,
  casingWidth: maplibregl.ExpressionSpecification,
  coreWidth: maplibregl.ExpressionSpecification,
  coreColor: maplibregl.ExpressionSpecification,
): void {
  if (map.getLayer(casingLayerId)) {
    map.setPaintProperty(casingLayerId, "line-color", LINE_CASING_COLOR);
    map.setPaintProperty(casingLayerId, "line-width", casingWidth);
    map.setPaintProperty(casingLayerId, "line-opacity", LINE_CASING_OPACITY);
  }

  if (map.getLayer(coreLayerId)) {
    map.setPaintProperty(coreLayerId, "line-color", coreColor);
    map.setPaintProperty(coreLayerId, "line-width", coreWidth);
  }
}

function applyLabelPaintRulesToMap(
  map: maplibregl.Map,
  stripeLayerId: string,
  labelLayerId: string,
  stripeColor: maplibregl.ExpressionSpecification,
): void {
  if (map.getLayer(stripeLayerId)) {
    map.setPaintProperty(stripeLayerId, "text-color", stripeColor);
    map.setPaintProperty(stripeLayerId, "text-halo-color", stripeColor);
    map.setPaintProperty(stripeLayerId, "text-halo-width", LABEL_STRIPE_HALO_WIDTH);
  }

  if (map.getLayer(labelLayerId)) {
    map.setPaintProperty(labelLayerId, "text-color", LABEL_TEXT_COLOR);
    map.setPaintProperty(labelLayerId, "text-halo-color", LABEL_OUTLINE_COLOR);
    map.setPaintProperty(labelLayerId, "text-halo-width", LABEL_OUTLINE_WIDTH);
  }
}

function applyRoutePaintRulesToMap(map: maplibregl.Map): void {
  const color = routeLineColor();
  applyLineFeaturePaintRulesToMap(
    map,
    ROUTE_CASING_LAYER_ID,
    ROUTE_CORE_LINE_LAYER_ID,
    ROUTE_CASING_LINE_WIDTH,
    ROUTE_LINE_WIDTH,
    color,
  );
  applyLabelPaintRulesToMap(
    map,
    ROUTE_LABEL_STRIPE_LAYER_ID,
    ROUTE_LABEL_LAYER_ID,
    color,
  );
}

function clearLineDasharray(
  map: maplibregl.Map,
  layerId: string,
): void {
  if (!map.getLayer(layerId)) {
    return;
  }
  const mapWithPaintRemoval = map as maplibregl.Map & {
    removePaintProperty(id: string, property: string): maplibregl.Map;
  };
  mapWithPaintRemoval.removePaintProperty(layerId, "line-dasharray");
}

function applyTrailDoubleLineLayout(map: maplibregl.Map, layerId: string): void {
  if (!map.getLayer(layerId)) {
    return;
  }
  map.setLayoutProperty(layerId, "line-cap", "round");
  map.setLayoutProperty(layerId, "line-join", "round");
}

function applyTrailPaintRulesToMap(map: maplibregl.Map): void {
  const color = trailLineColor();

  if (map.getLayer(TRAIL_CASING_LAYER_ID)) {
    map.setPaintProperty(TRAIL_CASING_LAYER_ID, "line-color", trailCasingLineColor());
    map.setPaintProperty(TRAIL_CASING_LAYER_ID, "line-width", TRAIL_CASING_LINE_WIDTH);
    map.setPaintProperty(TRAIL_CASING_LAYER_ID, "line-opacity", LINE_CASING_OPACITY);
    clearLineDasharray(map, TRAIL_CASING_LAYER_ID);
    applyTrailDoubleLineLayout(map, TRAIL_CASING_LAYER_ID);
  }

  if (map.getLayer(TRAIL_CORE_LINE_LAYER_ID)) {
    map.setPaintProperty(
      TRAIL_CORE_LINE_LAYER_ID,
      "line-color",
      TRAIL_STS_CENTER_LINE_COLOR,
    );
    map.setPaintProperty(
      TRAIL_CORE_LINE_LAYER_ID,
      "line-width",
      TRAIL_STS_CENTER_LINE_WIDTH,
    );
    clearLineDasharray(map, TRAIL_CORE_LINE_LAYER_ID);
    applyTrailDoubleLineLayout(map, TRAIL_CORE_LINE_LAYER_ID);
  }

  if (map.getLayer(TRAIL_IMBA_LINE_LAYER_ID)) {
    map.setPaintProperty(TRAIL_IMBA_LINE_LAYER_ID, "line-color", imbaTrailLineColor());
    map.setPaintProperty(TRAIL_IMBA_LINE_LAYER_ID, "line-width", imbaTrailLineWidth());
    map.setPaintProperty(
      TRAIL_IMBA_LINE_LAYER_ID,
      "line-dasharray",
      MTB_TRAIL_DASHARRAY,
    );
  }

  applyLabelPaintRulesToMap(
    map,
    TRAIL_LABEL_STRIPE_LAYER_ID,
    TRAIL_LABEL_LAYER_ID,
    color,
  );
}

export function applyPaintRulesToMap(map: maplibregl.Map): void {
  if (!map.isStyleLoaded()) {
    return;
  }

  for (const layerId of TRAIL_DASHED_LINE_LAYER_IDS) {
    if (!map.getLayer(layerId)) {
      continue;
    }
    const dasharray = mtbTrailDasharrayForLayer(layerId);
    if (dasharray) {
      map.setPaintProperty(layerId, "line-dasharray", dasharray);
    }
  }

  if (map.getLayer(LEGACY_IMBA_SYMBOL_LAYER_ID)) {
    map.setLayoutProperty(LEGACY_IMBA_SYMBOL_LAYER_ID, "visibility", "none");
  }

  applyRoutePaintRulesToMap(map);
  applyTrailPaintRulesToMap(map);
}
