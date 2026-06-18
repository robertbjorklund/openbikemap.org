export type SidePanelView =
  | "mtbFilter"
  | "imbaFilter"
  | "routesFilter"
  | "route"
  | "app"
  | null;

export type SidePanelNavView = Exclude<SidePanelView, null>;
