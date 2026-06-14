export type SidePanelView =
  | "mapLayers"
  | "filter"
  | "route"
  | "settings"
  | "credits"
  | "about"
  | "cookiePolicy"
  | null;

export type SidePanelNavView = Exclude<SidePanelView, null>;
