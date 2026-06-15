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
  /** Show bicycle routes on the map (checkbox selections preserved when off). */
  showRoutes: boolean;
}

export const defaultMapFilters: MapFilters = {
  hiddenActivities: [],
  hiddenMtbScales: [],
  hiddenMtbImbaScales: [],
  hiddenRouteNetworks: [],
  showMtbSts: true,
  showMtbImba: true,
  showRoutes: true,
};
