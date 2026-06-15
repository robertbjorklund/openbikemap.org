import {
  FeatureType,
  TRAIL_CATEGORY_LABELS,
  type MapFeature,
  type RouteProperties,
  type TrailCategory,
  type TrailProperties,
} from "./FeatureTypes";
import {
  getRouteLinkKeys,
  normalizeRouteName,
  parseRouteDisplayName,
} from "../utils/RouteDisplayName";

const GENERIC_TRAIL_NAMES = new Set(Object.values(TRAIL_CATEGORY_LABELS));

/** @deprecated Use routeLinkKeys on FeatureGroupKey instead. */
export interface RouteGroupKey {
  nameKey: string | null;
  refKey: string | null;
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
  /** Fallback when groupId is not yet on MVT features (mirrors processor link keys). */
  routeLinkKeys?: string[];
  trailGroupKey?: TrailGroupKey;
}

export { normalizeRouteName, isGenericRouteName } from "../utils/RouteDisplayName";

export function normalizeRouteRef(ref: string): string {
  return normalizeRouteName(ref.replace(/\s*\([^)]*\)\s*$/, "")) ||
    ref.trim().toLowerCase();
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

export function getTrailGroupKey(feature: MapFeature): TrailGroupKey | null {
  if (feature.properties.type !== FeatureType.Trail) {
    return null;
  }
  return getTrailGroupKeyFromProperties(feature.properties);
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
  if (feature.properties.type === FeatureType.Route) {
    const routeLinkKeys = getRouteLinkKeys(feature.properties);
    if (feature.properties.groupId) {
      return {
        groupId: feature.properties.groupId,
        routeLinkKeys,
      };
    }
    if (routeLinkKeys.length === 0) {
      return null;
    }
    return { routeLinkKeys };
  }

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

  return null;
}

export function matchesGroupKey(
  feature: MapFeature,
  key: FeatureGroupKey,
): boolean {
  const { properties } = feature;

  if (properties.type === FeatureType.Route && key.routeLinkKeys?.length) {
    return getRouteLinkKeys(properties).some((linkKey) =>
      key.routeLinkKeys!.includes(linkKey),
    );
  }

  if (key.groupId) {
    return feature.properties.groupId === key.groupId;
  }

  if (properties.type === FeatureType.Trail && key.trailGroupKey) {
    return matchesTrailGroupKey(properties, key.trailGroupKey);
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
    const parsed = parseRouteDisplayName(name);
    if (parsed?.effectiveName) {
      queries.add(parsed.effectiveName);
    }
    if (
      parsed?.qualifierKind !== "leg" &&
      parsed?.base &&
      parsed.base !== parsed.effectiveName
    ) {
      queries.add(parsed.base);
    }
    if (parsed?.qualifierKind === "leg" && parsed.qualifier) {
      queries.add(parsed.qualifier);
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

export { getRouteLinkKeys } from "../utils/RouteDisplayName";
