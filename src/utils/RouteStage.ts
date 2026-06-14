import type { RouteFeature, RouteProperties } from "../types/FeatureTypes";
import { formatRouteDisplayTitle } from "../types/RouteNetwork";
import type { UnitSystem } from "../components/utils/UnitHelpers";
import { formatLength, getFeatureLengthMeters } from "./Length";

/** Human-readable label for a route stage from OSM from/to/via tags. */
export function formatRouteStageLabel(properties: RouteProperties): string | null {
  const parts: string[] = [];
  if (properties.from?.trim()) {
    parts.push(properties.from.trim());
  }
  if (properties.via?.trim()) {
    parts.push(`via ${properties.via.trim()}`);
  }
  if (properties.to?.trim()) {
    parts.push(properties.to.trim());
  }
  if (parts.length === 0) {
    return null;
  }
  if (parts.length === 1) {
    return parts[0];
  }
  if (properties.from?.trim() && properties.to?.trim()) {
    const via = properties.via?.trim() ? ` via ${properties.via.trim()}` : "";
    return `${properties.from.trim()}${via} → ${properties.to.trim()}`;
  }
  return parts.join(" · ");
}

/** Tooltip text for a hovered route stage (1–2 lines: segment label and/or length). */
export function formatRouteStageTooltip(
  feature: RouteFeature,
  unitSystem: UnitSystem,
): string {
  const { properties } = feature;
  const lines: string[] = [];

  const stageLabel = formatRouteStageLabel(properties);
  const routeTitle = formatRouteDisplayTitle(properties.name, properties.ref);

  if (stageLabel) {
    lines.push(stageLabel);
  } else if (routeTitle) {
    lines.push(routeTitle);
  }

  const length = formatLength(getFeatureLengthMeters(feature), unitSystem);
  if (length) {
    lines.push(length);
  }

  if (lines.length === 0) {
    return routeTitle || "Route segment";
  }

  return lines.join("\n");
}
