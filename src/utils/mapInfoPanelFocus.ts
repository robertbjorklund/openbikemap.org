import type * as maplibregl from "maplibre-gl";
import {
  SIDE_PANEL_CONTENT_WIDTH,
  SIDE_PANEL_RAIL_WIDTH,
} from "../components/SidePanelControl";

/** Fly-out panel width in map-canvas pixel coordinates. */
export function sidePanelFlyoutWidthPx(mapContainer: HTMLElement): number {
  const openPanelWidth = Math.min(
    SIDE_PANEL_RAIL_WIDTH + SIDE_PANEL_CONTENT_WIDTH,
    mapContainer.clientWidth,
  );
  return Math.max(0, openPanelWidth - SIDE_PANEL_RAIL_WIDTH);
}

/**
 * When a map click would sit under the route fly-out panel, pan horizontally
 * by exactly the panel width so the map shifts right by the same amount.
 */
export function panMapIfClickUnderSidePanelFlyout(
  map: maplibregl.Map,
  clickX: number,
  animate = true,
): boolean {
  const flyoutWidth = sidePanelFlyoutWidthPx(map.getContainer());

  if (flyoutWidth === 0 || clickX >= flyoutWidth) {
    return false;
  }

  map.panBy([-flyoutWidth, 0], { duration: animate ? 300 : 0 });
  return true;
}
