/**

 * User-facing activity filters. Mapped to MVT properties in MapFilterRules.

 */

export enum BikeActivity {

  Mtb = "mtb",

  Routes = "routes",

}



export const BIKE_ACTIVITY_LABELS: Record<BikeActivity, string> = {

  [BikeActivity.Mtb]: "MTB",

  [BikeActivity.Routes]: "Bicycle routes",

};



/** OSM mtb:scale (S0–S6) */

export const MTB_SCALES = [0, 1, 2, 3, 4, 5, 6] as const;



export const MTB_SCALE_NOT_SET = "not_set" as const;



export type MtbScaleFilter = (typeof MTB_SCALES)[number] | typeof MTB_SCALE_NOT_SET;



export const MTB_SCALE_FILTERS: readonly MtbScaleFilter[] = [

  ...MTB_SCALES,

  MTB_SCALE_NOT_SET,

];



export const MTB_SCALE_LABELS: Record<number, string> = {

  0: "S0 — Easy gravel road",

  1: "S1 — Easy trail",

  2: "S2 — Intermediate",

  3: "S3 — Difficult",

  4: "S4 — Very difficult",

  5: "S5 — Extreme",

  6: "S6 — Extreme+",

};



export function toMtbScaleFilter(mtbScale: number | null): MtbScaleFilter {

  if (mtbScale === null) {

    return MTB_SCALE_NOT_SET;

  }

  return mtbScale as (typeof MTB_SCALES)[number];

}



export const MTB_SCALE_FILTER_LABELS: Record<MtbScaleFilter, string> = {

  0: MTB_SCALE_LABELS[0],

  1: MTB_SCALE_LABELS[1],

  2: MTB_SCALE_LABELS[2],

  3: MTB_SCALE_LABELS[3],

  4: MTB_SCALE_LABELS[4],

  5: MTB_SCALE_LABELS[5],

  6: MTB_SCALE_LABELS[6],

  [MTB_SCALE_NOT_SET]: "Not set",

};

