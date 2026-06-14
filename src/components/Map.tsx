import * as maplibregl from "maplibre-gl";
import { throttle } from "throttle-debounce";
import MapFilters, { defaultMapFilters } from "../MapFilters";
import { MapMarker } from "../MapMarker";
import { MAP_STYLE_URLS, MapStyle } from "../MapStyle";
import { FeatureType, type MapFeature } from "../types/FeatureTypes";
import { featuresForHighlight } from "../utils/FeatureGroup";
import { findRouteStageFeature } from "../utils/routeGroupSelection";
import { formatRouteStageTooltip } from "../utils/RouteStage";
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
import {
  applyPaintRulesToMap,
  applyPaintRulesToStyleLayers,
} from "./MapPaintRules";
import { MapInteractionManager } from "./MapInteractionManager";
import { EsriAttribution } from "./EsriAttribution";
import { LogoControl } from "./LogoControl";
import { LayersControl } from "./LayersControl";
import { registerSatelliteTileProtocol } from "./SatelliteTileProtocol";
import { SelectedObject, type RouteGroupSelection } from "./SelectedObject";
import { SidePanelControl } from "./SidePanelControl";
import State from "./State";
import { addUnitSystemChangeListener_NonReactive, getUnitSystem } from "./UnitSystemManager";

