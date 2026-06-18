import type * as maplibregl from "maplibre-gl";
import {
  getLayoutViewportWidth,
  isMobileLayout,
  isRouteBottomSheetMode,
  readMobileBottomNavHeightPx,
  readMobileFlyoutBottomSheetHeightPx,
  readRouteBottomSheetHeightPx,
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
 * covered by a bottom sheet.
 */
export function panMapToCenterFeatureInVisibleArea(
  map: maplibregl.Map,
  lngLat: [number, number],
  animate = true,
): boolean {
  const mapContainer = map.getContainer();
  const mapHeight = mapContainer.clientHeight;

  if (!isMobileLayout(getLayoutViewportWidth())) {
    return false;
  }

  const bottomNavHeight = readMobileBottomNavHeightPx(mapContainer);
  const bottomOverlayHeight = Math.max(
    readRouteBottomSheetHeightPx(mapContainer),
    readMobileFlyoutBottomSheetHeightPx(mapContainer),
  );

  if (bottomOverlayHeight <= 0) {
    return false;
  }

  const visibleHeight = mapHeight - bottomOverlayHeight - bottomNavHeight;
  if (visibleHeight <= 0) {
    return false;
  }

  const targetY = visibleHeight / 2;
  const featurePoint = map.project(lngLat);
  const panY = targetY - featurePoint.y;

  if (Math.abs(panY) < 8) {
    return false;
  }

  map.panBy([0, -panY], { duration: animate ? 300 : 0 });
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
