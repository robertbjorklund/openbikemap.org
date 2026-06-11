import type { Feature, LineString, MultiLineString } from "geojson";

/**
 * Feature types aligned with api.openbikemap.org and openbikedata-processor.
 */
export enum FeatureType {
  Trail = "trail",
  Route = "route",
}

export enum TrailCategory {
  Cycleway = "cycleway",
  BicycleRoute = "bicycle_route",
  MtbTrail = "mtb_trail",
  GravelTrack = "gravel_track",
  SharedPath = "shared_path",
}

export enum Status {
  Operating = "operating",
  Disused = "disused",
  Abandoned = "abandoned",
  Proposed = "proposed",
  Planned = "planned",
  Construction = "construction",
}

export enum SourceType {
  OpenStreetMap = "openstreetmap",
}

export interface Source {
  type: SourceType;
  id: string;
}

export interface ElevationProfile {
  heights: number[];
  resolution: number;
  targetResolution: number;
}

export interface TrailProperties {
  type: FeatureType.Trail;
  id: string;
  category: TrailCategory;
  name: string | null;
  ref: string | null;
  surface: string | null;
  smoothness: string | null;
  tracktype: string | null;
  mtbScale: number | null;
  sacScale: string | null;
  bicycle: string | null;
  lit: boolean | null;
  oneway: boolean | null;
  network: string | null;
  lengthMeters: number | null;
  elevationProfile: ElevationProfile | null;
  status: Status;
  sources: Source[];
}

export interface RouteProperties {
  type: FeatureType.Route;
  id: string;
  name: string | null;
  ref: string | null;
  network: string | null;
  distance: string | null;
  roundtrip: boolean | null;
  pavedRatio: number | null;
  elevationProfile: ElevationProfile | null;
  status: Status;
  sources: Source[];
}

export type TrailFeature = Feature<
  LineString | MultiLineString,
  TrailProperties
>;

export type RouteFeature = Feature<
  LineString | MultiLineString,
  RouteProperties
>;

export type MapFeature = TrailFeature | RouteFeature;

export const TRAIL_CATEGORY_LABELS: Record<TrailCategory, string> = {
  [TrailCategory.Cycleway]: "Cycleway",
  [TrailCategory.BicycleRoute]: "Bicycle route",
  [TrailCategory.MtbTrail]: "MTB trail",
  [TrailCategory.GravelTrack]: "Gravel / forest track",
  [TrailCategory.SharedPath]: "Shared path",
};
