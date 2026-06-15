import { searchFeatures, loadFeatureGroup } from "../components/GeoJSONLoader";
import { FeatureType, type MapFeature } from "../types/FeatureTypes";
import {
  getFeatureGroupKey,
  getFeatureGroupSearchQueries,
  matchesGroupKey,
} from "../types/FeatureGroupKeys";
import { routeLinkKeysIntersect } from "./RouteDisplayName";
import { mergeTileClips } from "./FeatureGroup";

/** Max search hits when resolving a logical trail/route group via the API. */
export const FEATURE_GROUP_SEARCH_LIMIT = 200;

function filterRoutesByLinkKeys(
  primary: MapFeature,
  features: MapFeature[],
): MapFeature[] {
  if (primary.properties.type !== FeatureType.Route) {
    return features;
  }

  const primaryRoute = primary.properties;
  return features.filter(
    (feature) =>
      feature.properties.type !== FeatureType.Route ||
      routeLinkKeysIntersect(primaryRoute, feature.properties),
  );
}

/**
 * Resolve all features belonging to the same logical group as {@link primary}.
 * Merges tile-local segments with API search results (API-first for completeness).
 */
export async function resolveFeatureGroup(
  primary: MapFeature,
  tileRelatedFeatures: MapFeature[],
): Promise<MapFeature[]> {
  const byId = new Map<string, MapFeature>();

  for (const feature of mergeTileClips(tileRelatedFeatures)) {
    byId.set(feature.properties.id, feature);
  }
  if (!byId.has(primary.properties.id)) {
    byId.set(primary.properties.id, primary);
  }

  const expectedType = primary.properties.type;
  const groupId = primary.properties.groupId;

  if (groupId) {
    try {
      const groupFeatures = filterRoutesByLinkKeys(
        primary,
        await loadFeatureGroup(groupId),
      );
      for (const hit of groupFeatures) {
        if (
          hit.properties.type === expectedType &&
          !byId.has(hit.properties.id)
        ) {
          byId.set(hit.properties.id, hit);
        }
      }
      return [...byId.values()];
    } catch {
      // Group API unavailable; fall back to name/ref search below.
    }
  }

  const groupKey = getFeatureGroupKey(primary);
  if (!groupKey) {
    return [...byId.values()];
  }

  const queries = getFeatureGroupSearchQueries(primary);

  for (const query of queries) {
    try {
      const hits = await searchFeatures(query, FEATURE_GROUP_SEARCH_LIMIT);
      for (const hit of hits) {
        if (
          hit.properties.type === expectedType &&
          matchesGroupKey(hit, groupKey) &&
          !byId.has(hit.properties.id)
        ) {
          byId.set(hit.properties.id, hit);
        }
      }
    } catch {
      // Search is best-effort; tile hits and primary feature still apply.
    }
  }

  return filterRoutesByLinkKeys(primary, [...byId.values()]);
}
