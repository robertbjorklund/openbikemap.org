import { MapStyle } from "../MapStyle";

import { MapMarker } from "../MapMarker";

import {

  BikeActivity,

  type MtbScaleFilter,

  type MtbImbaScaleFilter,

} from "../types/BikeActivity";

import type { RouteNetworkFilter } from "../types/RouteNetwork";

import type { MapFeature } from "../types/FeatureTypes";

import type { AppPanelTab } from "./AppPanelTab";

import type { ObjectIDType } from "./SelectedObject";

import type { UnitSystem } from "./utils/UnitHelpers";



export interface ShowInfoOptions {

  idType?: ObjectIDType;

  clickedFeature?: MapFeature;

  relatedFeatures?: MapFeature[];

  /** Map click position — used to avoid covering the trail with the info panel. */
  focusLngLat?: [number, number];

  focusClickX?: number;

  /** Fit the map to the feature bounds when opening the detail panel. */
  fitToMap?: boolean;

}



export default interface EventBus {

  openSidebar(): void;

  closeSidebar(): void;

  closeMenu(): void;

  openMtbFilter(): void;

  openImbaFilter(): void;

  openRoutesFilter(): void;

  openRoute(): void;

  closeRoutePanel(): void;

  openSettings(): void;

  openAboutInfo(): void;

  setAppPanelTab(tab: AppPanelTab): void;

  closeAboutInfo(): void;

  setMapStyle(style: MapStyle): void;

  setUnitSystem(unitSystem: UnitSystem): void;

  toggleActivity(activity: BikeActivity): void;

  toggleMtbStsGroup(): void;

  toggleMtbImbaGroup(): void;

  toggleMtbScale(scale: MtbScaleFilter): void;

  toggleMtbImbaScale(scale: MtbImbaScaleFilter): void;

  showAllMtbScales(): void;

  hideAllMtbScales(): void;

  showAllMtbImbaScales(): void;

  hideAllMtbImbaScales(): void;

  toggleRoutesGroup(): void;

  toggleBicycleRoutesGroup(): void;

  toggleMtbRoutesGroup(): void;

  toggleRouteNetwork(network: RouteNetworkFilter): void;

  showAllRouteNetworks(): void;

  hideAllRouteNetworks(): void;

  showInfo(id: string, options?: ShowInfoOptions): void;

  selectRouteStage(stageId: string): void;

  showRouteGroupOverview(): void;

  hideInfo(): void;

  /** Close the detail panel but keep the map selection and route rail indicator. */
  collapseInfoPanel(): void;

  addMarker(marker: MapMarker): void;

}

