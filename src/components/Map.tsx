import * as maplibregl from "maplibre-gl";
import * as ReactDOM from "react-dom/client";
import { throttle } from "throttle-debounce";
import MapFilters, { defaultMapFilters } from "../MapFilters";
import { MapMarker } from "../MapMarker";
import { MAP_STYLE_URLS, MapStyle } from "../MapStyle";
import { FeatureType, type MapFeature } from "../types/FeatureTypes";
import { findRelatedFeatures } from "../utils/FeatureGroup";
import {
  normalizeHighlightFeatures,
  HIGHLIGHT_LABEL_OVERLAY_FILTER,
  IMBA_TRAIL_HIGHLIGHT_OVERLAY_FILTER,
  ROUTE_HIGHLIGHT_OVERLAY_FILTER,
  STS_TRAIL_HIGHLIGHT_OVERLAY_FILTER,
} from "../utils/routeHighlightProperties";
import { findRouteStageFeature } from "../utils/routeGroupSelection";
import {
  panMapToCenterFeatureInVisibleArea,
} from "../utils/mapInfoPanelFocus";
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
  applyOpenBikeMapLineMinZoomToMap,
  applyOpenBikeMapLineMinZoomToStyleLayers,
} from "./MapLayerZoomRules";
import {
  applyPaintRulesToMap,
  applyPaintRulesToStyleLayers,
} from "./MapPaintRules";
import {
  MapInteractionManager,
  type RouteClickContext,
  type TrailClickContext,
} from "./MapInteractionManager";
import { RouteDisambiguationDialog } from "./RouteDisambiguationDialog";
import { TrailDisambiguationDialog } from "./TrailDisambiguationDialog";
import { CameraPositionConsentSnackbar } from "./CameraPositionConsentSnackbar";
import { Themed } from "./Themed";
import { EsriAttribution } from "./EsriAttribution";
import { FilterControl } from "./FilterControl";
import { LegendControl } from "./LegendControl";
import { LogoControl } from "./LogoControl";
import { MapNavigationControl } from "./MapNavigationControl";
import { StyledGeolocateControl } from "./StyledGeolocateControl";
import { registerSatelliteTileProtocol } from "./SatelliteTileProtocol";
import {
  attachAttributionAutoCollapse,
} from "../utils/attributionControl";
import { SelectedObject, type RouteGroupSelection } from "./SelectedObject";
import { SidePanelControl } from "./SidePanelControl";
import State from "./State";
import { OPENBIKEMAP_LINE_MIN_ZOOM } from "../constants/OpenBikeMapLayerZoom";
import {
  TRAIL_IMBA_LINE_WIDTH_EXPRESSION,
  TRAIL_STS_CENTER_LINE_COLOR,
} from "../types/MtbTrailColors";
import {
  isCameraPositionConsentPending,
  setCameraPositionConsent,
} from "../utils/cameraPositionConsent";
import { addUnitSystemChangeListener_NonReactive, getUnitSystem } from "./UnitSystemManager";

const SELECTED_SOURCE_ID = "openbikemap-selected";
const SELECTED_GLOW_LAYER_ID = "openbikemap-selected-line-glow";
const SELECTED_GROUP_SOURCE_ID = "openbikemap-selected-group";
const SELECTED_GROUP_GLOW_LAYER_ID = "openbikemap-selected-group-line-glow";
const SELECTED_STAGE_SOURCE_ID = "openbikemap-selected-stage";
const SELECTED_STAGE_GLOW_LAYER_ID = "openbikemap-selected-stage-line-glow";

const ROUTE_LAYER_STACK = [
  "routes-casing",
  "routes",
  "routes-label-stripe",
  "routes-label",
  "tappable-route",
] as const;

const TRAIL_LAYER_STACK = [
  "trails-casing",
  "trails",
  "trails-imba",
  "trails-label-stripe",
  "trails-label",
  "tappable-trail",
] as const;

