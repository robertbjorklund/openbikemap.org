import {
  FeatureType,
  type MapFeature,
  type RouteFeature,
} from "../types/FeatureTypes";
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
  if (!groupId) {
    return undefined;
  }

  const stageFeatures = relatedFeatures.filter(
    (feature): feature is RouteFeature =>
      feature.properties.type === FeatureType.Route &&
      feature.properties.groupId === groupId &&
      !!feature.properties.stageId,
  );

  const uniqueStageIds = new Set(
    stageFeatures.map((feature) => feature.properties.stageId),
  );
  if (uniqueStageIds.size <= 1) {
    return undefined;
  }

  return {
    groupId,
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
