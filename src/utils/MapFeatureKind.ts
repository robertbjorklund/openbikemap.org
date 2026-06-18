import { AppConfig } from "../AppConfig";
import { FeatureType, type MapFeature, type TrailFeature } from "../types/FeatureTypes";

export type MapFeatureKind = "bicycle-route" | "mtb-route" | "sts" | "imba";

export const MAP_FEATURE_KIND_LABELS: Record<MapFeatureKind, string> = {
  "bicycle-route": AppConfig.layerFilters.routes.featureLabel,
  "mtb-route": AppConfig.layerFilters.mtbRoutes.panelTitle,
  sts: AppConfig.layerFilters.mtbTrail.railLabel,
  imba: AppConfig.layerFilters.mtbBikePark.railLabel,
};

export function getMapFeatureKind(
  feature: MapFeature,
): { kind: MapFeatureKind; label: string } {
  if (feature.properties.type === FeatureType.Route) {
    if (feature.properties.osmRouteType === "mtb") {
      return {
        kind: "mtb-route",
        label: MAP_FEATURE_KIND_LABELS["mtb-route"],
      };
    }
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

export function getDefaultFeatureTitle(_feature?: MapFeature): string {
  return AppConfig.untitledFeatureTitle;
}
