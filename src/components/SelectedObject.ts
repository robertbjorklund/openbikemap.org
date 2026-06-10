import type { ObjectIDType } from "../AppConfig";

export interface PanConfig {
  animate: boolean;
}

export interface SelectedObject {
  id: string;
  idType: ObjectIDType;
  showInfo: boolean;
  pan?: PanConfig;
}
