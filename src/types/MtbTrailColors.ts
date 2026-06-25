import {
  MTB_SCALE_NOT_SET,
  type MtbScaleFilter,
} from "./BikeActivity";
import { OPENBIKEMAP_LINE_MIN_ZOOM } from "../constants/OpenBikeMapLayerZoom";

/** STS (Single Track Scale S0–S6) — three difficulty colors + optional S6 orange */
export const MTB_TRAIL_COLOR_BLUE = "#1565c0";
export const MTB_TRAIL_COLOR_RED = "#d32f2f";
export const MTB_TRAIL_COLOR_BLACK = "#000000";
/** S6 when present in OSM data */
export const MTB_TRAIL_COLOR_ORANGE = "#ff9800";
/** Other trail types and MTB trails without a scale */
export const TRAIL_COLOR_OTHER = "#7b1fa2";

/** IMBA (mtb:scale:imba 0–4) — matches MtbImbaLegendIcon / map symbols */
export const IMBA_TRAIL_COLOR_WHITE = "#ffffff";
export const IMBA_TRAIL_COLOR_GREEN = "#2e7d32";
export const IMBA_TRAIL_COLOR_BLUE = MTB_TRAIL_COLOR_BLUE;
export const IMBA_TRAIL_COLOR_BLACK = MTB_TRAIL_COLOR_BLACK;
export const IMBA_TRAIL_COLOR_ORANGE = MTB_TRAIL_COLOR_ORANGE;

export const IMBA_TRAIL_COLORS: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: IMBA_TRAIL_COLOR_WHITE,
  1: IMBA_TRAIL_COLOR_GREEN,
  2: IMBA_TRAIL_COLOR_BLUE,
  3: IMBA_TRAIL_COLOR_BLACK,
  4: IMBA_TRAIL_COLOR_ORANGE,
};

export function imbaTrailColor(mtbScaleImba: number | null): string {
  if (mtbScaleImba === null) {
    return IMBA_TRAIL_COLOR_WHITE;
  }
  if (mtbScaleImba in IMBA_TRAIL_COLORS) {
    return IMBA_TRAIL_COLORS[mtbScaleImba as 0 | 1 | 2 | 3 | 4];
  }
  return IMBA_TRAIL_COLOR_WHITE;
}

export function mtbTrailColor(mtbScale: number | null): string {
  if (mtbScale === null) {
    return TRAIL_COLOR_OTHER;
  }
  if (mtbScale <= 1) {
    return MTB_TRAIL_COLOR_BLUE;
  }
  if (mtbScale === 2) {
    return MTB_TRAIL_COLOR_RED;
  }
  if (mtbScale <= 5) {
    return MTB_TRAIL_COLOR_BLACK;
  }
  return MTB_TRAIL_COLOR_ORANGE;
}

export const MTB_SCALE_FILTER_COLORS: Record<MtbScaleFilter, string> = {
  0: MTB_TRAIL_COLOR_BLUE,
  1: MTB_TRAIL_COLOR_BLUE,
  2: MTB_TRAIL_COLOR_RED,
  3: MTB_TRAIL_COLOR_BLACK,
  4: MTB_TRAIL_COLOR_BLACK,
  5: MTB_TRAIL_COLOR_BLACK,
  6: MTB_TRAIL_COLOR_ORANGE,
  [MTB_SCALE_NOT_SET]: TRAIL_COLOR_OTHER,
};

/** MapLibre line color for IMBA trails (mtb:scale:imba 0–4) */
export const IMBA_TRAIL_LINE_COLOR_EXPRESSION = [
  "match",
  ["to-number", ["get", "mtbScaleImba"]],
  0,
  IMBA_TRAIL_COLOR_WHITE,
  1,
  IMBA_TRAIL_COLOR_GREEN,
  2,
  IMBA_TRAIL_COLOR_BLUE,
  3,
  IMBA_TRAIL_COLOR_BLACK,
  4,
  IMBA_TRAIL_COLOR_ORANGE,
  IMBA_TRAIL_COLOR_WHITE,
] as const;

