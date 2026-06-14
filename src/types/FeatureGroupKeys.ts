import {
  FeatureType,
  TRAIL_CATEGORY_LABELS,
  type MapFeature,
  type RouteProperties,
  type TrailCategory,
  type TrailProperties,
} from "./FeatureTypes";

const GENERIC_TRAIL_NAMES = new Set(Object.values(TRAIL_CATEGORY_LABELS));

export interface RouteGroupKey {
  nameKey: string | null;
  refKey: string | null;
  /** OSM network tag; required to match when grouping by ref (ref 18 on ncn ≠ lcn). */
  networkKey: string | null;
}

export interface TrailGroupKey {
  nameKey: string | null;
  refKey: string | null;
  category: TrailCategory;
}

export interface FeatureGroupKey {
  /** When set, all features with this groupId belong to the same logical group. */
  groupId?: string;
  trailGroupKey?: TrailGroupKey;
  routeGroupKey?: RouteGroupKey;
}

/** Strip trailing parenthetical suffix, e.g. "Kustlinjen (29)" → "kustlinjen". */
export function normalizeRouteName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s*\([^)]*\)\s*$/, "")
    .trim();
}

export function normalizeRouteRef(ref: string): string {
  return normalizeRouteName(ref) || ref.trim().toLowerCase();
}

export function normalizeTrailName(name: string): string {
  return name.trim().toLowerCase();
}

export function normalizeTrailRef(ref: string): string {
  return ref.trim().toLowerCase();
}

export function isGenericTrailName(name: string): boolean {
  return GENERIC_TRAIL_NAMES.has(name);
}

const GENERIC_ROUTE_NAMES = new Set([
  "bicycle route",
  "bike route",
  "cycle route",
  "cykelled",
  "cykelväg",
  "cykelbana",
]);

export function isGenericRouteName(name: string): boolean {
  return GENERIC_ROUTE_NAMES.has(normalizeRouteName(name));
}

function routeNetworkKey(network: string | null | undefined): string | null {
  return network?.trim().toLowerCase() || null;
}

export function getRouteGroupKeyFromProperties(
  properties: RouteProperties,
): RouteGroupKey | null {
  const nameKey =
    properties.name?.trim() && !isGenericRouteName(properties.name)
      ? normalizeRouteName(properties.name) || null
      : null;
  const refKey = properties.ref
    ? normalizeRouteRef(properties.ref) || null
    : null;
  const networkKey = refKey ? routeNetworkKey(properties.network) : null;
  if (!nameKey && !refKey) {
    return null;
  }
  return { nameKey, refKey, networkKey };
}

export function getTrailGroupKeyFromProperties(
  properties: TrailProperties,
): TrailGroupKey | null {
  const nameKey =
    properties.name?.trim() &&
    !isGenericTrailName(properties.name.trim())
      ? normalizeTrailName(properties.name)
      : null;
  const refKey = properties.ref?.trim()
    ? normalizeTrailRef(properties.ref)
    : null;
  if (!nameKey && !refKey) {
    return null;
  }
  return { nameKey, refKey, category: properties.category };
}

export function getRouteGroupKey(feature: MapFeature): RouteGroupKey | null {
  if (feature.properties.type !== FeatureType.Route) {
    return null;
  }
  return getRouteGroupKeyFromProperties(feature.properties);
}

export function getTrailGroupKey(feature: MapFeature): TrailGroupKey | null {
  if (feature.properties.type !== FeatureType.Trail) {
    return null;
  }
  return getTrailGroupKeyFromProperties(feature.properties);
}

export function matchesRouteGroupKey(
  properties: RouteProperties,
  key: RouteGroupKey,
): boolean {
  const name =
    properties.name?.trim() && !isGenericRouteName(properties.name)
      ? normalizeRouteName(properties.name) || null
      : null;
  const ref = properties.ref ? normalizeRouteRef(properties.ref) || null : null;
  const network = routeNetworkKey(properties.network);
  if (key.nameKey && name === key.nameKey) {
    return true;
  }
  if (key.refKey && ref === key.refKey && network === key.networkKey) {
    if (
      network === "icn" ||
      network === "ncn" ||
      (key.nameKey !== null && name === key.nameKey)
    ) {
      return true;
    }
  }
  return false;
}

export function matchesTrailGroupKey(
  properties: TrailProperties,
  key: TrailGroupKey,
): boolean {
  if (properties.category !== key.category) {
    return false;
  }
  const name =
    properties.name?.trim() && !isGenericTrailName(properties.name.trim())
      ? normalizeTrailName(properties.name)
      : null;
  const ref = properties.ref?.trim()
    ? normalizeTrailRef(properties.ref)
    : null;
  if (key.nameKey && name === key.nameKey) {
    return true;
  }
  if (key.refKey && ref === key.refKey) {
    return true;
  }
  return false;
}

export function getFeatureGroupKey(feature: MapFeature): FeatureGroupKey | null {
  if (feature.properties.groupId) {
    return { groupId: feature.properties.groupId };
  }

  if (feature.properties.type === FeatureType.Trail) {
    const trailGroupKey = getTrailGroupKeyFromProperties(feature.properties);
    if (!trailGroupKey) {
      return null;
    }
    return { trailGroupKey };
  }

  if (feature.properties.type === FeatureType.Route) {
    const routeGroupKey = getRouteGroupKeyFromProperties(feature.properties);
    if (!routeGroupKey) {
      return null;
    }
    return { routeGroupKey };
  }

  return null;
}

export function matchesGroupKey(
  feature: MapFeature,
  key: FeatureGroupKey,
): boolean {
  if (key.groupId) {
    return feature.properties.groupId === key.groupId;
  }

  const { properties } = feature;

  if (properties.type === FeatureType.Trail && key.trailGroupKey) {
    return matchesTrailGroupKey(properties, key.trailGroupKey);
  }

  if (properties.type === FeatureType.Route && key.routeGroupKey) {
    return matchesRouteGroupKey(properties, key.routeGroupKey);
  }

  return false;
}

export function getRouteGroupSearchQueries(
  properties: RouteProperties,
): string[] {
  const queries = new Set<string>();
  const name = properties.name?.trim();
  if (name) {
    queries.add(name);
    const normalized = normalizeRouteName(name);
    if (normalized && normalized !== name.toLowerCase()) {
      queries.add(normalized);
    }
  }
  const ref = properties.ref?.trim();
  if (ref) {
    queries.add(ref);
  }
  return [...queries];
}

export function getTrailGroupSearchQueries(
  properties: TrailProperties,
): string[] {
  const queries = new Set<string>();
  const name = properties.name?.trim();
  if (name && !isGenericTrailName(name)) {
    queries.add(name);
  }
  const ref = properties.ref?.trim();
  if (ref) {
    queries.add(ref);
  }
  return [...queries];
}

export function getFeatureGroupSearchQueries(feature: MapFeature): string[] {
  if (feature.properties.type === FeatureType.Route) {
    return getRouteGroupSearchQueries(feature.properties);
  }
  if (feature.properties.type === FeatureType.Trail) {
    return getTrailGroupSearchQueries(feature.properties);
  }
  return [];
}
