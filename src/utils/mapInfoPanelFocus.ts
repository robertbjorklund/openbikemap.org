import maplibregl from "maplibre-gl";
import {
  getLayoutViewportWidth,
  getRouteBottomSheetHeightPx,
  getSidePanelRailWidth,
  isMobileLayout,
  isRouteBottomSheetMode,
  readMobileBottomNavHeightPx,
  readMobileFlyoutBottomSheetHeightPx,
  readRouteBottomSheetHeightPx,
  sidePanelFlyoutWidthPx,
} from "../components/sidePanelRailLayout";
import type { MapFeature } from "../types/FeatureTypes";

const FIT_MARGIN_PX = 48;
const FIT_TOP_UI_PX = 56;
const SEARCH_FIT_DURATION_MS = 2000;
const SEARCH_FIT_MAX_ZOOM_LOCAL = 14;
/** Below this span (km) cap zoom for short local trails. */
const SEARCH_FIT_LOCAL_SPAN_KM = 8;

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function boundsSpanKilometers(bounds: maplibregl.LngLatBounds): number {
  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();
  const latMid = (ne.lat + sw.lat) / 2;
  const kmPerDegLat = 111.32;
  const kmPerDegLng = kmPerDegLat * Math.cos((latMid * Math.PI) / 180);
  const dLat = Math.abs(ne.lat - sw.lat) * kmPerDegLat;
  const dLng = Math.abs(ne.lng - sw.lng) * kmPerDegLng;
  return Math.max(dLat, dLng);
}

function collectLineCoords(feature: MapFeature): [number, number][] {
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

  return coords;
}

export function featureLngLatBounds(
  feature: MapFeature,
): maplibregl.LngLatBounds | null {
  const coords = collectLineCoords(feature);
  if (coords.length === 0) {
    return null;
  }

  const bounds = new maplibregl.LngLatBounds(coords[0], coords[0]);
  for (const coord of coords) {
    bounds.extend(coord);
  }
  return bounds;
}

/** Bbox center of a line feature — e.g. search or URL deep links without a click point. */
export function featureFocusLngLat(feature: MapFeature): [number, number] | null {
  const bounds = featureLngLatBounds(feature);
  if (!bounds) {
    return null;
  }
  const center = bounds.getCenter();
  return [center.lng, center.lat];
}

export function featureFitGeometryKey(feature: MapFeature): string {
  const coords = collectLineCoords(feature);
  return String(coords.length);
}

export function getMapFitPadding(
  mapContainer: HTMLElement,
): maplibregl.PaddingOptions {
  const viewportWidth = getLayoutViewportWidth();

  if (isMobileLayout(viewportWidth)) {
    const bottomNav = readMobileBottomNavHeightPx(mapContainer);
    const bottomSheet = Math.max(
      readRouteBottomSheetHeightPx(mapContainer),
      getRouteBottomSheetHeightPx(),
    );
    return {
      top: FIT_MARGIN_PX + FIT_TOP_UI_PX,
      bottom: bottomSheet + bottomNav + FIT_MARGIN_PX,
      left: FIT_MARGIN_PX,
      right: FIT_MARGIN_PX,
    };
  }

  const leftOverlay =
    getSidePanelRailWidth(viewportWidth) + sidePanelFlyoutWidthPx(mapContainer);

  return {
    top: FIT_MARGIN_PX + FIT_TOP_UI_PX,
    bottom: FIT_MARGIN_PX,
    left: leftOverlay + FIT_MARGIN_PX,
    right: FIT_MARGIN_PX,
  };
}

/** Pan/zoom so a trail or route fits in the visible map area (search, deep links). */
export function fitMapToFeature(
  map: maplibregl.Map,
  feature: MapFeature,
  animate = true,
): boolean {
  const bounds = featureLngLatBounds(feature);
  if (!bounds) {
    return false;
  }

  const mapContainer = map.getContainer();
  const padding = getMapFitPadding(mapContainer);
  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();
  const isPointLike =
    Math.abs(ne.lng - sw.lng) < 1e-9 && Math.abs(ne.lat - sw.lat) < 1e-9;

  if (isPointLike) {
    const center = bounds.getCenter();
    map.flyTo({
      center,
      zoom: SEARCH_FIT_MAX_ZOOM_LOCAL,
      duration: animate ? SEARCH_FIT_DURATION_MS : 0,
      easing: easeInOutCubic,
    });
    return true;
  }

  const spanKm = boundsSpanKilometers(bounds);
  const fitOptions: maplibregl.FitBoundsOptions = {
    padding,
    duration: animate ? SEARCH_FIT_DURATION_MS : 0,
    easing: easeInOutCubic,
  };
  if (spanKm < SEARCH_FIT_LOCAL_SPAN_KM) {
    fitOptions.maxZoom = SEARCH_FIT_MAX_ZOOM_LOCAL;
  }

  map.fitBounds(bounds, fitOptions);
  return true;
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
