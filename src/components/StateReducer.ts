import { AppConfig, ObjectIDType } from "../AppConfig";
import { MapMarker } from "../MapMarker";
import { MapStyle } from "../MapStyle";
import { TrailCategory } from "../types/TrailTypes";
import EventBus from "./EventBus";
import State, { StateChanges } from "./State";
import { URLState } from "./URLHistory";

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
    this.update({ sidebarOpen: true });
  };

  closeSidebar = () => {
    this.update({ sidebarOpen: false });
  };

  openAboutInfo = () => {
    this.update({ aboutInfoOpen: true });
  };

  closeAboutInfo = () => {
    this.update({ aboutInfoOpen: false });
  };

  setMapStyle = (style: MapStyle) => {
    this.update({ mapStyle: style });
  };

  toggleTrailCategory = (category: TrailCategory) => {
    const hidden = this._state.mapFilters.hiddenCategories;
    const hiddenCategories = hidden.includes(category)
      ? hidden.filter((c) => c !== category)
      : [...hidden, category];
    this.update({
      mapFilters: { ...this._state.mapFilters, hiddenCategories },
    });
  };

  showInfo = (
    id: string,
    idType: ObjectIDType = AppConfig.defaultObjectIdType,
  ) => {
    this.update({
      selectedObject: { id, idType, showInfo: true },
      mapFilters: { ...this._state.mapFilters, selectedObjectID: id },
    });
  };

  hideInfo = () => {
    this.update({
      selectedObject: null,
      mapFilters: { ...this._state.mapFilters, selectedObjectID: null },
    });
  };

  addMarker = (marker: MapMarker) => {
    this.update({
      markers: [...this._state.markers, marker],
      latestMarker: marker,
    });
  };

  urlUpdate = (urlState: URLState) => {
    const showInfo = urlState.selectedObjectID ? urlState.showInfo : false;
    this.update({
      aboutInfoOpen: urlState.aboutInfoOpen,
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
      },
      markers: urlState.markers,
    });
  };

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
    this.updateHandler(this._state, changes);
  }
}
