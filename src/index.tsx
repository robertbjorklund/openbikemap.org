import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { AppConfig } from "./AppConfig";
import { Map } from "./components/Map";
import State, { getInitialState, StateChanges } from "./components/State";
import StateReducer from "./components/StateReducer";
import { getURLState, updateURL } from "./components/URLHistory";
import "./index.css";
import { CameraPositionManager } from "./utils/CameraPositionManager";

function initialize() {
  const store = new StateReducer(getInitialState(), update);

  window.addEventListener("popstate", () => {
    store.urlUpdate(getURLState());
  });

  maplibregl.setRTLTextPlugin(
    "https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.3.0/dist/mapbox-gl-rtl-text.js",
    false,
  );

  const cameraPositionManager = new CameraPositionManager();
  const map = new Map(
    cameraPositionManager.getInitialPosition(),
    "map",
    store,
    cameraPositionManager,
  );

  store.urlUpdate(getURLState());
  map.setStyle(store._state.mapStyle);
  map.setFilters(store._state.mapFilters);
  map.updateSidePanel(store._state);

  function update(state: State, changes: StateChanges) {
    updateURL({
      aboutInfoOpen: state.sidePanelView === "about",
      selectedObjectID: state.selectedObject?.id ?? null,
      selectedObjectIDType:
        state.selectedObject?.idType ?? AppConfig.defaultObjectIdType,
      showInfo:
        state.sidePanelView === "info" &&
        (state.selectedObject?.showInfo ?? false),
      markers: state.markers,
    });

    if (changes.mapStyle !== undefined) {
      map.setStyle(state.mapStyle);
      localStorage.setItem("mapStyle", state.mapStyle);
    }

    if (
      changes.sidePanelView !== undefined ||
      changes.selectedObject !== undefined ||
      changes.mapFilters !== undefined ||
      changes.mapStyle !== undefined
    ) {
      map.updateSidePanel(state);
    }

    if (changes.selectedObject !== undefined) {
      map.setSelectedObject(changes.selectedObject);
    }

    if (changes.mapFilters !== undefined) {
      map.setFilters(state.mapFilters);
    }

    if (changes.markers !== undefined) {
      map.setMarkers(state.markers);
    }

    if (changes.latestMarker !== undefined) {
      map.flyTo(changes.latestMarker.coordinates);
    }
  }

  update(store._state, store._state);
}

window.addEventListener("load", initialize);
