import type { Feature, LineString, MultiLineString } from "geojson";

/**
 * Feature types aligned with api.openbikemap.org and openbikedata-processor.
 */
export enum FeatureType {
  Trail = "trail",
  Route = "route",
}

export enum TrailCategory {
  MtbTrail = "mtb_trail",
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

/** OSM `route` tag on relation features in the routes MVT layer. */
export type OsmRouteType = "bicycle" | "mtb";

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
  /** Stable id for all segments of the same logical trail (name/ref group). */
  groupId: string | null;
  category: TrailCategory;
  name: string | null;
  ref: string | null;
  surface: string | null;
  smoothness: string | null;
  tracktype: string | null;
  mtbScale: number | null;
  /** IMBA difficulty 0–4 from mtb:scale:imba */
  mtbScaleImba: number | null;
  sacScale: string | null;
  bicycle: string | null;
  lit: boolean | null;
  oneway: boolean | null;
  network: string | null;
  lengthMeters: number | null;
  elevationProfile: ElevationProfile | null;
  status: Status;
  sources: Source[];
  /** Precomputed map line color when present (MVT tiles / highlight). */
  color?: string | null;
  /** Highlight overlay: dashed IMBA style vs STS double-line. */
  isImbaTrail?: boolean;
}

export interface RouteProperties {
  type: FeatureType.Route;
  id: string;
  /** Stable id for all segments of the same logical route (name/ref group). */
  groupId: string | null;
  /** One OSM route relation — a selectable stage within a group. */
  stageId: string | null;
  name: string | null;
  ref: string | null;
  from: string | null;
  to: string | null;
  via: string | null;
  network: string | null;
  /** OSM route tag — bicycle network route vs named MTB route relation. */
  osmRouteType: OsmRouteType;
  /** OSM colour tag (e.g. red, blue) for route=mtb. */
  osmColour: string | null;
  /** Precomputed map line color when present (MVT tiles). */
  color?: string | null;
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
  [TrailCategory.MtbTrail]: "MTB trail",
};
