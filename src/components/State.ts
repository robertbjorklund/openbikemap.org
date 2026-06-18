import MapFilters, { defaultMapFilters } from "../MapFilters";

import { MapMarker } from "../MapMarker";

import { MapStyle } from "../MapStyle";

import { SelectedObject } from "./SelectedObject";

import type { AppPanelTab } from "./AppPanelTab";
import type { SidePanelView } from "./SidePanelView";



export default interface State {

  sidePanelView: SidePanelView;

  appPanelTab: AppPanelTab;

  mapStyle: MapStyle;

  mapFilters: MapFilters;

  selectedObject: SelectedObject | null;

  markers: MapMarker[];

}



export interface StateChanges {

  sidePanelView?: SidePanelView;

  appPanelTab?: AppPanelTab;

  mapStyle?: MapStyle;

  mapFilters?: MapFilters;

  selectedObject?: SelectedObject | null;

  markers?: MapMarker[];

  latestMarker?: MapMarker;

}



export function getInitialState(): State {

  const savedMapStyle = localStorage.getItem("mapStyle");
  const mapStyle =
    savedMapStyle === "liberty"
      ? MapStyle.Satellite
      : savedMapStyle && Object.values(MapStyle).includes(savedMapStyle as MapStyle)
        ? (savedMapStyle as MapStyle)
        : MapStyle.Terrain;



  return {

    sidePanelView: null,

    appPanelTab: "settings",

    mapStyle,

    mapFilters: defaultMapFilters,

    selectedObject: null,

    markers: [],

  };

}


