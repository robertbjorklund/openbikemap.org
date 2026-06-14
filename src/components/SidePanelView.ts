export type SidePanelView =
  | "mapLayers"
  | "mtbFilter"
  | "routesFilter"
  | "route"
  | "settings"
  | "credits"
  | "about"
  | "cookiePolicy"
  | null;

export type SidePanelNavView = Exclude<SidePanelView, null>;
