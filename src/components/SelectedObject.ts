import type { ObjectIDType } from "../AppConfig";
import type { MapFeature, RouteFeature } from "../types/FeatureTypes";

export type { ObjectIDType };

export interface PanConfig {
  animate: boolean;
  lngLat: [number, number];
  clickX: number;
}

export interface RouteGroupSelection {
  groupId: string;
  stageFeatures: RouteFeature[];
  wholeRouteFeature: RouteFeature;
  activeStageId: string | null;
}

export interface SelectedObject {
  id: string;
  idType: ObjectIDType;
  showInfo: boolean;
  feature?: MapFeature;
  routeGroup?: RouteGroupSelection;
  pan?: PanConfig;
}
