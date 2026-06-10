import * as maplibregl from "maplibre-gl";
import { throttle } from "throttle-debounce";
import MapFilters, { defaultMapFilters } from "../MapFilters";
import { MapMarker } from "../MapMarker";
import { MAP_STYLE_URLS, MapStyle } from "../MapStyle";
import type { MapFeature } from "../types/FeatureTypes";
import {
  CameraPosition,
  CameraPositionManager,
} from "../utils/CameraPositionManager";
import EventBus from "./EventBus";
import { applyFilterRulesToMap } from "./MapFilterRules";
import { MapInteractionManager } from "./MapInteractionManager";
import { LogoControl } from "./LogoControl";
import { LayersControl } from "./LayersControl";
import { MenuControl } from "./MenuControl";
import { SelectedObject } from "./SelectedObject";
import { SidePanelControl } from "./SidePanelControl";
import State from "./State";

const SELECTED_SOURCE_ID = "openbikemap-selected";
const SELECTED_LAYER_ID = "openbikemap-selected-line";

export class Map {
  private map: maplibregl.Map;
  private markers: maplibregl.Marker[] = [];
  private currentStyle: MapStyle | null = null;
  private currentFilters: MapFilters = defaultMapFilters;
  private cameraPositionManager: CameraPositionManager;
  private sidePanelControl: SidePanelControl;
  private selectedFeature: MapFeature | null = null;

  constructor(
    cameraPosition: CameraPosition,
    containerID: string | HTMLElement,
    eventBus: EventBus,
    cameraPositionManager: CameraPositionManager,
  ) {
    this.cameraPositionManager = cameraPositionManager;
    const isEmbedded = window.self !== window.top;

    this.map = new maplibregl.Map({
      container: containerID,
      center: cameraPosition.center,
      zoom: cameraPosition.zoom,
      bearing: cameraPosition.bearing,
      pitch: cameraPosition.pitch,
      hash: false,
      attributionControl: false,
      cooperativeGestures: isEmbedded,
    });

    new MapInteractionManager(this.map, eventBus);

    this.sidePanelControl = new SidePanelControl(
      eventBus,
      this.currentFilters,
      MapStyle.Terrain,
    );
    this.map.addControl(new MenuControl(eventBus), "top-left");
    this.map.addControl(this.sidePanelControl);
    this.map.addControl(new LayersControl(eventBus), "bottom-right");
    this.map.addControl(new maplibregl.NavigationControl(), "top-right");
    this.map.addControl(
      new maplibregl.ScaleControl({ maxWidth: 80 }),
      "bottom-left",
    );
    this.map.addControl(
      new maplibregl.AttributionControl({
        customAttribution: [
          '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        ],
      }),
      "bottom-right",
    );

    if (isEmbedded) {
      this.map.addControl(new LogoControl(), "bottom-right");
    }

    const geolocateControl = new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
    });
    this.map.addControl(geolocateControl, "bottom-right");

    navigator.permissions?.query({ name: "geolocation" }).then((result) => {
      if (result.state === "denied") {
        this.map.removeControl(geolocateControl);
      }
    });

    const saveCamera = throttle(500, () => {
      const center = this.map.getCenter();
      this.cameraPositionManager.savePosition(
        center,
        this.map.getZoom(),
        this.map.getBearing(),
        this.map.getPitch(),
      );
    });

    this.map.on("moveend", saveCamera);
    this.map.on("style.load", () => {
      applyFilterRulesToMap(this.map, this.currentFilters);
      this.updateSelectedHighlight();
    });
  }

  setStyle(style: MapStyle): void {
    if (this.currentStyle === style) {
      return;
    }
    this.currentStyle = style;
    this.map.setStyle(MAP_STYLE_URLS[style]);
  }

  private setFiltersUnthrottled = (filters: MapFilters) => {
    this.currentFilters = filters;
    this.sidePanelControl.setView(this.sidePanelControl.getView(), {
      mapFilters: filters,
    });
    this.waitForStyleReady(() => {
      applyFilterRulesToMap(this.map, this.currentFilters);
    });
  };

  setFilters = throttle(100, this.setFiltersUnthrottled);

  updateSidePanel(state: State): void {
    this.sidePanelControl.setView(state.sidePanelView, {
      mapFilters: state.mapFilters,
      mapStyle: state.mapStyle,
      infoFeature:
        state.sidePanelView === "info" && state.selectedObject?.feature
          ? state.selectedObject.feature
          : null,
    });
  }

  setSelectedObject(selectedObject: SelectedObject | null | undefined): void {
    const feature =
      selectedObject?.showInfo && selectedObject.feature
        ? selectedObject.feature
        : null;
    this.selectedFeature = feature;
    this.updateSelectedHighlight();
  }

  setMarkers(markers: MapMarker[]): void {
    this.markers.forEach((marker) => marker.remove());
    this.markers = markers.map((marker) => {
      return new maplibregl.Marker().setLngLat(marker.coordinates).addTo(this.map);
    });
  }

  flyTo(coordinates: [number, number]): void {
    this.map.flyTo({ center: coordinates, zoom: Math.max(this.map.getZoom(), 12) });
  }

  getMaplibreMap(): maplibregl.Map {
    return this.map;
  }

  private waitForStyleReady(callback: () => void): void {
    if (this.map.isStyleLoaded()) {
      callback();
      return;
    }
    this.map.once("style.load", callback);
  }

  private ensureSelectedHighlightLayer(): void {
    if (!this.map.getSource(SELECTED_SOURCE_ID)) {
      this.map.addSource(SELECTED_SOURCE_ID, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
    }

    if (!this.map.getLayer(SELECTED_LAYER_ID)) {
      this.map.addLayer({
        id: SELECTED_LAYER_ID,
        type: "line",
        source: SELECTED_SOURCE_ID,
        paint: {
          "line-color": "#fdd835",
          "line-width": 10,
          "line-opacity": 0.95,
        },
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
      });
    }
  }

  private updateSelectedHighlight(): void {
    if (!this.map.isStyleLoaded()) {
      return;
    }

    this.ensureSelectedHighlightLayer();

    const source = this.map.getSource(SELECTED_SOURCE_ID) as maplibregl.GeoJSONSource;
    source.setData({
      type: "FeatureCollection",
      features: this.selectedFeature ? [this.selectedFeature] : [],
    });
  }
}
