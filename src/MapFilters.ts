import type { BikeActivity } from "./types/BikeActivity";
import type { MtbScaleFilter } from "./types/BikeActivity";
import type { RouteNetworkFilter } from "./types/RouteNetwork";

export default interface MapFilters {
  hiddenActivities: BikeActivity[];
  hiddenMtbScales: MtbScaleFilter[];
  hiddenRouteNetworks: RouteNetworkFilter[];
}

export const defaultMapFilters: MapFilters = {
  hiddenActivities: [],
  hiddenMtbScales: [],
  hiddenRouteNetworks: [],
};