const FEATURE_HIGHLIGHT_LAYER_STACK = [
  ...ROUTE_LAYER_STACK,
  ...TRAIL_LAYER_STACK,
] as const;

const ROUTE_HIGHLIGHT_GLOW_LAYER_IDS = [
  SELECTED_GROUP_GLOW_LAYER_ID,
  SELECTED_GLOW_LAYER_ID,
  SELECTED_STAGE_GLOW_LAYER_ID,
] as const;

interface RouteHighlightOutline {
  color: string;
  width: maplibregl.ExpressionSpecification;
  opacity: maplibregl.ExpressionSpecification;
}

interface RouteHighlightGlow {
  color: string;
  opacity: number;
  width: maplibregl.ExpressionSpecification;
  blur: maplibregl.ExpressionSpecification | number;
  outline?: RouteHighlightOutline;
}

function highlightOutlineLayerId(glowLayerId: string): string {
  return `${glowLayerId}-outline`;
}

function highlightCasingLayerId(glowLayerId: string): string {
  return glowLayerId.replace("-line-glow", "-line-casing");
}

function highlightCoreLayerId(glowLayerId: string): string {
  return glowLayerId.replace("-line-glow", "-line");
}

function highlightLabelStripeLayerId(glowLayerId: string): string {
  return glowLayerId.replace("-line-glow", "-label-stripe");
}

function highlightLabelLayerId(glowLayerId: string): string {
  return glowLayerId.replace("-line-glow", "-label");
}

function highlightStsOuterLayerId(glowLayerId: string): string {
  return glowLayerId.replace("-line-glow", "-sts-outer");
}

function highlightStsCenterLayerId(glowLayerId: string): string {
  return glowLayerId.replace("-line-glow", "-sts-center");
}

function highlightImbaLineLayerId(glowLayerId: string): string {
  return glowLayerId.replace("-line-glow", "-imba-line");
}

const HIGHLIGHT_LINE_COLOR: maplibregl.ExpressionSpecification = [
  "coalesce",
  ["get", "color"],
  "#7b1fa2",
];

const HIGHLIGHT_LABEL_TEXT: maplibregl.ExpressionSpecification = [
  "coalesce",
  ["get", "name"],
  ["get", "ref"],
];

const ROUTE_HIGHLIGHT_CORE_LINE_WIDTH: maplibregl.ExpressionSpecification = [
  "interpolate",
  ["linear"],
  ["zoom"],
  OPENBIKEMAP_LINE_MIN_ZOOM,
  1.2,
  10,
  2.2,
  14,
  4,
  16,
  4.5,
];

const ROUTE_HIGHLIGHT_CASING_LINE_WIDTH: maplibregl.ExpressionSpecification = [
  "interpolate",
  ["linear"],
  ["zoom"],
  OPENBIKEMAP_LINE_MIN_ZOOM,
  2.5,
  10,
  4.5,
  14,
  8,
  16,
  9,
];

const TRAIL_HIGHLIGHT_STS_CASING_WIDTH: maplibregl.ExpressionSpecification = [
  "interpolate",
  ["linear"],
  ["zoom"],
  OPENBIKEMAP_LINE_MIN_ZOOM,
  2,
  10,
  3,
  14,
  6.5,
  16,
  7,
];

const TRAIL_HIGHLIGHT_STS_CENTER_WIDTH: maplibregl.ExpressionSpecification = [
  "interpolate",
  ["linear"],
  ["zoom"],
  OPENBIKEMAP_LINE_MIN_ZOOM,
  0.8,
  10,
  1.2,
  14,
  2.5,
  16,
  3,
];

const TRAIL_HIGHLIGHT_IMBA_LINE_WIDTH: maplibregl.ExpressionSpecification =
  JSON.parse(
    JSON.stringify(TRAIL_IMBA_LINE_WIDTH_EXPRESSION),
  ) as maplibregl.ExpressionSpecification;

const TRAIL_HIGHLIGHT_IMBA_DASHARRAY: [number, number] = [1, 1.5];

