import { formatRouteDisplayTitle } from "../types/RouteNetwork";
import { FeatureType, type MapFeature } from "../types/FeatureTypes";
import { getDefaultFeatureTitle } from "./MapFeatureKind";

/** Human-readable feature name for panels, page title, and share menus. */
export function getFeatureDisplayTitle(feature: MapFeature): string {
  const { properties } = feature;
  if (properties.type === FeatureType.Trail) {
    return (
      properties.name ||
      properties.ref ||
      getDefaultFeatureTitle(feature)
    );
  }
  return formatRouteDisplayTitle(properties.name, properties.ref);
}
