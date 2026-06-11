import * as maplibregl from "maplibre-gl";
import { SIDE_PANEL_RAIL_WIDTH } from "./SidePanelControl";

export default function controlWidth(map: maplibregl.Map) {
  const leftOffset = SIDE_PANEL_RAIL_WIDTH + 12;
  const margins = 20 + leftOffset;
  const width = map.getCanvasContainer().offsetWidth - margins;
  const maxWidth = 400;
  return width > maxWidth ? maxWidth : width;
}
