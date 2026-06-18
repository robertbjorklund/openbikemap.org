/** Side rail width when the map fly-out panel is closed (desktop only). */
export const SIDE_PANEL_RAIL_WIDTH_DESKTOP = 80;
export const SIDE_PANEL_RAIL_WIDTH_MOBILE = 56;
export const SIDE_PANEL_RAIL_MOBILE_BREAKPOINT_PX = 480;

export const MOBILE_BOTTOM_NAV_HEIGHT_PX = 56;

export const SIDE_PANEL_CONTENT_WIDTH_DESKTOP = 400;
export const SIDE_PANEL_CONTENT_WIDTH_MOBILE_MAX = 252;
export const SIDE_PANEL_CONTENT_WIDTH_MOBILE_RATIO = 0.72;

export const ROUTE_BOTTOM_SHEET_MAX_HEIGHT_PX = 320;
export const ROUTE_BOTTOM_SHEET_HEIGHT_RATIO = 0.42;
export const ROUTE_BOTTOM_SHEET_COLLAPSED_HEIGHT_PX = 56;

export const MOBILE_FLYOUT_BOTTOM_SHEET_MAX_HEIGHT_PX = 560;
export const MOBILE_FLYOUT_BOTTOM_SHEET_HEIGHT_RATIO = 0.84;
/** Gap between a fly-out bottom sheet and a collapsed route bar underneath. */
export const MOBILE_FLYOUT_ABOVE_ROUTE_GAP_PX = 8;

/** Viewport width for layout breakpoints — must match CSS media queries, not map container width. */
export function getLayoutViewportWidth(): number {
  if (typeof window === "undefined") {
    return SIDE_PANEL_RAIL_WIDTH_DESKTOP;
  }
  return window.innerWidth;
}

export function isMobileLayout(
  viewportWidth: number = typeof window !== "undefined"
    ? window.innerWidth
    : SIDE_PANEL_RAIL_WIDTH_DESKTOP,
): boolean {
  return viewportWidth <= SIDE_PANEL_RAIL_MOBILE_BREAKPOINT_PX;
}

/** @deprecated Use isMobileLayout */
export function isSidePanelRailCollapsible(
  viewportWidth: number = typeof window !== "undefined"
    ? window.innerWidth
    : SIDE_PANEL_RAIL_WIDTH_DESKTOP,
): boolean {
  return isMobileLayout(viewportWidth);
}

/** Mobile route detail panel at the bottom while a feature stays selected on the map. */
export function isMobileRouteBottomSheetActive(
  hasRouteSelection: boolean,
  viewportWidth: number = typeof window !== "undefined"
    ? window.innerWidth
    : SIDE_PANEL_RAIL_WIDTH_DESKTOP,
): boolean {
  return hasRouteSelection && isMobileLayout(viewportWidth);
}

/** @deprecated Use isMobileRouteBottomSheetActive — kept for map pan helpers. */
export function isRouteBottomSheetMode(
  sidePanelView: string | null,
  viewportWidth: number = typeof window !== "undefined"
    ? window.innerWidth
    : SIDE_PANEL_RAIL_WIDTH_DESKTOP,
): boolean {
  return sidePanelView === "route" && isMobileLayout(viewportWidth);
}

export function getRouteBottomSheetHeightPx(
  viewportHeight: number = typeof window !== "undefined"
    ? window.innerHeight
    : 800,
): number {
  return Math.min(
    ROUTE_BOTTOM_SHEET_MAX_HEIGHT_PX,
    Math.round(viewportHeight * ROUTE_BOTTOM_SHEET_HEIGHT_RATIO),
  );
}

export function getMobileFlyoutBottomSheetHeightPx(
  viewportHeight: number = typeof window !== "undefined"
    ? window.innerHeight
    : 800,
  bottomInset = 0,
): number {
  const availableHeight = Math.max(0, viewportHeight - bottomInset);
  const target = Math.min(
    MOBILE_FLYOUT_BOTTOM_SHEET_MAX_HEIGHT_PX,
    Math.round(viewportHeight * MOBILE_FLYOUT_BOTTOM_SHEET_HEIGHT_RATIO),
  );
  return Math.min(target, availableHeight);
}

export function getMobileFlyoutBottomInsetPx(
  hasCollapsedRouteBar: boolean,
): number {
  if (!hasCollapsedRouteBar) {
    return 0;
  }
  return (
    ROUTE_BOTTOM_SHEET_COLLAPSED_HEIGHT_PX + MOBILE_FLYOUT_ABOVE_ROUTE_GAP_PX
  );
}

export function readMobileFlyoutBottomSheetHeightPx(
  mapContainer: HTMLElement,
): number {
  const raw = getComputedStyle(mapContainer)
    .getPropertyValue("--mobile-flyout-bottom-sheet-height")
    .trim();
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function readRouteBottomSheetHeightPx(
  mapContainer: HTMLElement,
): number {
  const raw = getComputedStyle(mapContainer)
    .getPropertyValue("--route-bottom-sheet-height")
    .trim();
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function readMobileBottomNavHeightPx(
  mapContainer: HTMLElement,
): number {
  const raw = getComputedStyle(mapContainer)
    .getPropertyValue("--mobile-bottom-nav-height")
    .trim();
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function getMobileBottomNavHeightPx(
  viewportWidth: number = typeof window !== "undefined"
    ? window.innerWidth
    : SIDE_PANEL_RAIL_WIDTH_DESKTOP,
): number {
  return isMobileLayout(viewportWidth) ? MOBILE_BOTTOM_NAV_HEIGHT_PX : 0;
}

export function getSidePanelRailWidth(
  viewportWidth: number = typeof window !== "undefined"
    ? window.innerWidth
    : SIDE_PANEL_RAIL_WIDTH_DESKTOP,
): number {
  if (isMobileLayout(viewportWidth)) {
    return 0;
  }
  return SIDE_PANEL_RAIL_WIDTH_DESKTOP;
}

/** Fly-out content width; narrower on mobile so a map strip stays visible. */
export function getSidePanelFlyoutContentWidth(
  viewportWidth: number = typeof window !== "undefined"
    ? window.innerWidth
    : SIDE_PANEL_RAIL_WIDTH_DESKTOP,
): number {
  if (!isMobileLayout(viewportWidth)) {
    return SIDE_PANEL_CONTENT_WIDTH_DESKTOP;
  }

  return Math.min(
    SIDE_PANEL_CONTENT_WIDTH_MOBILE_MAX,
    Math.round(viewportWidth * SIDE_PANEL_CONTENT_WIDTH_MOBILE_RATIO),
  );
}

/** Content overlay width in map-container pixels (excludes the icon rail). */
export function sidePanelFlyoutWidthPx(mapContainer: HTMLElement): number {
  const viewportWidth = getLayoutViewportWidth();
  if (isMobileLayout(viewportWidth)) {
    return 0;
  }
  const railWidth = getSidePanelRailWidth(viewportWidth);
  const contentWidth = getSidePanelFlyoutContentWidth(viewportWidth);
  const openPanelWidth = Math.min(
    railWidth + contentWidth,
    mapContainer.clientWidth + railWidth,
  );
  return Math.max(0, openPanelWidth - railWidth);
}

/** @deprecated Use getSidePanelRailWidth() — desktop default for static imports. */
export const SIDE_PANEL_RAIL_WIDTH = SIDE_PANEL_RAIL_WIDTH_DESKTOP;
