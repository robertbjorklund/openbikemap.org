import {
  EUROVELO_ROUTE_COLOR,
  EUROVELO_ROUTE_MATCH_EXPRESSION,
  isEuroVeloRoute,
  parseEuroVeloRouteNumber,
} from "./EuroVelo";
import { AppConfig } from "../AppConfig";

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

/** Colors from openbikedata-processor RouteNetworkColors */
export const ROUTE_NETWORK_COLORS: Record<RouteNetwork, string> = {
  [RouteNetwork.Icn]: "#0d47a1",
  [RouteNetwork.Ncn]: "#d32f2f",
  [RouteNetwork.Rcn]: "#42a5f5",
  [RouteNetwork.Lcn]: "#2e7d32",
};

export const ROUTE_NETWORK_DEFAULT_COLOR = "#7b1fa2";

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

export function routeNetworkColor(
  network: string | null | undefined,
  ref?: string | null,
  name?: string | null,
): string {
  if (isEuroVeloRoute(ref, name, network)) {
    return EUROVELO_ROUTE_COLOR;
  }
  if (!network) {
    return ROUTE_NETWORK_DEFAULT_COLOR;
  }
  if (network in ROUTE_NETWORK_COLORS) {
    return ROUTE_NETWORK_COLORS[network as RouteNetwork];
  }
  return ROUTE_NETWORK_DEFAULT_COLOR;
}

/** Digits-only label for route shield icons; null when no numeric ref exists. */
export function parseRouteShieldNumber(
  ref: string | null | undefined,
  name?: string | null,
): string | null {
  const euroVelo = parseEuroVeloRouteNumber(ref, name);
  if (euroVelo) {
    return euroVelo;
  }

  if (!ref) {
    return null;
  }

  const trimmed = ref.trim();
  if (/^\d{1,4}$/.test(trimmed)) {
    return trimmed;
  }

  const compound = trimmed.match(/^(\d{1,4})\s*[;,/]/);
  if (compound) {
    return compound[1];
  }

  return null;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Remove route number from a display name when it is shown in the shield icon. */
function stripRouteNumberFromName(name: string, shieldNumber: string): string {
  const number = escapeRegExp(shieldNumber);
  return name
    .trim()
    .replace(new RegExp(`\\s*\\(${number}\\)\\s*$`, "i"), "")
    .replace(new RegExp(`\\s*\\[${number}\\]\\s*$`, "i"), "")
    .replace(
      new RegExp(`^EuroVelo\\s*[-–]?\\s*${number}\\s*[-–:]\\s*`, "i"),
      "",
    )
    .replace(new RegExp(`^EuroVelo\\s*[-–]?\\s*${number}\\s*$`, "i"), "EuroVelo")
    .trim();
}

/** Route title for panels; omits the number when it is shown in the shield icon. */
export function formatRouteDisplayTitle(
  name: string | null | undefined,
  ref: string | null | undefined,
): string {
  const shieldNumber = parseRouteShieldNumber(ref, name);
  const trimmedName = name?.trim() || null;
  const trimmedRef = ref?.trim() || null;

  if (trimmedName && shieldNumber) {
    const withoutNumber = stripRouteNumberFromName(trimmedName, shieldNumber);
    if (withoutNumber && withoutNumber !== shieldNumber) {
      return withoutNumber;
    }
  }

  if (trimmedName && (!shieldNumber || trimmedName !== shieldNumber)) {
    return trimmedName;
  }

  if (trimmedRef && (!shieldNumber || trimmedRef !== shieldNumber)) {
    return trimmedRef;
  }

  return AppConfig.untitledFeatureTitle;
}

/** MapLibre expression for route line color from OSM network tag */
export const ROUTE_NETWORK_LINE_COLOR_EXPRESSION = [
  "case",
  EUROVELO_ROUTE_MATCH_EXPRESSION,
  EUROVELO_ROUTE_COLOR,
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
