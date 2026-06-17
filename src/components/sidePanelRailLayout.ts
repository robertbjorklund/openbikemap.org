/** Side rail width when the map fly-out panel is closed. */
export const SIDE_PANEL_RAIL_WIDTH_DESKTOP = 80;
export const SIDE_PANEL_RAIL_WIDTH_MOBILE = 56;
export const SIDE_PANEL_RAIL_MOBILE_BREAKPOINT_PX = 480;
export const SIDE_PANEL_RAIL_TAB_WIDTH = 28;

export const SIDE_PANEL_CONTENT_WIDTH_DESKTOP = 400;
export const SIDE_PANEL_CONTENT_WIDTH_MOBILE_MAX = 252;
export const SIDE_PANEL_CONTENT_WIDTH_MOBILE_RATIO = 0.72;

export const ROUTE_BOTTOM_SHEET_MAX_HEIGHT_PX = 320;
export const ROUTE_BOTTOM_SHEET_HEIGHT_RATIO = 0.42;

const STORAGE_KEY = "sidePanelRailExpanded";

/** Viewport width for layout breakpoints — must match CSS media queries, not map container width. */
export function getLayoutViewportWidth(): number {
  if (typeof window === "undefined") {
    return SIDE_PANEL_RAIL_WIDTH_DESKTOP;
  }
  return window.innerWidth;
}

/** Mobile route detail panel at the bottom while a feature stays selected on the map. */
export function isMobileRouteBottomSheetActive(
  hasRouteSelection: boolean,
  viewportWidth: number = typeof window !== "undefined"
    ? window.innerWidth
    : SIDE_PANEL_RAIL_WIDTH_DESKTOP,
): boolean {
  return hasRouteSelection && isSidePanelRailCollapsible(viewportWidth);
}

/** @deprecated Use isMobileRouteBottomSheetActive — kept for map pan helpers. */
export function isRouteBottomSheetMode(
  sidePanelView: string | null,
  viewportWidth: number = typeof window !== "undefined"
    ? window.innerWidth
    : SIDE_PANEL_RAIL_WIDTH_DESKTOP,
): boolean {
  return sidePanelView === "route" && isSidePanelRailCollapsible(viewportWidth);
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

export function readRouteBottomSheetHeightPx(
  mapContainer: HTMLElement,
): number {
  const raw = getComputedStyle(mapContainer)
    .getPropertyValue("--route-bottom-sheet-height")
    .trim();
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function isSidePanelRailCollapsible(
  viewportWidth: number = typeof window !== "undefined"
    ? window.innerWidth
    : SIDE_PANEL_RAIL_WIDTH_DESKTOP,
): boolean {
  return viewportWidth <= SIDE_PANEL_RAIL_MOBILE_BREAKPOINT_PX;
}

/** Mobile: expanded rail visible. Desktop: always treated as expanded. */
export function getSidePanelRailExpanded(): boolean {
  if (!isSidePanelRailCollapsible()) {
    return true;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) {
      return true;
    }
    return stored === "true";
  } catch {
    return true;
  }
}

export function setSidePanelRailExpanded(expanded: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(expanded));
  } catch {
    // ignore quota / private mode
  }
}

export function getSidePanelRailWidth(
  viewportWidth: number = typeof window !== "undefined"
    ? window.innerWidth
    : SIDE_PANEL_RAIL_WIDTH_DESKTOP,
): number {
  if (!isSidePanelRailCollapsible(viewportWidth)) {
    return SIDE_PANEL_RAIL_WIDTH_DESKTOP;
  }

  if (!getSidePanelRailExpanded()) {
    return 0;
  }

  return SIDE_PANEL_RAIL_WIDTH_MOBILE;
}

/** Fly-out content width; narrower on mobile so a map strip stays visible. */
export function getSidePanelFlyoutContentWidth(
  viewportWidth: number = typeof window !== "undefined"
    ? window.innerWidth
    : SIDE_PANEL_RAIL_WIDTH_DESKTOP,
): number {
  if (!isSidePanelRailCollapsible(viewportWidth)) {
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
