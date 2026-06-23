import {
  FeatureType,
  type MapFeature,
  type RouteFeature,
} from "../types/FeatureTypes";
import { routeLinkKeysIntersect } from "./RouteDisplayName";
import { mergeSegmentGroup } from "./FeatureGroup";
import type { RouteGroupSelection } from "../components/SelectedObject";

export function buildRouteGroupSelection(
  primary: MapFeature,
  relatedFeatures: MapFeature[],
): RouteGroupSelection | undefined {
  if (primary.properties.type !== FeatureType.Route) {
    return undefined;
  }

  const groupId = primary.properties.groupId;
  const primaryRoute = primary.properties;

  const stageFeatures = relatedFeatures.filter(
    (feature): feature is RouteFeature =>
      feature.properties.type === FeatureType.Route &&
      !!feature.properties.stageId &&
      routeLinkKeysIntersect(primaryRoute, feature.properties),
  );

  const uniqueStageIds = new Set(
    stageFeatures.map((feature) => feature.properties.stageId),
  );
  if (uniqueStageIds.size <= 1) {
    return undefined;
  }

  return {
    groupId: groupId ?? primary.properties.id,
    stageFeatures,
    wholeRouteFeature: mergeSegmentGroup(primary, stageFeatures, {
      mergeElevation: false,
    }) as RouteFeature,
    activeStageId: null,
  };
}

export function findRouteStageFeature(
  selection: RouteGroupSelection,
  stageId: string,
): RouteFeature | undefined {
  return selection.stageFeatures.find(
    (feature) => feature.properties.stageId === stageId,
  );
}
