import { MapStyle } from "../MapStyle";

import { MapMarker } from "../MapMarker";

import {

  BikeActivity,

  type MtbScaleFilter,

  RoutePavedBucket,

} from "../types/BikeActivity";

import type { MapFeature } from "../types/FeatureTypes";

import type { ObjectIDType } from "./SelectedObject";

import type { UnitSystem } from "./utils/UnitHelpers";



export interface ShowInfoOptions {

  idType?: ObjectIDType;

  clickedFeature?: MapFeature;

  relatedFeatures?: MapFeature[];

}



export default interface EventBus {

  openSidebar(): void;

  closeSidebar(): void;

  closeMenu(): void;

  backToLayers(): void;

  openMapLayers(): void;

  openFilter(): void;

  openRoute(): void;

  closeRoutePanel(): void;

  openSettings(): void;

  openCredits(): void;

  openAboutInfo(): void;

  closeAboutInfo(): void;

  setMapStyle(style: MapStyle): void;

  setUnitSystem(unitSystem: UnitSystem): void;

  toggleActivity(activity: BikeActivity): void;

  toggleMtbScale(scale: MtbScaleFilter): void;

  setMinTrailLength(meters: number): void;

  toggleRoutePavedBucket(bucket: RoutePavedBucket): void;

  showInfo(id: string, options?: ShowInfoOptions): void;

  hideInfo(): void;

  addMarker(marker: MapMarker): void;

}

