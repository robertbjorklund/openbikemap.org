import type { RouteProperties } from "../types/FeatureTypes";

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
