/** Side rail width when the map fly-out panel is closed. */
export const SIDE_PANEL_RAIL_WIDTH_DESKTOP = 80;
export const SIDE_PANEL_RAIL_WIDTH_MOBILE = 56;
export const SIDE_PANEL_RAIL_MOBILE_BREAKPOINT_PX = 480;
export const SIDE_PANEL_RAIL_TAB_WIDTH = 28;

const STORAGE_KEY = "sidePanelRailExpanded";

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
      return false;
    }
    return stored === "true";
  } catch {
    return false;
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

/** @deprecated Use getSidePanelRailWidth() — desktop default for static imports. */
export const SIDE_PANEL_RAIL_WIDTH = SIDE_PANEL_RAIL_WIDTH_DESKTOP;
