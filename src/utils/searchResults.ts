import { AppConfig } from "../AppConfig";
import { loadFeatureGroup } from "../components/GeoJSONLoader";
import {
  FeatureType,
  type MapFeature,
} from "../types/FeatureTypes";
import { getDefaultFeatureTitle, getMapFeatureKind } from "./MapFeatureKind";
import { parseRouteDisplayName } from "./RouteDisplayName";
import { inferSverigeledenSectionLabel } from "./SverigeledenSection";

export interface GroupedSearchHit {
  feature: MapFeature;
  /** How many raw search hits were merged (same groupId). */
  mergedHitCount: number;
}

function searchGroupKey(feature: MapFeature): string {
  return feature.properties.groupId ?? feature.properties.id;
}

/** One search suggestion per logical trail/route group. */
export function groupSearchFeatures(features: MapFeature[]): GroupedSearchHit[] {
  const groups = new Map<string, MapFeature[]>();
  const order: string[] = [];

  for (const feature of features) {
    const key = searchGroupKey(feature);
    if (!groups.has(key)) {
      groups.set(key, []);
      order.push(key);
    }
    groups.get(key)!.push(feature);
  }

  return order.map((key) => {
    const members = groups.get(key)!;
    return {
      feature: members[0],
      mergedHitCount: members.length,
    };
  });
}

export function getSearchResultTitle(
  feature: MapFeature,
  mergedHitCount: number,
): string {
  const name = feature.properties.name?.trim();
  const ref = feature.properties.ref?.trim();

  if (
    feature.properties.type === FeatureType.Route &&
    name &&
    mergedHitCount > 1
  ) {
    const sectionLabel = inferSverigeledenSectionLabel(
      [feature.properties],
      parseRouteDisplayName,
    );
    if (sectionLabel) {
      return sectionLabel;
    }

    const parsed = parseRouteDisplayName(name);
    if (parsed?.qualifierKind === "stageRef" || parsed?.qualifierKind === "leg") {
      const stripped = name.replace(/\s*\([^)]+\)\s*$/, "").trim();
      if (stripped) {
        return stripped;
      }
    }
  }

  return name || ref || getDefaultFeatureTitle(feature);
}

export function getSearchResultSubtitle(
  feature: MapFeature,
  mergedHitCount: number,
): string {
  const kind =
    feature.properties.type === FeatureType.Route
      ? AppConfig.layerFilters.routes.featureLabel
      : getMapFeatureKind(feature).label;

  if (mergedHitCount > 1 || feature.properties.groupId) {
    return `${kind} · hela leden`;
  }

  return kind;
}

/** Load all stages/segments and merge geometry for map fit + detail panel. */
export async function resolveSearchSelectionFeature(
  hit: MapFeature,
): Promise<{ primary: MapFeature; related: MapFeature[]; display: MapFeature }> {
  const groupId = hit.properties.groupId;
  if (!groupId) {
    return { primary: hit, related: [hit], display: hit };
  }

  try {
    const group = await loadFeatureGroup(groupId);
    if (group.length === 0) {
      return { primary: hit, related: [hit], display: hit };
    }

    const primary =
      group.find((member) => member.properties.id === hit.properties.id) ??
      group[0];

    return {
      primary,
      related: group,
      display: primary,
    };
  } catch {
    return { primary: hit, related: [hit], display: hit };
  }
}