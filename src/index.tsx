import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import * as ReactDOM from "react-dom/client";
import { AppConfig } from "./AppConfig";
import { AboutModal } from "./components/AboutModal";
import { Map } from "./components/Map";
import Sidebar from "./components/Sidebar";
import State, { getInitialState, StateChanges } from "./components/State";
import StateReducer from "./components/StateReducer";
import { Themed } from "./components/Themed";
import { getURLState, updateURL } from "./components/URLHistory";
import "./index.css";
import { CameraPositionManager } from "./utils/CameraPositionManager";

function initialize() {
  const sidebarRoot = ReactDOM.createRoot(document.getElementById("sidebar")!);
  const aboutRoot = ReactDOM.createRoot(
    document.getElementById("about-modal")!,
  );

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
  update(store._state, store._state);
  map.setStyle(store._state.mapStyle);

  function update(state: State, changes: StateChanges) {
    updateURL({
      aboutInfoOpen: state.aboutInfoOpen,
      selectedObjectID: state.selectedObject?.id ?? null,
      selectedObjectIDType:
        state.selectedObject?.idType ?? AppConfig.defaultObjectIdType,
      showInfo: state.selectedObject?.showInfo ?? true,
      markers: state.markers,
    });

    if (changes.mapStyle !== undefined) {
      map.setStyle(state.mapStyle);
      localStorage.setItem("mapStyle", state.mapStyle);
    }

    if (
      changes.sidebarOpen !== undefined ||
      changes.mapStyle !== undefined
    ) {
      sidebarRoot.render(
        <Themed>
          <Sidebar
            eventBus={store}
            open={state.sidebarOpen}
            currentMapStyle={state.mapStyle}
          />
        </Themed>,
      );
    }

    if (changes.aboutInfoOpen !== undefined) {
      aboutRoot.render(
        <Themed>
          <AboutModal eventBus={store} open={state.aboutInfoOpen} />
        </Themed>,
      );
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
}

window.addEventListener("load", initialize);
