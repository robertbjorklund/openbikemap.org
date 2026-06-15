import { FeatureType, type MapFeature, type TrailFeature } from "../types/FeatureTypes";

export type MapFeatureKind = "bicycle-route" | "sts" | "imba";

export const MAP_FEATURE_KIND_LABELS: Record<MapFeatureKind, string> = {
  "bicycle-route": "Bicycle route",
  sts: "STS",
  imba: "IMBA",
};

export function getMapFeatureKind(
  feature: MapFeature,
): { kind: MapFeatureKind; label: string } {
  if (feature.properties.type === FeatureType.Route) {
    return {
      kind: "bicycle-route",
      label: MAP_FEATURE_KIND_LABELS["bicycle-route"],
    };
  }

  const trail = feature as TrailFeature;
  if (trail.properties.mtbScaleImba !== null) {
    return { kind: "imba", label: MAP_FEATURE_KIND_LABELS.imba };
  }

  return { kind: "sts", label: MAP_FEATURE_KIND_LABELS.sts };
}
