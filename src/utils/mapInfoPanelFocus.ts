import type * as maplibregl from "maplibre-gl";
import {
  getLayoutViewportWidth,
  isRouteBottomSheetMode,
  isSidePanelRailCollapsible,
  readRouteBottomSheetHeightPx,
  sidePanelFlyoutWidthPx,
} from "../components/sidePanelRailLayout";
import type { MapFeature } from "../types/FeatureTypes";

/** Bbox center of a line feature — used to center the route in the visible map area. */
export function featureFocusLngLat(feature: MapFeature): [number, number] | null {
  const { geometry } = feature;
  const coords: [number, number][] = [];

  if (geometry.type === "LineString") {
    for (const c of geometry.coordinates) {
      coords.push(c as [number, number]);
    }
  } else if (geometry.type === "MultiLineString") {
    for (const line of geometry.coordinates) {
      for (const c of line) {
        coords.push(c as [number, number]);
      }
    }
  }

  if (coords.length === 0) {
    return null;
  }

  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  for (const [lng, lat] of coords) {
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }

  return [(minLng + maxLng) / 2, (minLat + maxLat) / 2];
}

/**
 * On mobile, pan so the selected feature sits in the center of the map area not
 * covered by the route bottom sheet (or the left fly-out on other panels).
 */
export function panMapToCenterFeatureInVisibleArea(
  map: maplibregl.Map,
  lngLat: [number, number],
  animate = true,
): boolean {
  const mapContainer = map.getContainer();
  const mapWidth = mapContainer.clientWidth;
  const mapHeight = mapContainer.clientHeight;

  if (!isSidePanelRailCollapsible(getLayoutViewportWidth())) {
    return false;
  }

  const bottomSheetHeight = readRouteBottomSheetHeightPx(mapContainer);
  let panX = 0;
  let panY = 0;

  if (bottomSheetHeight > 0) {
    const visibleHeight = mapHeight - bottomSheetHeight;
    if (visibleHeight <= 0) {
      return false;
    }
    const targetY = visibleHeight / 2;
    const featurePoint = map.project(lngLat);
    panY = targetY - featurePoint.y;
  } else {
    const flyoutWidth = sidePanelFlyoutWidthPx(mapContainer);
    if (flyoutWidth === 0) {
      return false;
    }
    const visibleWidth = mapWidth - flyoutWidth;
    if (visibleWidth <= 0) {
      return false;
    }
    const targetX = flyoutWidth + visibleWidth / 2;
    const featurePoint = map.project(lngLat);
    panX = targetX - featurePoint.x;
  }

  if (Math.abs(panX) < 8 && Math.abs(panY) < 8) {
    return false;
  }

  map.panBy([-panX, -panY], { duration: animate ? 300 : 0 });
  return true;
}

/** @deprecated Use panMapToCenterFeatureInVisibleArea */
export function panMapToCenterFeatureInVisibleStrip(
  map: maplibregl.Map,
  lngLat: [number, number],
  animate = true,
): boolean {
  return panMapToCenterFeatureInVisibleArea(map, lngLat, animate);
}

export function isMapInRouteBottomSheetMode(map: maplibregl.Map): boolean {
  return readRouteBottomSheetHeightPx(map.getContainer()) > 0;
}

export { isRouteBottomSheetMode };
