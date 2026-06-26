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

/** Tile clips only fill gaps — never override API GeoJSON for the same feature id. */
function supplementTileClips(
  byId: Map<string, MapFeature>,
  tileRelatedFeatures: MapFeature[],
  expectedType: FeatureType,
): void {
  for (const feature of mergeTileClips(tileRelatedFeatures)) {
    if (
      feature.properties.type === expectedType &&
      !byId.has(feature.properties.id)
    ) {
      byId.set(feature.properties.id, feature);
    }
  }
}

/**
 * Resolve all features belonging to the same logical group as {@link primary}.
 * API GeoJSON is authoritative; MVT tile clips are a fallback for missing ids only.
 */
export async function resolveFeatureGroup(
  primary: MapFeature,
  tileRelatedFeatures: MapFeature[],
): Promise<MapFeature[]> {
  const byId = new Map<string, MapFeature>();
  const expectedType = primary.properties.type;

  const upsertApi = (feature: MapFeature): void => {
    if (feature.properties.type === expectedType) {
      byId.set(feature.properties.id, feature);
    }
  };

  upsertApi(primary);

  const groupId = primary.properties.groupId;

  if (groupId) {
    try {
      for (const hit of await loadFeatureGroup(groupId)) {
        upsertApi(hit);
      }
      supplementTileClips(byId, tileRelatedFeatures, expectedType);
      return [...byId.values()];
    } catch {
      // Group API unavailable; fall back to name/ref search below.
    }
  }

  const groupKey = getFeatureGroupKey(primary);
  if (groupKey) {
    const queries = getFeatureGroupSearchQueries(primary);

    for (const query of queries) {
      try {
        const hits = await searchFeatures(query, FEATURE_GROUP_SEARCH_LIMIT);
        for (const hit of hits) {
          if (matchesGroupKey(hit, groupKey)) {
            upsertApi(hit);
          }
        }
      } catch {
        // Search is best-effort; tile hits and primary feature still apply.
      }
    }
  }

  supplementTileClips(byId, tileRelatedFeatures, expectedType);

  return filterRoutesByLinkKeys(primary, [...byId.values()]);
}
