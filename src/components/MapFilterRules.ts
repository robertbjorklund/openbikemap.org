import * as maplibregl from "maplibre-gl";
import MapFilters from "../MapFilters";
import {
  BikeActivity,
  MTB_SCALE_NOT_SET,
  MTB_SCALES,
  ROUTE_PAVED_BUCKET_RANGES,
  ROUTE_PAVED_BUCKETS,
  RoutePavedBucket,
} from "../types/BikeActivity";

export type ObjectFilterRules =
  | maplibregl.ExpressionFilterSpecification
  | "hidden"
  | null;

export interface MapFilterRules {
  trails: ObjectFilterRules;
  routes: ObjectFilterRules;
}

function isActivityEnabled(
  filters: MapFilters,
  activity: BikeActivity,
): boolean {
  return !filters.hiddenActivities.includes(activity);
}

function mtbScaleFilter(
  filters: MapFilters,
): maplibregl.ExpressionFilterSpecification | null {
  if (filters.hiddenMtbScales.length === 0) {
    return null;
  }

  const hideNotSet = filters.hiddenMtbScales.includes(MTB_SCALE_NOT_SET);
  const hiddenNumbers = filters.hiddenMtbScales.filter(
    (value) => typeof value === "number",
  );
  const visibleNumbers = MTB_SCALES.filter(
    (scale) => !hiddenNumbers.includes(scale),
  );

  const conditions: maplibregl.ExpressionFilterSpecification[] = [];

  if (!hideNotSet) {
    conditions.push(["!", ["has", "mtbScale"]]);
  }
  if (visibleNumbers.length > 0) {
    conditions.push(["in", ["get", "mtbScale"], ["literal", visibleNumbers]]);
  }

  if (conditions.length === 0) {
    return ["literal", false];
  }

  return ["any", ...conditions];
}

function getMtbTrailFilter(
  filters: MapFilters,
): maplibregl.ExpressionFilterSpecification {
  const base: maplibregl.ExpressionFilterSpecification = [
    "==",
    ["get", "category"],
    "mtb_trail",
  ];
  const scaleFilter = mtbScaleFilter(filters);
  if (!scaleFilter) {
    return base;
  }
  return ["all", base, scaleFilter];
}

function getMinTrailLengthFilter(
  minTrailLengthMeters: number,
): maplibregl.ExpressionFilterSpecification | null {
  if (minTrailLengthMeters <= 0) {
    return null;
  }
  return [
    "any",
    ["==", ["get", "category"], "mtb_trail"],
    ["!", ["has", "lengthMeters"]],
    [">=", ["get", "lengthMeters"], minTrailLengthMeters],
  ];
}

function pavedRatioInRange(
  min: number,
  max: number,
): maplibregl.ExpressionFilterSpecification {
  return [
    "all",
    [">=", ["get", "pavedRatio"], min],
    ["<=", ["get", "pavedRatio"], max],
  ];
}

function getRoutePavedFilter(
  hiddenRoutePavedBuckets: RoutePavedBucket[],
): maplibregl.ExpressionFilterSpecification | null {
  const visibleBuckets = ROUTE_PAVED_BUCKETS.filter(
    (bucket) => !hiddenRoutePavedBuckets.includes(bucket),
  );

  if (visibleBuckets.length === ROUTE_PAVED_BUCKETS.length) {
    return null;
  }

  if (visibleBuckets.length === 0) {
    return ["!", ["has", "pavedRatio"]];
  }

  const conditions: maplibregl.ExpressionFilterSpecification[] = [
    ["!", ["has", "pavedRatio"]],
    ...visibleBuckets.map((bucket) => {
      const { min, max } = ROUTE_PAVED_BUCKET_RANGES[bucket];
      return pavedRatioInRange(min, max);
    }),
  ];

  return ["any", ...conditions];
}

function getSelectedSegmentsFilter(
  filters: MapFilters,
): maplibregl.ExpressionFilterSpecification | null {
  const ids =
    filters.selectedSegmentIds.length > 0
      ? filters.selectedSegmentIds
      : filters.selectedObjectID
        ? [filters.selectedObjectID]
        : [];

  if (ids.length === 0) {
    return null;
  }
  if (ids.length === 1) {
    return ["==", ["get", "id"], ids[0]];
  }
  return ["in", ["get", "id"], ["literal", ids]];
}

function withSelectedOverride(
  filters: MapFilters,
  base: ObjectFilterRules,
): ObjectFilterRules {
  const selectedFilter = getSelectedSegmentsFilter(filters);
  if (!selectedFilter || base === "hidden") {
    return base;
  }

  if (base === null) {
    return selectedFilter;
  }

  return ["any", selectedFilter, base];
}

function getTrailsFilter(filters: MapFilters): ObjectFilterRules {
  if (!isActivityEnabled(filters, BikeActivity.Mtb)) {
    return withSelectedOverride(filters, "hidden");
  }

  const lengthFilter = getMinTrailLengthFilter(filters.minTrailLengthMeters);
  const baseFilter = lengthFilter
    ? (["all", getMtbTrailFilter(filters), lengthFilter] as maplibregl.ExpressionFilterSpecification)
    : getMtbTrailFilter(filters);

  return withSelectedOverride(filters, baseFilter);
}

function getRoutesFilter(filters: MapFilters): ObjectFilterRules {
  if (!isActivityEnabled(filters, BikeActivity.Routes)) {
    return withSelectedOverride(filters, "hidden");
  }

  const pavedFilter = getRoutePavedFilter(filters.hiddenRoutePavedBuckets);
  return withSelectedOverride(filters, pavedFilter);
}

export function getFilterRules(filters: MapFilters): MapFilterRules {
  return {
    trails: getTrailsFilter(filters),
    routes: getRoutesFilter(filters),
  };
}

export function applyFilterRulesToMap(
  map: maplibregl.Map,
  filters: MapFilters,
): void {
  if (!map.isStyleLoaded()) {
    return;
  }

  const filterRules = getFilterRules(filters);
  const style = map.getStyle();
  if (!style) {
    return;
  }

  for (const layer of style.layers) {
    const sourceLayer = (layer as { "source-layer"?: string })["source-layer"];
    if (sourceLayer !== "trails" && sourceLayer !== "routes") {
      continue;
    }
    if (!map.getLayer(layer.id)) {
      continue;
    }

    const filterRule =
      sourceLayer === "trails" ? filterRules.trails : filterRules.routes;

    if (filterRule === "hidden") {
      map.setLayoutProperty(layer.id, "visibility", "none");
      continue;
    }

    map.setLayoutProperty(layer.id, "visibility", "visible");
    map.setFilter(layer.id, filterRule);
  }
}
