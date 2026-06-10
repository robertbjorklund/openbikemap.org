/** OSM bicycle route network tags on relation routes (routes MVT layer). */
export enum RouteNetwork {
  Icn = "icn",
  Ncn = "ncn",
  Rcn = "rcn",
  Lcn = "lcn",
}

export const ROUTE_NETWORK_LABELS: Record<RouteNetwork, string> = {
  [RouteNetwork.Icn]: "International (EuroVelo)",
  [RouteNetwork.Ncn]: "National (e.g. Sverigeleden)",
  [RouteNetwork.Rcn]: "Regional",
  [RouteNetwork.Lcn]: "Local",
};

/** Colors from openbikedata-processor MapboxGLFormatter.networkColor */
export const ROUTE_NETWORK_COLORS: Record<RouteNetwork, string> = {
  [RouteNetwork.Icn]: "#b71c1c",
  [RouteNetwork.Ncn]: "#c62828",
  [RouteNetwork.Rcn]: "#e65100",
  [RouteNetwork.Lcn]: "#2e7d32",
};

export const ROUTE_NETWORK_DEFAULT_COLOR = "#1565c0";
