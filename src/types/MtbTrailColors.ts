import {
  MTB_SCALE_NOT_SET,
  type MtbScaleFilter,
} from "./BikeActivity";

/** Ski-style difficulty colors for MTB trails (mtb:scale S0–S6) */
export const MTB_TRAIL_COLOR_GREEN = "#2e7d32";
export const MTB_TRAIL_COLOR_BLUE = "#1565c0";
export const MTB_TRAIL_COLOR_RED = "#d32f2f";
export const MTB_TRAIL_COLOR_BLACK = "#000000";
/** Double-diamond (S5–S6, IMBA 4) */
export const MTB_TRAIL_COLOR_ORANGE = "#ff9800";
/** Other trail types and MTB trails without a scale */
export const TRAIL_COLOR_OTHER = "#7b1fa2";

/** IMBA (mtb:scale:imba 0–4) — matches MtbImbaLegendIcon / map symbols */
export const IMBA_TRAIL_COLOR_WHITE = "#ffffff";
export const IMBA_TRAIL_COLOR_GREEN = MTB_TRAIL_COLOR_GREEN;
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

export function mtbTrailColor(mtbScale: number | null): string {
  if (mtbScale === null) {
    return TRAIL_COLOR_OTHER;
  }
  if (mtbScale <= 1) {
    return MTB_TRAIL_COLOR_GREEN;
  }
  if (mtbScale === 2) {
    return MTB_TRAIL_COLOR_BLUE;
  }
  if (mtbScale === 3) {
    return MTB_TRAIL_COLOR_RED;
  }
  if (mtbScale === 4) {
    return MTB_TRAIL_COLOR_BLACK;
  }
  return MTB_TRAIL_COLOR_ORANGE;
}

export const MTB_SCALE_FILTER_COLORS: Record<MtbScaleFilter, string> = {
  0: MTB_TRAIL_COLOR_GREEN,
  1: MTB_TRAIL_COLOR_GREEN,
  2: MTB_TRAIL_COLOR_BLUE,
  3: MTB_TRAIL_COLOR_RED,
  4: MTB_TRAIL_COLOR_BLACK,
  5: MTB_TRAIL_COLOR_ORANGE,
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
  MTB_TRAIL_COLOR_GREEN,
  ["==", ["to-number", ["get", "mtbScale"]], 2],
  MTB_TRAIL_COLOR_BLUE,
  ["==", ["to-number", ["get", "mtbScale"]], 3],
  MTB_TRAIL_COLOR_RED,
  ["==", ["to-number", ["get", "mtbScale"]], 4],
  MTB_TRAIL_COLOR_BLACK,
  MTB_TRAIL_COLOR_ORANGE,
] as const;