const ROUTE_HIGHLIGHT_GLOW_WIDTH: maplibregl.ExpressionSpecification = [
  "interpolate",
  ["linear"],
  ["zoom"],
  8,
  8,
  11,
  12,
  14,
  21,
  16,
  24,
  18,
  24,
];

const ROUTE_HIGHLIGHT_YELLOW_GLOW_WIDTH: maplibregl.ExpressionSpecification = [
  "interpolate",
  ["linear"],
  ["zoom"],
  8,
  11,
  11,
  14,
  14,
  24,
  16,
  26,
  18,
  26,
];

const ROUTE_HIGHLIGHT_YELLOW_OUTLINE_WIDTH: maplibregl.ExpressionSpecification = [
  "interpolate",
  ["linear"],
  ["zoom"],
  8,
  15,
  11,
  18,
  14,
  28,
  16,
  30,
  18,
  30,
];

/** Dark edge around yellow glow — strongest when zoomed out. */
const ROUTE_HIGHLIGHT_YELLOW_OUTLINE_OPACITY: maplibregl.ExpressionSpecification = [
  "interpolate",
  ["linear"],
  ["zoom"],
  8,
  0.95,
  10,
  0.75,
  12,
  0.35,
  14,
  0,
];

const ROUTE_HIGHLIGHT_YELLOW_GLOW_BLUR: maplibregl.ExpressionSpecification = [
  "interpolate",
  ["linear"],
  ["zoom"],
  8,
  0.2,
  11,
  1,
  14,
  1.5,
];

const ROUTE_HIGHLIGHT_GLOW_BLUR = 1.5;

const ROUTE_HIGHLIGHT_YELLOW_GLOW: RouteHighlightGlow = {
  color: "#ffeb3b",
  opacity: 0.88,
  width: ROUTE_HIGHLIGHT_YELLOW_GLOW_WIDTH,
  blur: ROUTE_HIGHLIGHT_YELLOW_GLOW_BLUR,
  outline: {
    color: "#8d6e00",
    width: ROUTE_HIGHLIGHT_YELLOW_OUTLINE_WIDTH,
    opacity: ROUTE_HIGHLIGHT_YELLOW_OUTLINE_OPACITY,
  },
};

const ROUTE_HIGHLIGHT_ORANGE_GLOW: RouteHighlightGlow = {
  color: "#ff9800",
  opacity: 0.78,
  width: ROUTE_HIGHLIGHT_GLOW_WIDTH,
  blur: ROUTE_HIGHLIGHT_GLOW_BLUR,
};

export class Map {
  private map: maplibregl.Map;
  private markers: maplibregl.Marker[] = [];
  private currentStyle: MapStyle | null = null;
  private currentFilters: MapFilters = defaultMapFilters;
  private cameraPositionManager: CameraPositionManager;
  private sidePanelControl: SidePanelControl;
  private filterControl: FilterControl;
  private legendControl: LegendControl;
  private attributionControl: maplibregl.AttributionControl;
  private cancelAttributionAutoCollapse: (() => void) | null = null;
  private mapScaleControl: maplibregl.ScaleControl;
  private selectedFeature: MapFeature | null = null;
  private routeGroupSelection: RouteGroupSelection | null = null;
  private hoveredStageId: string | null = null;
  private stageTooltipEl: HTMLDivElement;
  private infoPanFeatureId: string | null = null;
  private eventBus: EventBus;
  private routeDisambiguationHost: HTMLDivElement;
  private routeDisambiguationRoot: ReactDOM.Root | null = null;
  private trailDisambiguationHost: HTMLDivElement;
  private trailDisambiguationRoot: ReactDOM.Root | null = null;
  private cameraConsentHost: HTMLDivElement;
  private cameraConsentRoot: ReactDOM.Root | null = null;
  private cameraConsentOpen = false;

