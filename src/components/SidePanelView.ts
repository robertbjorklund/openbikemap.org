export type SidePanelView =
  | "mtbFilter"
  | "imbaFilter"
  | "routesFilter"
  | "route"
  | "settings"
  | "about"
  | null;

export type SidePanelNavView = Exclude<SidePanelView, null>;
