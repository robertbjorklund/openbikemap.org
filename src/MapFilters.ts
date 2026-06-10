import {
  BikeActivity,
  type MtbScaleFilter,
  RoutePavedBucket,
} from "./types/BikeActivity";

export default interface MapFilters {
  hiddenActivities: BikeActivity[];
  hiddenMtbScales: MtbScaleFilter[];
  hiddenRoutePavedBuckets: RoutePavedBucket[];
  /** Hide trail segments shorter than this (MTB trails exempt). 0 = off */
  minTrailLengthMeters: number;
  selectedObjectID: string | null;
  /** All MVT segment ids in the selected named route/trail group */
  selectedSegmentIds: string[];
}

export const defaultMapFilters: MapFilters = {
  hiddenActivities: [],
  hiddenMtbScales: [],
  hiddenRoutePavedBuckets: [],
  minTrailLengthMeters: 500,
  selectedObjectID: null,
  selectedSegmentIds: [],
};
