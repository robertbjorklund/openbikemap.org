import { AppConfig } from "../AppConfig";
import { MapMarker } from "../MapMarker";
import { MapStyle } from "../MapStyle";
import {
  BikeActivity,
  type MtbScaleFilter,
  RoutePavedBucket,
} from "../types/BikeActivity";
import type { MapFeature } from "../types/FeatureTypes";
import { mergeSegmentGroup } from "../utils/FeatureGroup";
import EventBus, { type ShowInfoOptions } from "./EventBus";
import { loadGeoJSON } from "./GeoJSONLoader";
import type { ObjectIDType } from "./SelectedObject";
import type { SidePanelView } from "./SidePanelView";
import State, { StateChanges } from "./State";
import { setUnitSystem } from "./UnitSystemManager";
import { URLState } from "./URLHistory";
import type { UnitSystem } from "./utils/UnitHelpers";

function buildDisplayFeature(
  primary: MapFeature,
  relatedFeatures: MapFeature[],
): MapFeature {
  if (relatedFeatures.length <= 1) {
    return primary;
  }
  return mergeSegmentGroup(primary, relatedFeatures);
}

function clearedSelectionFilters(state: State) {
  return {
    ...state.mapFilters,
    selectedObjectID: null,
    selectedSegmentIds: [],
  };
}

export default class StateReducer implements EventBus {
  _state: State;
  updateHandler: (state: State, changes: StateChanges) => void = () => {};

  constructor(
    state: State,
    updateHandler: (state: State, changes: StateChanges) => void = () => {},
  ) {
    this._state = state;
    this.updateHandler = updateHandler;
  }

  openSidebar = () => {
    this.openFilter();
  };

  openMapLayers = () => {
    this.toggleSidePanel("mapLayers");
  };

  openFilter = () => {
    this.toggleSidePanel("filter");
  };

  openRoute = () => {
    if (this._state.sidePanelView === "route") {
      this.setSidePanel(null);
      return;
    }
    this.setSidePanel("route");
  };

  closeRoutePanel = () => {
    if (this._state.sidePanelView === "route") {
      this.setSidePanel(null);
    }
  };

  openSettings = () => {
    this.toggleSidePanel("settings");
  };

  openCredits = () => {
    this.toggleSidePanel("credits");
  };

  closeSidebar = () => {
    this.closeMenu();
  };

  closeMenu = () => {
    if (this._state.sidePanelView === "route") {
      return;
    }
    this.setSidePanel(null);
  };

  backToLayers = () => {
    const changes: StateChanges = { sidePanelView: "filter" };
    if (this._state.sidePanelView === "route") {
      changes.selectedObject = null;
      changes.mapFilters = clearedSelectionFilters(this._state);
    }
    this.update(changes);
  };

  openAboutInfo = () => {
    this.toggleSidePanel("about");
  };

  closeAboutInfo = () => {
    this.closeMenu();
  };

  setUnitSystem = (unitSystem: UnitSystem) => {
    setUnitSystem(unitSystem);
  };

  setMapStyle = (style: MapStyle) => {
    this.update({ mapStyle: style });
  };

  toggleActivity = (activity: BikeActivity) => {
    const hidden = this._state.mapFilters.hiddenActivities;
    const hiddenActivities = hidden.includes(activity)
      ? hidden.filter((a) => a !== activity)
      : [...hidden, activity];
    this.update({
      mapFilters: { ...this._state.mapFilters, hiddenActivities },
    });
  };

  toggleMtbScale = (scale: MtbScaleFilter) => {
    const hidden = this._state.mapFilters.hiddenMtbScales;
    const hiddenMtbScales = hidden.includes(scale)
      ? hidden.filter((s) => s !== scale)
      : [...hidden, scale];
    this.update({
      mapFilters: { ...this._state.mapFilters, hiddenMtbScales },
    });
  };

  setMinTrailLength = (meters: number) => {
    this.update({
      mapFilters: {
        ...this._state.mapFilters,
        minTrailLengthMeters: Math.max(0, meters),
      },
    });
  };

  toggleRoutePavedBucket = (bucket: RoutePavedBucket) => {
    const hidden = this._state.mapFilters.hiddenRoutePavedBuckets;
    const hiddenRoutePavedBuckets = hidden.includes(bucket)
      ? hidden.filter((b) => b !== bucket)
      : [...hidden, bucket];
    this.update({
      mapFilters: { ...this._state.mapFilters, hiddenRoutePavedBuckets },
    });
  };

