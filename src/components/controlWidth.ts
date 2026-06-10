import * as maplibregl from "maplibre-gl";
import { SIDE_PANEL_WIDTH } from "./SidePanelControl";

export default function controlWidth(map: maplibregl.Map) {
  const sidePanelOpen = map
    .getContainer()
    .classList.contains("side-panel-visible");
  const leftOffset = sidePanelOpen ? SIDE_PANEL_WIDTH + 12 : 0;
  const margins = 20 + leftOffset;
  const width = map.getCanvasContainer().offsetWidth - margins;
  const maxWidth = 400;
  return width > maxWidth ? maxWidth : width;
}
