import {
  ROUTE_PAVED_BUCKET_LABELS,
  ROUTE_PAVED_BUCKETS,
  type RoutePavedBucket,
} from "./BikeActivity";

/** Gravel-heavy → paved/asphalt gradient */
export const ROUTE_PAVED_COLOR_0_20 = "#795548";
export const ROUTE_PAVED_COLOR_21_40 = "#a1887f";
export const ROUTE_PAVED_COLOR_41_60 = "#7d9471";
export const ROUTE_PAVED_COLOR_61_80 = "#607d8b";
export const ROUTE_PAVED_COLOR_81_100 = "#9e9e9e";
export const ROUTE_PAVED_COLOR_UNKNOWN = "#bdbdbd";

export const ROUTE_PAVED_BUCKET_COLORS: Record<RoutePavedBucket, string> = {
  p0_20: ROUTE_PAVED_COLOR_0_20,
  p21_40: ROUTE_PAVED_COLOR_21_40,
  p41_60: ROUTE_PAVED_COLOR_41_60,
  p61_80: ROUTE_PAVED_COLOR_61_80,
  p81_100: ROUTE_PAVED_COLOR_81_100,
};

export function routePavedColor(pavedRatio: number | null): string {
  if (pavedRatio === null) {
    return ROUTE_PAVED_COLOR_UNKNOWN;
  }
  if (pavedRatio <= 0.2) {
    return ROUTE_PAVED_COLOR_0_20;
  }
  if (pavedRatio <= 0.4) {
    return ROUTE_PAVED_COLOR_21_40;
  }
  if (pavedRatio <= 0.6) {
    return ROUTE_PAVED_COLOR_41_60;
  }
  if (pavedRatio <= 0.8) {
    return ROUTE_PAVED_COLOR_61_80;
  }
  return ROUTE_PAVED_COLOR_81_100;
}

export const ROUTE_PAVED_LEGEND = ROUTE_PAVED_BUCKETS.map((bucket) => ({
  label: ROUTE_PAVED_BUCKET_LABELS[bucket],
  color: ROUTE_PAVED_BUCKET_COLORS[bucket],
}));

/** MapLibre expression for route line color from pavedRatio tile property */
export const ROUTE_PAVED_LINE_COLOR_EXPRESSION = [
  "case",
  ["has", "pavedRatio"],
  [
    "case",
    ["<=", ["to-number", ["get", "pavedRatio"]], 0.2],
    ROUTE_PAVED_COLOR_0_20,
    ["<=", ["to-number", ["get", "pavedRatio"]], 0.4],
    ROUTE_PAVED_COLOR_21_40,
    ["<=", ["to-number", ["get", "pavedRatio"]], 0.6],
    ROUTE_PAVED_COLOR_41_60,
    ["<=", ["to-number", ["get", "pavedRatio"]], 0.8],
    ROUTE_PAVED_COLOR_61_80,
    ROUTE_PAVED_COLOR_81_100,
  ],
  ["has", "color"],
  ["get", "color"],
  ROUTE_PAVED_COLOR_UNKNOWN,
] as const;
