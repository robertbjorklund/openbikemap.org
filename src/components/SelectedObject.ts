import type { ObjectIDType } from "../AppConfig";
import type { MapFeature } from "../types/FeatureTypes";

export type { ObjectIDType };

export interface PanConfig {
  animate: boolean;
}

export interface SelectedObject {
  id: string;
  idType: ObjectIDType;
  showInfo: boolean;
  feature?: MapFeature;
  pan?: PanConfig;
}