const SELECTED_SOURCE_ID = "openbikemap-selected";
const SELECTED_LAYER_ID = "openbikemap-selected-line";
const SELECTED_GROUP_SOURCE_ID = "openbikemap-selected-group";
const SELECTED_GROUP_LAYER_ID = "openbikemap-selected-group-line";
const SELECTED_STAGE_SOURCE_ID = "openbikemap-selected-stage";
const SELECTED_STAGE_LAYER_ID = "openbikemap-selected-stage-line";

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
  private routeGroupSelection: RouteGroupSelection | null = null;
  private hoveredStageId: string | null = null;
  private stageTooltipEl: HTMLDivElement;

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

    this.stageTooltipEl = document.createElement("div");
    this.stageTooltipEl.className = "route-stage-tooltip";
    this.stageTooltipEl.hidden = true;
    this.map.getContainer().appendChild(this.stageTooltipEl);

    new MapInteractionManager(this.map, eventBus, {
      getRouteGroup: () => this.routeGroupSelection,
      getLockedRouteGroupId: () => this.getLockedRouteGroupId(),
      onStageHover: (stageId, point) => this.setHoveredRouteStage(stageId, point),
    });

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
    this.map.on("error", (event) => {
      if (import.meta.env.DEV && event.error?.message) {
        console.warn("[map]", event.error.message);
      }
    });
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

  private transformLoadedStyle = (
    newStyle: maplibregl.StyleSpecification,
  ): maplibregl.StyleSpecification => {
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
      layers: applyPaintRulesToStyleLayers(
        applyFiltersToStyleLayers(transformed.layers, this.currentFilters),
      ),
    };
  };

  setStyle(style: MapStyle): void {
    if (this.currentStyle === style) {
      return;
    }
    this.currentStyle = style;
    this.map.setStyle(MAP_STYLE_URLS[style], {
      transformStyle: (_, newStyle) => this.transformLoadedStyle(newStyle),
    });
  }

  private applyFiltersToLiveMap = (): void => {
    applyFilterRulesToMap(this.map, this.currentFilters);
    applyPaintRulesToMap(this.map);
  };

  private setFiltersUnthrottled = (filters: MapFilters) => {
    this.currentFilters = filters;
    this.sidePanelControl.updateMapFilters(filters);

    if (this.map.isStyleLoaded()) {
      this.applyFiltersToLiveMap();
    } else {
      this.map.once("style.load", () => this.applyFiltersToLiveMap());
    }

    this.updateSelectedHighlight();
  };

  setFilters = this.setFiltersUnthrottled;

  updateSidePanel(state: State): void {
    this.layersControl.setStyle(state.mapStyle);
    const viewOptions: {
      mapFilters: MapFilters;
      mapStyle: MapStyle;
      infoFeature?: MapFeature | null;
      routeGroup?: RouteGroupSelection | null;
    } = {
      mapFilters: state.mapFilters,
      mapStyle: state.mapStyle,
    };
    if (state.sidePanelView === "route") {
      viewOptions.infoFeature = state.selectedObject?.feature ?? null;
      viewOptions.routeGroup = state.selectedObject?.routeGroup ?? null;
    } else {
      viewOptions.infoFeature = null;
      viewOptions.routeGroup = null;
    }
    this.sidePanelControl.setView(state.sidePanelView, viewOptions);
  }

  setSelectedObject(selectedObject: SelectedObject | null | undefined): void {
    this.routeGroupSelection = selectedObject?.routeGroup ?? null;
    this.hoveredStageId = null;
    this.hideStageTooltip();
    const feature =
      selectedObject?.showInfo && selectedObject.feature
        ? selectedObject.feature
        : null;
    this.selectedFeature = feature;
    this.updateSelectedHighlight();
  }

  setHoveredRouteStage(
    stageId: string | null,
    point?: maplibregl.Point,
  ): void {
    if (this.hoveredStageId !== stageId) {
      this.hoveredStageId = stageId;
      this.updateSelectedHighlight();
    }
    this.updateStageTooltip(stageId, point);
  }

  private hideStageTooltip(): void {
    this.stageTooltipEl.hidden = true;
  }

  private updateStageTooltip(
    stageId: string | null,
    point?: maplibregl.Point,
  ): void {
    if (!stageId || !point || !this.routeGroupSelection) {
      this.hideStageTooltip();
      return;
    }

    const stage = findRouteStageFeature(this.routeGroupSelection, stageId);
    if (!stage) {
      this.hideStageTooltip();
      return;
    }

    this.stageTooltipEl.textContent = formatRouteStageTooltip(
      stage,
      getUnitSystem(),
    );
    this.stageTooltipEl.hidden = false;
    this.positionStageTooltip(point);
  }

  /** Keep tooltip clear of oversized system cursors (hotspot is usually top-left). */
  private positionStageTooltip(point: maplibregl.Point): void {
    const container = this.map.getContainer();
    const tooltip = this.stageTooltipEl;
    const padding = 8;
    const cursorGap = 56;
    const width = tooltip.offsetWidth;
    const height = tooltip.offsetHeight;
    const maxX = Math.max(padding, container.clientWidth - width - padding);
    const maxY = Math.max(padding, container.clientHeight - height - padding);

    // Prefer above-right of hotspot so large cursors (extending down/right) don't cover it.
    let x = point.x + 24;
    let y = point.y - height - cursorGap;

    if (y < padding) {
      // Not enough room above — place well below/right instead.
      x = point.x + cursorGap;
      y = point.y + cursorGap;
    }

    x = Math.min(Math.max(x, padding), maxX);
    y = Math.min(Math.max(y, padding), maxY);

    tooltip.style.transform = `translate(${x}px, ${y}px)`;
  }

  private getLockedRouteGroupId(): string | null {
    if (this.routeGroupSelection) {
      return this.routeGroupSelection.groupId;
    }
    if (
      this.selectedFeature?.properties.type === FeatureType.Route &&
      this.selectedFeature.properties.groupId
    ) {
      return this.selectedFeature.properties.groupId;
    }
    return null;
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

  private ensureSelectedHighlightLayer(): void {
    this.ensureHighlightSourceAndLayer(
      SELECTED_SOURCE_ID,
      SELECTED_LAYER_ID,
      { color: "#fdd835", width: 10 },
    );
    this.ensureHighlightSourceAndLayer(
      SELECTED_GROUP_SOURCE_ID,
      SELECTED_GROUP_LAYER_ID,
      { color: "#fdd835", width: 8 },
    );
    this.ensureHighlightSourceAndLayer(
      SELECTED_STAGE_SOURCE_ID,
      SELECTED_STAGE_LAYER_ID,
      { color: "#ff9800", width: 14 },
    );

    for (const layerId of [
      SELECTED_LAYER_ID,
      SELECTED_GROUP_LAYER_ID,
      SELECTED_STAGE_LAYER_ID,
    ]) {
      if (this.map.getLayer(layerId)) {
        this.map.moveLayer(layerId);
      }
    }
  }

  private ensureHighlightSourceAndLayer(
    sourceId: string,
    layerId: string,
    paint: { color: string; width: number },
  ): void {
    if (!this.map.getSource(sourceId)) {
      this.map.addSource(sourceId, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
    }

    if (!this.map.getLayer(layerId)) {
      this.map.addLayer({
        id: layerId,
        type: "line",
        source: sourceId,
        paint: {
          "line-color": paint.color,
          "line-width": paint.width,
          "line-opacity": 0.95,
        },
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
      });
    }
  }

  private setHighlightSourceData(
    sourceId: string,
    features: MapFeature[],
  ): void {
    const source = this.map.getSource(sourceId) as maplibregl.GeoJSONSource;
    source.setData({
      type: "FeatureCollection",
      features: features.flatMap((feature) => featuresForHighlight(feature)),
    });
  }

  private updateSelectedHighlight(): void {
    if (!this.map.isStyleLoaded()) {
      return;
    }

    this.ensureSelectedHighlightLayer();

    const routeGroup = this.routeGroupSelection;
    const visibleStages = routeGroup?.stageFeatures.filter(
      (feature) => isFeatureVisibleUnderFilters(feature, this.currentFilters),
    );

    if (routeGroup && visibleStages && visibleStages.length > 0) {
      this.setHighlightSourceData(SELECTED_GROUP_SOURCE_ID, visibleStages);
      this.setHighlightSourceData(SELECTED_SOURCE_ID, []);

      const orangeStageId = this.hoveredStageId ?? routeGroup.activeStageId;
      const orangeStage = orangeStageId
        ? findRouteStageFeature(routeGroup, orangeStageId)
        : undefined;
      const visibleOrangeStage =
        orangeStage &&
        isFeatureVisibleUnderFilters(orangeStage, this.currentFilters)
          ? orangeStage
          : null;
      this.setHighlightSourceData(
        SELECTED_STAGE_SOURCE_ID,
        visibleOrangeStage ? [visibleOrangeStage] : [],
      );
      return;
    }

    this.setHighlightSourceData(SELECTED_GROUP_SOURCE_ID, []);
    this.setHighlightSourceData(SELECTED_STAGE_SOURCE_ID, []);

    const highlightFeature =
      this.selectedFeature &&
      isFeatureVisibleUnderFilters(this.selectedFeature, this.currentFilters)
        ? this.selectedFeature
        : null;
    this.setHighlightSourceData(
      SELECTED_SOURCE_ID,
      highlightFeature ? [highlightFeature] : [],
    );
  }
}
