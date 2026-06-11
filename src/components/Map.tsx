import * as maplibregl from "maplibre-gl";
import { throttle } from "throttle-debounce";
import MapFilters, { defaultMapFilters } from "../MapFilters";
import { MapMarker } from "../MapMarker";
import { MAP_STYLE_URLS, MapStyle } from "../MapStyle";
import type { MapFeature } from "../types/FeatureTypes";
import { featuresForHighlight } from "../utils/FeatureGroup";
import {
  CameraPosition,
  CameraPositionManager,
} from "../utils/CameraPositionManager";
import EventBus from "./EventBus";
import {
  applyFilterRulesToMap,
  applyFiltersToStyleLayers,
  isFeatureVisibleUnderFilters,
} from "./MapFilterRules";
import { applyPaintRulesToMap } from "./MapPaintRules";
import { MapInteractionManager } from "./MapInteractionManager";
import { EsriAttribution } from "./EsriAttribution";
import { LogoControl } from "./LogoControl";
import { LayersControl } from "./LayersControl";
import { registerSatelliteTileProtocol } from "./SatelliteTileProtocol";
import { SelectedObject } from "./SelectedObject";
import { SidePanelControl } from "./SidePanelControl";
import State from "./State";
import { addUnitSystemChangeListener_NonReactive } from "./UnitSystemManager";

const SELECTED_SOURCE_ID = "openbikemap-selected";
const SELECTED_LAYER_ID = "openbikemap-selected-line";

export class Map {
  private map: maplibregl.Map;
  private markers: maplibregl.Marker[] = [];
  private currentStyle: MapStyle | null = null;
  private currentFilters: MapFilters = defaultMapFilters;
  private cameraPositionManager: CameraPositionManager;
  private sidePanelControl: SidePanelControl;
  private layersControl: LayersControl;
  private attributionControl: maplibregl.AttributionControl;
  private mapScaleControl: maplibregl.ScaleControl;
  private selectedFeature: MapFeature | null = null;

  constructor(
    cameraPosition: CameraPosition,
    containerID: string | HTMLElement,
    eventBus: EventBus,
    cameraPositionManager: CameraPositionManager,
  ) {
    this.cameraPositionManager = cameraPositionManager;
    const isEmbedded = window.self !== window.top;

    registerSatelliteTileProtocol();

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
    this.map.addControl(this.sidePanelControl);
    this.map.addControl(new maplibregl.NavigationControl(), "top-right");
    this.mapScaleControl = new maplibregl.ScaleControl({ maxWidth: 80 });
    this.map.addControl(this.mapScaleControl, "bottom-left");

    addUnitSystemChangeListener_NonReactive({
      onUnitSystemChange: (unitSystem) => {
        this.mapScaleControl.setUnit(unitSystem);
      },
      triggerWhenInitialized: true,
    });

    // Bottom-right controls stack upward; first added sits on the bottom edge.
    this.attributionControl = new maplibregl.AttributionControl({
      customAttribution: [
        '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      ],
    });
    this.map.addControl(this.attributionControl, "bottom-right");

    if (isEmbedded) {
      this.map.addControl(new LogoControl(), "bottom-right");
    }

    const geolocateControl = new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
    });
    this.map.addControl(geolocateControl, "bottom-right");

    this.layersControl = new LayersControl(eventBus);
    this.map.addControl(this.layersControl, "bottom-right");

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
      applyPaintRulesToMap(this.map);
      applyFilterRulesToMap(this.map, this.currentFilters);
      this.updateSelectedHighlight();
    });

    this.map.once("load", () => {
      const esriAttribution = new EsriAttribution(
        this.map,
        "https://static.arcgis.com/attribution/World_Imagery",
        this.attributionControl,
      );
      esriAttribution.autoManage();
    });
  }

  setStyle(style: MapStyle): void {
    if (this.currentStyle === style) {
      return;
    }
    this.currentStyle = style;
    this.map.setStyle(MAP_STYLE_URLS[style], {
      transformStyle: (_, newStyle) => {
        let transformed: maplibregl.StyleSpecification = newStyle;

        if (
          transformed.sources.satellite &&
          transformed.sources.satellite.type === "raster"
        ) {
          transformed = {
            ...transformed,
            sources: {
              ...transformed.sources,
              satellite: {
                ...transformed.sources.satellite,
                tiles: ["satellite-filtered://{z}/{y}/{x}"],
              },
            },
          };
        }

        return {
          ...transformed,
          layers: applyFiltersToStyleLayers(
            transformed.layers,
            this.currentFilters,
          ),
        };
      },
    });
  }

  private setFiltersUnthrottled = (filters: MapFilters) => {
    this.currentFilters = filters;
    this.sidePanelControl.updateMapFilters(filters);
    this.updateSelectedHighlight();
    this.waitForStyleReady(() => {
      applyFilterRulesToMap(this.map, filters);
    });
  };

  setFilters = throttle(100, this.setFiltersUnthrottled);

  updateSidePanel(state: State): void {
    this.layersControl.setStyle(state.mapStyle);
    const viewOptions: {
      mapFilters: MapFilters;
      mapStyle: MapStyle;
      infoFeature?: MapFeature | null;
    } = {
      mapFilters: state.mapFilters,
      mapStyle: state.mapStyle,
    };
    if (state.sidePanelView === "route") {
      viewOptions.infoFeature = state.selectedObject?.feature ?? null;
    } else {
      viewOptions.infoFeature = null;
    }
    this.sidePanelControl.setView(state.sidePanelView, viewOptions);
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

    if (this.map.getLayer(SELECTED_LAYER_ID)) {
      this.map.moveLayer(SELECTED_LAYER_ID);
    }
  }

  private updateSelectedHighlight(): void {
    if (!this.map.isStyleLoaded()) {
      return;
    }

    this.ensureSelectedHighlightLayer();

    const source = this.map.getSource(SELECTED_SOURCE_ID) as maplibregl.GeoJSONSource;
    const highlightFeature =
      this.selectedFeature &&
      isFeatureVisibleUnderFilters(this.selectedFeature, this.currentFilters)
        ? this.selectedFeature
        : null;
    source.setData({
      type: "FeatureCollection",
      features: highlightFeature ? featuresForHighlight(highlightFeature) : [],
    });
  }
}
