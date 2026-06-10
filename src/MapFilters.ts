import { TrailCategory } from "./types/TrailTypes";

export default interface MapFilters {
  hiddenCategories: TrailCategory[];
  selectedObjectID: string | null;
}

export const defaultMapFilters: MapFilters = {
  hiddenCategories: [],
  selectedObjectID: null,
};
