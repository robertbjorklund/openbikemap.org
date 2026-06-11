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

/** Routes in tiles without a network tag */
export const ROUTE_NETWORK_NOT_SET = "not_set" as const;

export type RouteNetworkFilter = RouteNetwork | typeof ROUTE_NETWORK_NOT_SET;

export const ROUTE_NETWORK_FILTERS: readonly RouteNetworkFilter[] = [
  RouteNetwork.Icn,
  RouteNetwork.Ncn,
  RouteNetwork.Rcn,
  RouteNetwork.Lcn,
  ROUTE_NETWORK_NOT_SET,
];

export function routeNetworkColor(network: string | null | undefined): string {
  if (!network) {
    return ROUTE_NETWORK_DEFAULT_COLOR;
  }
  if (network in ROUTE_NETWORK_COLORS) {
    return ROUTE_NETWORK_COLORS[network as RouteNetwork];
  }
  return ROUTE_NETWORK_DEFAULT_COLOR;
}

/** MapLibre expression for route line color from OSM network tag */
export const ROUTE_NETWORK_LINE_COLOR_EXPRESSION = [
  "case",
  ["has", "network"],
  [
    "match",
    ["get", "network"],
    RouteNetwork.Icn,
    ROUTE_NETWORK_COLORS[RouteNetwork.Icn],
    RouteNetwork.Ncn,
    ROUTE_NETWORK_COLORS[RouteNetwork.Ncn],
    RouteNetwork.Rcn,
    ROUTE_NETWORK_COLORS[RouteNetwork.Rcn],
    RouteNetwork.Lcn,
    ROUTE_NETWORK_COLORS[RouteNetwork.Lcn],
    ROUTE_NETWORK_DEFAULT_COLOR,
  ],
  ROUTE_NETWORK_DEFAULT_COLOR,
] as const;
