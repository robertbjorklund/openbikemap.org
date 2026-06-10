import MapFilters, { defaultMapFilters } from "../MapFilters";
import { MapMarker } from "../MapMarker";
import { MapStyle } from "../MapStyle";
import { SelectedObject } from "./SelectedObject";

export default interface State {
  sidebarOpen: boolean;
  aboutInfoOpen: boolean;
  mapStyle: MapStyle;
  mapFilters: MapFilters;
  selectedObject: SelectedObject | null;
  markers: MapMarker[];
}

export interface StateChanges {
  sidebarOpen?: boolean;
  aboutInfoOpen?: boolean;
  mapStyle?: MapStyle;
  mapFilters?: MapFilters;
  selectedObject?: SelectedObject | null;
  markers?: MapMarker[];
  latestMarker?: MapMarker;
}

export function getInitialState(): State {
  const savedMapStyle = localStorage.getItem("mapStyle") as MapStyle;
  const mapStyle =
    savedMapStyle && Object.values(MapStyle).includes(savedMapStyle)
      ? savedMapStyle
      : MapStyle.Terrain;

  return {
    sidebarOpen: false,
    aboutInfoOpen: false,
    mapStyle,
    mapFilters: defaultMapFilters,
    selectedObject: null,
    markers: [],
  };
}
