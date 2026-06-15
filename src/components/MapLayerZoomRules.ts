import type * as maplibregl from "maplibre-gl";
import {
  isOpenBikeMapLineLayerId,
  OPENBIKEMAP_LINE_MIN_ZOOM,
} from "../constants/OpenBikeMapLayerZoom";

export function applyOpenBikeMapLineMinZoomToStyleLayers(
  layers: maplibregl.LayerSpecification[],
): maplibregl.LayerSpecification[] {
  return layers.map((layer) => {
    if (!isOpenBikeMapLineLayerId(layer.id)) {
      return layer;
    }
    return { ...layer, minzoom: OPENBIKEMAP_LINE_MIN_ZOOM };
  });
}

export function applyOpenBikeMapLineMinZoomToMap(map: maplibregl.Map): void {
  if (!map.isStyleLoaded()) {
    return;
  }

  for (const layer of map.getStyle().layers ?? []) {
    if (!isOpenBikeMapLineLayerId(layer.id) || !map.getLayer(layer.id)) {
      continue;
    }
    map.setLayerZoomRange(
      layer.id,
      OPENBIKEMAP_LINE_MIN_ZOOM,
      layer.maxzoom ?? 24,
    );
  }
}
