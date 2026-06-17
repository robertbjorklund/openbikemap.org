import * as maplibregl from "maplibre-gl";

import { getSidePanelRailWidth } from "./sidePanelRailLayout";

export default function controlWidth(map: maplibregl.Map) {
  const leftOffset = getSidePanelRailWidth() + 12;

  const margins = 20 + leftOffset;

  const width = map.getCanvasContainer().offsetWidth - margins;

  const maxWidth = 400;

  return width > maxWidth ? maxWidth : width;

}


