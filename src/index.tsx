import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import * as ReactDOM from "react-dom/client";
import { AppConfig } from "./AppConfig";
import { BetaBanner, BETA_BANNER_HEIGHT_PX } from "./components/BetaBanner";
import { Map } from "./components/Map";
import { Themed } from "./components/Themed";
import State, { getInitialState, StateChanges } from "./components/State";
import StateReducer from "./components/StateReducer";
import { getURLState, updateURL } from "./components/URLHistory";
import "./index.css";
import { applyUiTheme } from "./uiTheme";
import { CameraPositionManager } from "./utils/CameraPositionManager";
import { initCloudflareAnalytics } from "./utils/cloudflareAnalytics";
import { initMatomo, trackAppPageView } from "./utils/matomo";
import { syncPageMetadata } from "./utils/pageMetadata";

function initialize() {
  applyUiTheme();
  initCloudflareAnalytics();
  initMatomo();

  if (AppConfig.showBetaBanner) {
    document.documentElement.style.setProperty(
      "--beta-banner-height",
      `${BETA_BANNER_HEIGHT_PX}px`,
    );

    const bannerRoot = document.getElementById("beta-banner-root");
    if (bannerRoot) {
      ReactDOM.createRoot(bannerRoot).render(
        <Themed>
          <BetaBanner />
        </Themed>,
      );
    }
  }

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
      aboutInfoOpen:
        state.sidePanelView === "app" && state.appPanelTab === "about",
      selectedObjectID: state.selectedObject?.id ?? null,
      selectedObjectIDType:
        state.selectedObject?.idType ?? AppConfig.defaultObjectIdType,
      showInfo: state.selectedObject?.showInfo ?? false,
      markers: state.markers,
    });

    if (changes.mapStyle !== undefined) {
      map.setStyle(state.mapStyle);
      localStorage.setItem("mapStyle", state.mapStyle);
    }

    if (
      changes.sidePanelView !== undefined ||
      changes.appPanelTab !== undefined ||
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

    syncPageMetadata(state);

    if (changes.selectedObject !== undefined) {
      trackAppPageView(document.title);
    } else if (
      changes.sidePanelView !== undefined ||
      changes.appPanelTab !== undefined
    ) {
      if (state.sidePanelView === "app" && state.appPanelTab === "about") {
        trackAppPageView(document.title);
      }
    }
  }

  update(store._state, store._state);
}

window.addEventListener("load", initialize);
