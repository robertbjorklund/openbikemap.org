import type { BikeActivity } from "./types/BikeActivity";
import type { MtbImbaScaleFilter, MtbScaleFilter } from "./types/BikeActivity";
import type { RouteNetworkFilter } from "./types/RouteNetwork";

export default interface MapFilters {
  hiddenActivities: BikeActivity[];
  hiddenMtbScales: MtbScaleFilter[];
  hiddenMtbImbaScales: MtbImbaScaleFilter[];
  hiddenRouteNetworks: RouteNetworkFilter[];
}

export const defaultMapFilters: MapFilters = {
  hiddenActivities: [],
  hiddenMtbScales: [],
  hiddenMtbImbaScales: [],
  hiddenRouteNetworks: [],
};
