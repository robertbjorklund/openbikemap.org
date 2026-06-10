/**
 * Trail categories for OpenBikeMap.
 * These map to OSM tags processed by the future openbikedata-processor.
 */
export enum TrailCategory {
  Cycleway = "cycleway",
  BicycleRoute = "bicycle_route",
  MtbTrail = "mtb_trail",
  GravelTrack = "gravel_track",
}

export const TRAIL_CATEGORY_LABELS: Record<TrailCategory, string> = {
  [TrailCategory.Cycleway]: "Cycleway",
  [TrailCategory.BicycleRoute]: "Bicycle route",
  [TrailCategory.MtbTrail]: "MTB trail",
  [TrailCategory.GravelTrack]: "Gravel / forest track",
};

/**
 * Placeholder for features returned by api.openbikemap.org.
 * Will move to a shared openbikedata-format package later.
 */
export interface TrailProperties {
  id: string;
  name: string | null;
  category: TrailCategory;
  surface: string | null;
  lengthMeters: number | null;
  network: string | null;
  mtbScale: number | null;
}
