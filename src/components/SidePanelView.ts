export type SidePanelView =
  | "mapLayers"
  | "filter"
  | "route"
  | "settings"
  | "credits"
  | "about"
  | null;

export type SidePanelNavView = Exclude<SidePanelView, null>;