  private loadInfoData = async (
    id: string,
    idType: ObjectIDType,
    relatedFeatures: MapFeature[],
    fallbackFeature?: MapFeature,
  ) => {
    try {
      const apiFeature = await loadGeoJSON<MapFeature>(id, idType);
      if (this._state.selectedObject?.id !== id) {
        return;
      }

      const mergedRelated =
        relatedFeatures.length > 1
          ? relatedFeatures.map((feature) =>
              feature.properties.id === id ? apiFeature : feature,
            )
          : [apiFeature];

      this.update({
        selectedObject: {
          ...this._state.selectedObject,
          feature: buildDisplayFeature(apiFeature, mergedRelated),
        },
        mapFilters: {
          ...this._state.mapFilters,
          selectedObjectID: apiFeature.properties.id,
          selectedSegmentIds: mergedRelated.map(
            (feature) => feature.properties.id,
          ),
        },
      });
    } catch (error) {
      console.log(error);
      if (this._state.selectedObject?.id !== id) {
        return;
      }
      if (fallbackFeature) {
        this.update({
          selectedObject: {
            ...this._state.selectedObject,
            feature: buildDisplayFeature(fallbackFeature, relatedFeatures),
          },
        });
        return;
      }
      if (this._state.selectedObject.feature) {
        return;
      }
      this.hideInfo();
    }
  };

  showInfo = (id: string, options?: ShowInfoOptions) => {
    const idType = options?.idType ?? AppConfig.defaultObjectIdType;
    const clickedFeature = options?.clickedFeature;
    const relatedFeatures =
      options?.relatedFeatures ??
      (clickedFeature ? [clickedFeature] : []);
    const segmentIds = relatedFeatures.map((feature) => feature.properties.id);
    const displayFeature = clickedFeature
      ? buildDisplayFeature(clickedFeature, relatedFeatures)
      : undefined;

    this.update({
      sidePanelView: "route",
      selectedObject: {
        id,
        idType,
        showInfo: true,
        feature: displayFeature,
      },
      mapFilters: {
        ...this._state.mapFilters,
        selectedObjectID: id,
        selectedSegmentIds: segmentIds,
      },
    });

    this.loadInfoData(id, idType, relatedFeatures, clickedFeature);
  };

  hideInfo = () => {
    this.update({
      sidePanelView:
        this._state.sidePanelView === "route" ? null : this._state.sidePanelView,
      selectedObject: null,
      mapFilters: clearedSelectionFilters(this._state),
    });
  };

  addMarker = (marker: MapMarker) => {
    this.update({
      markers: [...this._state.markers, marker],
      latestMarker: marker,
    });
  };

  urlUpdate = (urlState: URLState) => {
    const existingSelectedObjectID = this._state.selectedObject?.id ?? null;
    const showInfo = urlState.selectedObjectID ? urlState.showInfo : false;

    let sidePanelView: SidePanelView = null;
    if (urlState.aboutInfoOpen) {
      sidePanelView = "about";
    } else if (showInfo && urlState.selectedObjectID) {
      sidePanelView = "route";
    }

    this.update({
      sidePanelView,
      selectedObject: urlState.selectedObjectID
        ? {
            id: urlState.selectedObjectID,
            idType: urlState.selectedObjectIDType,
            showInfo,
          }
        : null,
      mapFilters: {
        ...this._state.mapFilters,
        selectedObjectID:
          showInfo &&
          urlState.selectedObjectIDType === AppConfig.defaultObjectIdType
            ? urlState.selectedObjectID
            : null,
        selectedSegmentIds:
          showInfo &&
          urlState.selectedObjectIDType === AppConfig.defaultObjectIdType &&
          urlState.selectedObjectID
            ? [urlState.selectedObjectID]
            : [],
      },
      markers: urlState.markers,
    });

    if (
      urlState.selectedObjectID &&
      urlState.selectedObjectID !== existingSelectedObjectID
    ) {
      this.loadInfoData(
        urlState.selectedObjectID,
        urlState.selectedObjectIDType,
        [],
      );
    }
  };

  private setSidePanel(view: SidePanelView) {
    this.update({ sidePanelView: view });
  }

  private toggleSidePanel(view: Exclude<SidePanelView, null>) {
    if (this._state.sidePanelView === view) {
      this.closeMenu();
    } else {
      this.setSidePanel(view);
    }
  }

  private update(changes: StateChanges): void {
    const state = this._state as unknown as Record<string, unknown>;
    Object.keys(changes).forEach((key) => {
      const change = (changes as Record<string, unknown>)[key];
      if (state[key] !== change) {
        state[key] = change;
      } else {
        delete (changes as Record<string, unknown>)[key];
      }
    });

    if (
      this._state.selectedObject?.showInfo &&
      this._state.sidePanelView === null
    ) {
      this._state.sidePanelView = "route";
      changes.sidePanelView = "route";
    }

    this.updateHandler(this._state, changes);
  }
}
