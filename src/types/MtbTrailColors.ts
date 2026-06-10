import {
  MTB_SCALE_NOT_SET,
  type MtbScaleFilter,
} from "./BikeActivity";

/** Ski-style difficulty colors for MTB trails (mtb:scale S0–S6) */
export const MTB_TRAIL_COLOR_GREEN = "#2e7d32";
export const MTB_TRAIL_COLOR_BLUE = "#1565c0";
export const MTB_TRAIL_COLOR_RED = "#d32f2f";
export const MTB_TRAIL_COLOR_BLACK = "#000000";
/** Other trail types and MTB trails without a scale */
export const TRAIL_COLOR_OTHER = "#7b1fa2";

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
  return MTB_TRAIL_COLOR_BLACK;
}

export const MTB_SCALE_FILTER_COLORS: Record<MtbScaleFilter, string> = {
  0: MTB_TRAIL_COLOR_GREEN,
  1: MTB_TRAIL_COLOR_GREEN,
  2: MTB_TRAIL_COLOR_BLUE,
  3: MTB_TRAIL_COLOR_RED,
  4: MTB_TRAIL_COLOR_BLACK,
  5: MTB_TRAIL_COLOR_BLACK,
  6: MTB_TRAIL_COLOR_BLACK,
  [MTB_SCALE_NOT_SET]: TRAIL_COLOR_OTHER,
};

/** MapLibre expression for trail line color from tile properties */
export const MTB_TRAIL_LINE_COLOR_EXPRESSION = [
  "case",
  ["!=", ["get", "category"], "mtb_trail"],
  TRAIL_COLOR_OTHER,
  ["!", ["has", "mtbScale"]],
  TRAIL_COLOR_OTHER,
  ["<=", ["get", "mtbScale"], 1],
  MTB_TRAIL_COLOR_GREEN,
  ["==", ["get", "mtbScale"], 2],
  MTB_TRAIL_COLOR_BLUE,
  ["==", ["get", "mtbScale"], 3],
  MTB_TRAIL_COLOR_RED,
  MTB_TRAIL_COLOR_BLACK,
] as const;
