import { MapStyle } from "../MapStyle";

import { MapMarker } from "../MapMarker";

import {

  BikeActivity,

  type MtbScaleFilter,

  type MtbImbaScaleFilter,

} from "../types/BikeActivity";

import type { RouteNetworkFilter } from "../types/RouteNetwork";

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

  openMtbFilter(): void;

  openRoutesFilter(): void;

  openRoute(): void;

  closeRoutePanel(): void;

  openSettings(): void;

  openCredits(): void;

  openCookiePolicy(): void;

  openAboutInfo(): void;

  closeAboutInfo(): void;

  setMapStyle(style: MapStyle): void;

  setUnitSystem(unitSystem: UnitSystem): void;

  toggleActivity(activity: BikeActivity): void;

  toggleMtbScale(scale: MtbScaleFilter): void;

  toggleMtbImbaScale(scale: MtbImbaScaleFilter): void;

  toggleRouteNetwork(network: RouteNetworkFilter): void;

  showInfo(id: string, options?: ShowInfoOptions): void;

  selectRouteStage(stageId: string): void;

  showRouteGroupOverview(): void;

  hideInfo(): void;

  addMarker(marker: MapMarker): void;

}

