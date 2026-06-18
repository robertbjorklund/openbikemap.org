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

/** Bbox center of a line feature — e.g. search or URL deep links without a click point. */
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

const VISIBLE_AREA_MARGIN_PX = 16;
const MIN_PAN_PX = 8;
/** Cap dramatic pans when the focus point is far from the click (legacy data). */
const MAX_PAN_FRACTION_OF_MAP_HEIGHT = 0.4;

/**
 * On mobile, nudge the map just enough to keep `lngLat` (usually the map click)
 * above a bottom sheet — without re-centering on the whole route bbox.
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
  if (visibleHeight <= VISIBLE_AREA_MARGIN_PX * 2) {
    return false;
  }

  const maxY = visibleHeight - VISIBLE_AREA_MARGIN_PX;
  const minY = VISIBLE_AREA_MARGIN_PX;
  const point = map.project(lngLat);

  if (point.y <= maxY && point.y >= minY) {
    return false;
  }

  let panY = 0;
  if (point.y > maxY) {
    panY = point.y - maxY;
  } else if (point.y < minY) {
    panY = point.y - minY;
  }

  if (Math.abs(panY) < MIN_PAN_PX) {
    return false;
  }

  const maxPan = mapHeight * MAX_PAN_FRACTION_OF_MAP_HEIGHT;
  if (Math.abs(panY) > maxPan) {
    panY = Math.sign(panY) * maxPan;
  }

  map.panBy([0, panY], { duration: animate ? 300 : 0 });
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
