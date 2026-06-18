import type { BikeActivity } from "./types/BikeActivity";
import type { MtbImbaScaleFilter, MtbScaleFilter } from "./types/BikeActivity";
import type { RouteNetworkFilter } from "./types/RouteNetwork";

export default interface MapFilters {
  hiddenActivities: BikeActivity[];
  hiddenMtbScales: MtbScaleFilter[];
  hiddenMtbImbaScales: MtbImbaScaleFilter[];
  hiddenRouteNetworks: RouteNetworkFilter[];
  /** Show STS trails on the map (checkbox selections preserved when off). */
  showMtbSts: boolean;
  /** Show IMBA trails on the map (checkbox selections preserved when off). */
  showMtbImba: boolean;
  /** Show signed bicycle network routes (route=bicycle). */
  showBicycleRoutes: boolean;
  /** Show named MTB route relations (route=mtb). */
  showMtbRoutes: boolean;
}

export const defaultMapFilters: MapFilters = {
  hiddenActivities: [],
  hiddenMtbScales: [],
  hiddenMtbImbaScales: [],
  hiddenRouteNetworks: [],
  showMtbSts: true,
  showMtbImba: true,
  showBicycleRoutes: true,
  showMtbRoutes: true,
};