  constructor(
    cameraPosition: CameraPosition,
    containerID: string | HTMLElement,
    eventBus: EventBus,
    cameraPositionManager: CameraPositionManager,
  ) {
    this.cameraPositionManager = cameraPositionManager;
    this.eventBus = eventBus;
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

    this.routeDisambiguationHost = document.createElement("div");
    this.map.getContainer().appendChild(this.routeDisambiguationHost);

    this.trailDisambiguationHost = document.createElement("div");
    this.map.getContainer().appendChild(this.trailDisambiguationHost);

    this.cameraConsentHost = document.createElement("div");
    this.map.getContainer().appendChild(this.cameraConsentHost);

    new MapInteractionManager(this.map, eventBus, {
      getRouteGroup: () => this.routeGroupSelection,
      getLockedRouteGroupId: () => this.getLockedRouteGroupId(),
      getMapFilters: () => this.currentFilters,
      onStageHover: (stageId, point) => this.setHoveredRouteStage(stageId, point),
      onRouteDisambiguation: (context) => this.showRouteDisambiguation(context),
      onTrailDisambiguation: (context) => this.showTrailDisambiguation(context),
    });

    this.sidePanelControl = new SidePanelControl(
      eventBus,
      this.currentFilters,
    );
    this.map.addControl(this.sidePanelControl);

    this.mapScaleControl = new maplibregl.ScaleControl({ maxWidth: 80 });
    this.map.addControl(this.mapScaleControl, "bottom-left");

    this.filterControl = new FilterControl(eventBus, MapStyle.Terrain);
    this.map.addControl(this.filterControl, "bottom-left");

    this.legendControl = new LegendControl();
    this.map.addControl(this.legendControl, "bottom-left");
    this.legendControl.setPeerMenuClose(() => this.filterControl.closeMenu());
    this.filterControl.setPeerMenuClose(() => this.legendControl.closePanel());

    addUnitSystemChangeListener_NonReactive({
      onUnitSystemChange: (unitSystem) => {
        this.mapScaleControl.setUnit(unitSystem);
      },
      triggerWhenInitialized: true,
    });

    // Compact (i) toggle: expanded on load, collapses on pan/zoom or after 5s (OSM guidelines).
    this.attributionControl = new maplibregl.AttributionControl({
      compact: true,
      customAttribution: [
        '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      ],
    });
    this.map.addControl(this.attributionControl, "bottom-right");
    this.cancelAttributionAutoCollapse?.();
    this.cancelAttributionAutoCollapse = attachAttributionAutoCollapse(this.map);

    if (isEmbedded) {
      this.map.addControl(new LogoControl(), "bottom-right");
    }

    const geolocateControl = new StyledGeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
    });
    this.map.addControl(geolocateControl, "bottom-right");
    this.map.addControl(new MapNavigationControl(), "bottom-right");

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

    if (!isEmbedded) {
      this.map.on("click", this.onMapClickForCameraConsent);
    }

