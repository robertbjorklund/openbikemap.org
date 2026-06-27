import {
  FeatureType,
  type MapFeature,
  type RouteFeature,
} from "../types/FeatureTypes";
import { parseRouteDisplayName, routeLinkKeysIntersect } from "./RouteDisplayName";
import { getRouteStageNumber } from "./SverigeledenSection";
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

  const stageFeatures = relatedFeatures
    .filter(
      (feature): feature is RouteFeature =>
        feature.properties.type === FeatureType.Route &&
        !!feature.properties.stageId &&
        (groupId
          ? feature.properties.groupId === groupId
          : routeLinkKeysIntersect(primaryRoute, feature.properties)),
    )
    .sort((left, right) => {
      const leftNum =
        getRouteStageNumber(
          left.properties,
          parseRouteDisplayName(left.properties.name),
        ) ?? Number.MAX_SAFE_INTEGER;
      const rightNum =
        getRouteStageNumber(
          right.properties,
          parseRouteDisplayName(right.properties.name),
        ) ?? Number.MAX_SAFE_INTEGER;
      return leftNum - rightNum;
    });

  const uniqueStageIds = new Set(
    stageFeatures.map((feature) => feature.properties.stageId),
  );
  if (uniqueStageIds.size <= 1) {
    return undefined;
  }

  return {
    groupId: groupId ?? primary.properties.id,
    stageFeatures,
    wholeRouteFeature: mergeSegmentGroup(primary, stageFeatures) as RouteFeature,
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