function isImbaTrailColorExpression(): readonly unknown[] {
  return [
    "match",
    ["get", "mtbScaleImba"],
    0,
    true,
    1,
    true,
    2,
    true,
    3,
    true,
    4,
    true,
    false,
  ];
}

/** MapLibre expression for trail line color from tile properties */
export const MTB_TRAIL_LINE_COLOR_EXPRESSION = [
  "case",
  isImbaTrailColorExpression(),
  IMBA_TRAIL_LINE_COLOR_EXPRESSION,
  ["!=", ["get", "category"], "mtb_trail"],
  ["coalesce", ["get", "color"], TRAIL_COLOR_OTHER],
  ["!", ["has", "mtbScale"]],
  ["coalesce", ["get", "color"], TRAIL_COLOR_OTHER],
  ["<=", ["to-number", ["get", "mtbScale"]], 1],
  MTB_TRAIL_COLOR_BLUE,
  ["==", ["to-number", ["get", "mtbScale"]], 2],
  MTB_TRAIL_COLOR_RED,
  ["<=", ["to-number", ["get", "mtbScale"]], 5],
  MTB_TRAIL_COLOR_BLACK,
  MTB_TRAIL_COLOR_ORANGE,
] as const;

/** Solid white center stripe for STS double-line rendering */
export const TRAIL_STS_CENTER_LINE_COLOR = "#ffffff";

/** MapLibre expression for STS outer line color (difficulty on trails-casing) */
export const STS_TRAIL_CASING_LINE_COLOR_EXPRESSION = [
  "case",
  ["!=", ["get", "category"], "mtb_trail"],
  ["coalesce", ["get", "color"], TRAIL_COLOR_OTHER],
  ["!", ["has", "mtbScale"]],
  ["coalesce", ["get", "color"], TRAIL_COLOR_OTHER],
  ["<=", ["to-number", ["get", "mtbScale"]], 1],
  MTB_TRAIL_COLOR_BLUE,
  ["==", ["to-number", ["get", "mtbScale"]], 2],
  MTB_TRAIL_COLOR_RED,
  ["<=", ["to-number", ["get", "mtbScale"]], 5],
  MTB_TRAIL_COLOR_BLACK,
  MTB_TRAIL_COLOR_ORANGE,
] as const;

/** Light gray casing behind IMBA trail lines (all difficulty levels) */
export const IMBA_TRAIL_CASING_COLOR = "#ebebeb";

/** True when feature is an IMBA-rated trail (mtb:scale:imba 0–4). */
export const IS_IMBA_TRAIL_MATCH_EXPRESSION = [
  "match",
  ["get", "mtbScaleImba"],
  0,
  true,
  1,
  true,
  2,
  true,
  3,
  true,
  4,
  true,
  false,
] as const;

/** Explicit IMBA 0 (white diamond) — requires tag present, not missing coerced to 0 */
export const IS_WHITE_IMBA_TRAIL_MATCH_EXPRESSION = [
  "all",
  ["has", "mtbScaleImba"],
  ["match", ["get", "mtbScaleImba"], 0, true, false],
] as const;

/** Colored outer line for STS; gray backing for IMBA */
export const TRAIL_CASING_LINE_COLOR_EXPRESSION = [
  "case",
  IS_IMBA_TRAIL_MATCH_EXPRESSION,
  IMBA_TRAIL_CASING_COLOR,
  STS_TRAIL_CASING_LINE_COLOR_EXPRESSION,
] as const;

/** Slightly wider dashed line so white IMBA trails stay visible without casing */
export const TRAIL_IMBA_LINE_WIDTH_EXPRESSION = [
  "interpolate",
  ["linear"],
  ["zoom"],
  OPENBIKEMAP_LINE_MIN_ZOOM,
  ["case", IS_WHITE_IMBA_TRAIL_MATCH_EXPRESSION, 1.2, 1],
  10,
  ["case", IS_WHITE_IMBA_TRAIL_MATCH_EXPRESSION, 2, 1.6],
  14,
  ["case", IS_WHITE_IMBA_TRAIL_MATCH_EXPRESSION, 4.5, 4],
  16,
  ["case", IS_WHITE_IMBA_TRAIL_MATCH_EXPRESSION, 5, 4.5],
] as const;