    this.map.on("error", (event) => {
      if (import.meta.env.DEV && event.error?.message) {
        console.warn("[map]", event.error.message);
      }
    });
    this.map.on("style.load", () => {
      applyOpenBikeMapLineMinZoomToMap(this.map);
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
      layers: applyOpenBikeMapLineMinZoomToStyleLayers(
        applyPaintRulesToStyleLayers(
          applyFiltersToStyleLayers(transformed.layers, this.currentFilters),
        ),
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
    applyOpenBikeMapLineMinZoomToMap(this.map);
    applyFilterRulesToMap(this.map, this.currentFilters);
    applyPaintRulesToMap(this.map);
  };

  private setFiltersUnthrottled = (filters: MapFilters) => {
    this.currentFilters = filters;
    this.sidePanelControl.updateMapFilters(filters);
    this.legendControl.setMapFilters(filters);

    if (this.map.isStyleLoaded()) {
      this.applyFiltersToLiveMap();
    } else {
      this.map.once("style.load", () => this.applyFiltersToLiveMap());
    }

    this.updateSelectedHighlight();
  };

  setFilters = this.setFiltersUnthrottled;

  updateSidePanel(state: State): void {
    this.filterControl.setMapStyle(state.mapStyle);
    const viewOptions: {
      mapFilters: MapFilters;
      infoFeature?: MapFeature | null;
      routeGroup?: RouteGroupSelection | null;
      hasRouteSelection?: boolean;
      routeDetailsExpanded?: boolean;
      appPanelTab?: import("./AppPanelTab").AppPanelTab;
    } = {
      mapFilters: state.mapFilters,
      appPanelTab: state.appPanelTab,
    };
    viewOptions.infoFeature = state.selectedObject?.feature ?? null;
    viewOptions.routeGroup = state.selectedObject?.routeGroup ?? null;
    viewOptions.hasRouteSelection = state.selectedObject != null;
    viewOptions.routeDetailsExpanded = state.selectedObject?.showInfo ?? true;
    this.sidePanelControl.setView(state.sidePanelView, viewOptions);
  }

  setSelectedObject(selectedObject: SelectedObject | null | undefined): void {
    this.closeRouteDisambiguation();
    this.closeTrailDisambiguation();
    this.routeGroupSelection = selectedObject?.routeGroup ?? null;
    this.hoveredStageId = null;
    this.hideStageTooltip();
    const feature = selectedObject?.feature ?? null;
    this.selectedFeature = feature;
    this.updateSelectedHighlight();
    this.focusMapForInfoPanel(selectedObject);
  }

  private onMapClickForCameraConsent = (): void => {
    if (!isCameraPositionConsentPending() || this.cameraConsentOpen) {
      return;
    }
    this.renderCameraPositionConsent(true);
  };

  private renderCameraPositionConsent(open: boolean): void {
    this.cameraConsentOpen = open;

    if (!this.cameraConsentRoot) {
      this.cameraConsentRoot = ReactDOM.createRoot(this.cameraConsentHost);
    }

    this.cameraConsentRoot.render(
      open ? (
        <Themed>
          <CameraPositionConsentSnackbar
            open
            onAccept={() => {
              setCameraPositionConsent("granted");
              this.cameraPositionManager.savePosition(
                this.map.getCenter(),
                this.map.getZoom(),
                this.map.getBearing(),
                this.map.getPitch(),
              );
              this.renderCameraPositionConsent(false);
            }}
            onDecline={() => {
              setCameraPositionConsent("denied");
              this.renderCameraPositionConsent(false);
            }}
          />
        </Themed>
      ) : null,
    );
  }

  private showRouteDisambiguation(context: RouteClickContext): void {
    this.closeTrailDisambiguation();
    this.renderRouteDisambiguation(context);
  }

  private closeRouteDisambiguation(): void {
    this.renderRouteDisambiguation(null);
  }

  private showTrailDisambiguation(context: TrailClickContext): void {
    this.closeRouteDisambiguation();
    this.renderTrailDisambiguation(context);
  }

  private closeTrailDisambiguation(): void {
    this.renderTrailDisambiguation(null);
  }

  private renderTrailDisambiguation(context: TrailClickContext | null): void {
    if (!this.trailDisambiguationRoot) {
      this.trailDisambiguationRoot = ReactDOM.createRoot(
        this.trailDisambiguationHost,
      );
    }

    this.trailDisambiguationRoot.render(
      context ? (
        <Themed>
          <TrailDisambiguationDialog
            open
            candidates={context.candidates}
            onSelect={(feature) => {
              this.closeTrailDisambiguation();
              this.eventBus.showInfo(feature.properties.id, {
                clickedFeature: feature,
                relatedFeatures: findRelatedFeatures(this.map, feature),
                focusLngLat: context.focusLngLat,
                focusClickX: context.focusClickX,
              });
            }}
            onClose={() => this.closeTrailDisambiguation()}
          />
        </Themed>
      ) : null,
    );
  }

  private renderRouteDisambiguation(context: RouteClickContext | null): void {
    if (!this.routeDisambiguationRoot) {
      this.routeDisambiguationRoot = ReactDOM.createRoot(
        this.routeDisambiguationHost,
      );
    }

    this.routeDisambiguationRoot.render(
      context ? (
        <Themed>
          <RouteDisambiguationDialog
            open
            candidates={context.candidates}
            onSelect={(feature) => {
              this.closeRouteDisambiguation();
              this.eventBus.showInfo(feature.properties.id, {
                clickedFeature: feature,
                relatedFeatures: findRelatedFeatures(this.map, feature),
                focusLngLat: context.focusLngLat,
                focusClickX: context.focusClickX,
              });
            }}
            onClose={() => this.closeRouteDisambiguation()}
          />
        </Themed>
      ) : null,
    );
  }

  private focusMapForInfoPanel(
    selectedObject: SelectedObject | null | undefined,
  ): void {
    if (!selectedObject?.showInfo || !selectedObject.pan) {
      if (!selectedObject) {
        this.infoPanFeatureId = null;
      }
      return;
    }

    if (this.infoPanFeatureId === selectedObject.id) {
      return;
    }

    this.infoPanFeatureId = selectedObject.id;

    panMapToCenterFeatureInVisibleArea(
      this.map,
      selectedObject.pan.lngLat,
      selectedObject.pan.animate,
    );
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
    this.ensureHighlightSourceAndGlowLayer(
      SELECTED_SOURCE_ID,
      SELECTED_GLOW_LAYER_ID,
      ROUTE_HIGHLIGHT_YELLOW_GLOW,
    );
    this.ensureHighlightSourceAndGlowLayer(
      SELECTED_GROUP_SOURCE_ID,
      SELECTED_GROUP_GLOW_LAYER_ID,
      ROUTE_HIGHLIGHT_YELLOW_GLOW,
    );
    this.ensureHighlightSourceAndGlowLayer(
      SELECTED_STAGE_SOURCE_ID,
      SELECTED_STAGE_GLOW_LAYER_ID,
      ROUTE_HIGHLIGHT_ORANGE_GLOW,
    );

    this.repositionSelectedHighlightLayers();
  }

  /** Layer id to insert highlight layers before (= draw on top of route/trail MVT). */
  private getFeatureHighlightInsertBeforeLayerId(): string | undefined {
    const style = this.map.getStyle();
    if (!style?.layers) {
      return undefined;
    }

    let lastFeatureLayerIndex = -1;
    for (let i = 0; i < style.layers.length; i++) {
      if (
        (FEATURE_HIGHLIGHT_LAYER_STACK as readonly string[]).includes(
          style.layers[i].id,
        )
      ) {
        lastFeatureLayerIndex = i;
      }
    }

    if (lastFeatureLayerIndex === -1) {
      return undefined;
    }

    return style.layers[lastFeatureLayerIndex + 1]?.id;
  }

  private repositionSelectedHighlightLayers(): void {
    const insertBeforeId = this.getFeatureHighlightInsertBeforeLayerId();
    if (!insertBeforeId) {
      return;
    }

    for (const glowLayerId of ROUTE_HIGHLIGHT_GLOW_LAYER_IDS) {
      const stackBottomToTop = [
        highlightOutlineLayerId(glowLayerId),
        glowLayerId,
        highlightCasingLayerId(glowLayerId),
        highlightCoreLayerId(glowLayerId),
        highlightStsOuterLayerId(glowLayerId),
        highlightStsCenterLayerId(glowLayerId),
        highlightImbaLineLayerId(glowLayerId),
        highlightLabelStripeLayerId(glowLayerId),
        highlightLabelLayerId(glowLayerId),
      ];

      for (const layerId of stackBottomToTop) {
        if (this.map.getLayer(layerId)) {
          this.map.moveLayer(layerId, insertBeforeId);
        }
      }
    }
  }

  private ensureHighlightSourceAndGlowLayer(
    sourceId: string,
    glowLayerId: string,
    glow: RouteHighlightGlow,
  ): void {
    if (!this.map.getSource(sourceId)) {
      this.map.addSource(sourceId, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
    }

    this.ensureHighlightGlowLayer(glowLayerId, sourceId, glow);
    this.ensureHighlightFeatureOverlayLayers(glowLayerId, sourceId);
  }

  private ensureHighlightFeatureOverlayLayers(
    glowLayerId: string,
    sourceId: string,
  ): void {
    const lineLayout: maplibregl.LineLayerSpecification["layout"] = {
      "line-cap": "round",
      "line-join": "round",
    };

    this.ensureHighlightLineLayer(
      highlightCasingLayerId(glowLayerId),
      sourceId,
      {
        paint: {
          "line-color": "#ffffff",
          "line-width": ROUTE_HIGHLIGHT_CASING_LINE_WIDTH,
          "line-opacity": 0.95,
        },
        layout: lineLayout,
        filter: ROUTE_HIGHLIGHT_OVERLAY_FILTER,
      },
    );

    this.ensureHighlightLineLayer(
      highlightCoreLayerId(glowLayerId),
      sourceId,
      {
        paint: {
          "line-color": HIGHLIGHT_LINE_COLOR,
          "line-width": ROUTE_HIGHLIGHT_CORE_LINE_WIDTH,
        },
        layout: lineLayout,
        filter: ROUTE_HIGHLIGHT_OVERLAY_FILTER,
      },
    );

    this.ensureHighlightLineLayer(
      highlightStsOuterLayerId(glowLayerId),
      sourceId,
      {
        paint: {
          "line-color": HIGHLIGHT_LINE_COLOR,
          "line-width": TRAIL_HIGHLIGHT_STS_CASING_WIDTH,
          "line-opacity": 0.95,
        },
        layout: lineLayout,
        filter: STS_TRAIL_HIGHLIGHT_OVERLAY_FILTER,
      },
    );

    this.ensureHighlightLineLayer(
      highlightStsCenterLayerId(glowLayerId),
      sourceId,
      {
        paint: {
          "line-color": TRAIL_STS_CENTER_LINE_COLOR,
          "line-width": TRAIL_HIGHLIGHT_STS_CENTER_WIDTH,
        },
        layout: lineLayout,
        filter: STS_TRAIL_HIGHLIGHT_OVERLAY_FILTER,
      },
    );

    this.ensureHighlightLineLayer(
      highlightImbaLineLayerId(glowLayerId),
      sourceId,
      {
        paint: {
          "line-color": HIGHLIGHT_LINE_COLOR,
          "line-width": TRAIL_HIGHLIGHT_IMBA_LINE_WIDTH,
          "line-dasharray": TRAIL_HIGHLIGHT_IMBA_DASHARRAY,
        },
        layout: lineLayout,
        filter: IMBA_TRAIL_HIGHLIGHT_OVERLAY_FILTER,
      },
    );

    this.ensureHighlightSymbolLayer(
      highlightLabelStripeLayerId(glowLayerId),
      sourceId,
      {
        minzoom: 11,
        layout: {
          "symbol-placement": "line",
          "text-field": HIGHLIGHT_LABEL_TEXT,
          "text-font": ["Noto Sans Bold"],
          "text-size": 12,
        },
        paint: {
          "text-color": HIGHLIGHT_LINE_COLOR,
          "text-halo-color": HIGHLIGHT_LINE_COLOR,
          "text-halo-width": 5,
        },
        filter: HIGHLIGHT_LABEL_OVERLAY_FILTER,
      },
    );

    this.ensureHighlightSymbolLayer(
      highlightLabelLayerId(glowLayerId),
      sourceId,
      {
        minzoom: 11,
        layout: {
          "symbol-placement": "line",
          "text-field": HIGHLIGHT_LABEL_TEXT,
          "text-font": ["Noto Sans Regular"],
          "text-size": 12,
        },
        paint: {
          "text-color": "#212121",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1.75,
        },
        filter: HIGHLIGHT_LABEL_OVERLAY_FILTER,
      },
    );
  }

  private ensureHighlightLineLayer(
    layerId: string,
    sourceId: string,
    options: {
      paint: maplibregl.LineLayerSpecification["paint"];
      layout?: maplibregl.LineLayerSpecification["layout"];
      filter?: maplibregl.ExpressionFilterSpecification;
    },
  ): void {
    if (this.map.getLayer(layerId)) {
      this.map.setFilter(layerId, options.filter ?? null);
      return;
    }

    const insertBeforeId = this.getFeatureHighlightInsertBeforeLayerId();
    this.map.addLayer(
      {
        id: layerId,
        type: "line",
        source: sourceId,
        paint: options.paint,
        layout: options.layout,
        filter: options.filter,
      },
      insertBeforeId,
    );
  }

  private ensureHighlightSymbolLayer(
    layerId: string,
    sourceId: string,
    options: {
      minzoom?: number;
      layout: maplibregl.SymbolLayerSpecification["layout"];
      paint: maplibregl.SymbolLayerSpecification["paint"];
      filter?: maplibregl.ExpressionFilterSpecification;
    },
  ): void {
    if (this.map.getLayer(layerId)) {
      this.map.setFilter(layerId, options.filter ?? null);
      return;
    }

    const insertBeforeId = this.getFeatureHighlightInsertBeforeLayerId();
    this.map.addLayer(
      {
        id: layerId,
        type: "symbol",
        source: sourceId,
        minzoom: options.minzoom,
        layout: options.layout,
        paint: options.paint,
        filter: options.filter,
      },
      insertBeforeId,
    );
  }

  private ensureHighlightGlowLayer(
    layerId: string,
    sourceId: string,
    glow: RouteHighlightGlow,
  ): void {
    if (glow.outline) {
      this.ensureHighlightOutlineLayer(layerId, sourceId, glow.outline);
    } else {
      this.removeHighlightOutlineLayer(layerId);
    }

    if (this.map.getLayer(layerId)) {
      this.map.setPaintProperty(layerId, "line-color", glow.color);
      this.map.setPaintProperty(layerId, "line-width", glow.width);
      this.map.setPaintProperty(layerId, "line-opacity", glow.opacity);
      this.map.setPaintProperty(layerId, "line-blur", glow.blur);
      return;
    }

    const insertBeforeId = this.getFeatureHighlightInsertBeforeLayerId();
    this.map.addLayer(
      {
        id: layerId,
        type: "line",
        source: sourceId,
        paint: {
          "line-color": glow.color,
          "line-width": glow.width,
          "line-opacity": glow.opacity,
          "line-blur": glow.blur,
        },
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
      },
      insertBeforeId,
    );
  }

  private ensureHighlightOutlineLayer(
    glowLayerId: string,
    sourceId: string,
    outline: RouteHighlightOutline,
  ): void {
    const layerId = highlightOutlineLayerId(glowLayerId);

    if (this.map.getLayer(layerId)) {
      this.map.setPaintProperty(layerId, "line-color", outline.color);
      this.map.setPaintProperty(layerId, "line-width", outline.width);
      this.map.setPaintProperty(layerId, "line-opacity", outline.opacity);
      return;
    }

    const insertBeforeId = this.getFeatureHighlightInsertBeforeLayerId();
    this.map.addLayer(
      {
        id: layerId,
        type: "line",
        source: sourceId,
        paint: {
          "line-color": outline.color,
          "line-width": outline.width,
          "line-opacity": outline.opacity,
          "line-blur": 0,
        },
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
      },
      insertBeforeId,
    );
  }

  private removeHighlightOutlineLayer(glowLayerId: string): void {
    const layerId = highlightOutlineLayerId(glowLayerId);
    if (this.map.getLayer(layerId)) {
      this.map.removeLayer(layerId);
    }
  }

  private setHighlightSourceData(
    sourceId: string,
    features: MapFeature[],
  ): void {
    const source = this.map.getSource(sourceId) as maplibregl.GeoJSONSource;
    source.setData({
      type: "FeatureCollection",
      features: normalizeHighlightFeatures(features),
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
