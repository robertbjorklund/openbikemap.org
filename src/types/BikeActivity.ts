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

/** Paved-share buckets from member-way pavedRatio in tiles (0–1) */
export enum RoutePavedBucket {
  P0_20 = "p0_20",
  P21_40 = "p21_40",
  P41_60 = "p41_60",
  P61_80 = "p61_80",
  P81_100 = "p81_100",
}

export const ROUTE_PAVED_BUCKETS = [
  RoutePavedBucket.P0_20,
  RoutePavedBucket.P21_40,
  RoutePavedBucket.P41_60,
  RoutePavedBucket.P61_80,
  RoutePavedBucket.P81_100,
] as const;

export const ROUTE_PAVED_BUCKET_LABELS: Record<RoutePavedBucket, string> = {
  [RoutePavedBucket.P0_20]: "0–20% paved",
  [RoutePavedBucket.P21_40]: "21–40% paved",
  [RoutePavedBucket.P41_60]: "41–60% paved",
  [RoutePavedBucket.P61_80]: "61–80% paved",
  [RoutePavedBucket.P81_100]: "81–100% paved",
};

export const ROUTE_PAVED_BUCKET_RANGES: Record<
  RoutePavedBucket,
  { min: number; max: number }
> = {
  [RoutePavedBucket.P0_20]: { min: 0, max: 0.2 },
  [RoutePavedBucket.P21_40]: { min: 0.21, max: 0.4 },
  [RoutePavedBucket.P41_60]: { min: 0.41, max: 0.6 },
  [RoutePavedBucket.P61_80]: { min: 0.61, max: 0.8 },
  [RoutePavedBucket.P81_100]: { min: 0.81, max: 1 },
};
