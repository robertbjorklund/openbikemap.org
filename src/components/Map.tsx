import * as maplibregl from "maplibre-gl";
import * as ReactDOM from "react-dom/client";
import { throttle } from "throttle-debounce";
import MapFilters, { defaultMapFilters } from "../MapFilters";
import { MapMarker } from "../MapMarker";
import { MAP_STYLE_URLS, MapStyle } from "../MapStyle";
import { FeatureType, type MapFeature } from "../types/FeatureTypes";
import type { LineString, MultiLineString, Position } from "geojson";
import { findRelatedFeatures } from "../utils/FeatureGroup";
import {
  normalizeHighlightFeatures,
  HIGHLIGHT_GLOW_OVERLAY_FILTER,
  HIGHLIGHT_LABEL_OVERLAY_FILTER,
  HIGHLIGHT_LINE_OVERLAY_FILTER,
} from "../utils/routeHighlightProperties";
import { findRouteStageFeature } from "../utils/routeGroupSelection";
import {
  featureFitGeometryKey,
  fitMapToFeature,
  panMapToCenterFeatureInVisibleArea,
} from "../utils/mapInfoPanelFocus";
import {
  CameraPosition,
  CameraPositionManager,
} from "../utils/CameraPositionManager";
import EventBus from "./EventBus";
import {
  applyFilterRulesToMap,
  applyFiltersToStyleLayers,
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
import {
  isCameraPositionConsentPending,
  setCameraPositionConsent,
} from "../utils/cameraPositionConsent";
import { addUnitSystemChangeListener_NonReactive } from "./UnitSystemManager";

const SELECTED_SOURCE_ID = "openbikemap-selected";
const SELECTED_HALO_SOURCE_ID = "openbikemap-selected-halo";
const SELECTED_GLOW_LAYER_ID = "openbikemap-selected-line-glow";

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

interface RouteHighlightOutline {
  color: string;
  width: maplibregl.ExpressionSpecification;
  opacity: maplibregl.ExpressionSpecification;
}

interface RouteHighlightGlow {
  color: string;
  opacity: maplibregl.ExpressionSpecification | number;
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
  "",
];

const HIGHLIGHT_LABEL_FILTER: maplibregl.ExpressionFilterSpecification = [
  "all",
  HIGHLIGHT_LABEL_OVERLAY_FILTER,
  [
    "!=",
    ["coalesce", ["get", "name"], ["get", "ref"], ""],
    "",
  ],
];

const ROUTE_HIGHLIGHT_CORE_LINE_WIDTH: maplibregl.ExpressionSpecification = [
  "interpolate",
  ["linear"],
  ["zoom"],
  5,
  2.5,
  7,
  3,
  11,
  3.5,
  14,
  5,
  16,
  5.5,
];

/** Routes: yellow overview; trails: always use normalized difficulty color. */
const HIGHLIGHT_LINE_COLOR_EXPRESSION: maplibregl.ExpressionSpecification = [
  "step",
  ["zoom"],
  [
    "case",
    ["==", ["get", "type"], FeatureType.Route],
    "#ffeb3b",
    ["coalesce", ["get", "color"], "#7b1fa2"],
  ],
  11,
  ["coalesce", ["get", "color"], "#7b1fa2"],
];

/** Soft yellow halo at every zoom — wide when zoomed out, subtle when zoomed in. */
const ROUTE_HIGHLIGHT_YELLOW_GLOW_WIDTH: maplibregl.ExpressionSpecification = [
  "interpolate",
  ["linear"],
  ["zoom"],
  5,
  5,
  7,
  7,
  9,
  8,
  11,
  9,
  14,
  11,
  16,
  12,
  18,
  12,
];

const ROUTE_HIGHLIGHT_YELLOW_GLOW_OPACITY: maplibregl.ExpressionSpecification = [
  "interpolate",
  ["linear"],
  ["zoom"],
  5,
  0.8,
  7,
  0.86,
  9,
  0.75,
  11,
  0.68,
  14,
  0.62,
  16,
  0.58,
];

const ROUTE_HIGHLIGHT_YELLOW_GLOW_BLUR = 0;

const ROUTE_HIGHLIGHT_YELLOW_GLOW: RouteHighlightGlow = {
  color: "#ffeb3b",
  opacity: ROUTE_HIGHLIGHT_YELLOW_GLOW_OPACITY,
  width: ROUTE_HIGHLIGHT_YELLOW_GLOW_WIDTH,
  blur: ROUTE_HIGHLIGHT_YELLOW_GLOW_BLUR,
};

function geometryScreenBox(
  map: maplibregl.Map,
  geometry: LineString | MultiLineString,
  paddingPx: number,
): [maplibregl.PointLike, maplibregl.PointLike] | null {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  const visit = (position: Position) => {
    const lng = position[0];
    const lat = position[1];
    if (lng < minLng) minLng = lng;
    if (lat < minLat) minLat = lat;
    if (lng > maxLng) maxLng = lng;
    if (lat > maxLat) maxLat = lat;
  };

  if (geometry.type === "LineString") {
    for (const position of geometry.coordinates) {
      visit(position);
    }
  } else {
    for (const line of geometry.coordinates) {
      for (const position of line) {
        visit(position);
      }
    }
  }

  if (!Number.isFinite(minLng)) {
    return null;
  }

  const southWest = map.project([minLng, minLat]);
  const northEast = map.project([maxLng, maxLat]);
  return [
    [
      Math.min(southWest.x, northEast.x) - paddingPx,
      Math.min(southWest.y, northEast.y) - paddingPx,
    ],
    [
      Math.max(southWest.x, northEast.x) + paddingPx,
      Math.max(southWest.y, northEast.y) + paddingPx,
    ],
  ];
}

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
  private highlightExcludedMvtIds: string[] = [];
  private highlightLayersReady = false;
  private infoPanFeatureId: string | null = null;
  private infoFitKey: string | null = null;
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

    this.routeDisambiguationHost = document.createElement("div");
    this.map.getContainer().appendChild(this.routeDisambiguationHost);

    this.trailDisambiguationHost = document.createElement("div");
    this.map.getContainer().appendChild(this.trailDisambiguationHost);

    this.cameraConsentHost = document.createElement("div");
    this.map.getContainer().appendChild(this.cameraConsentHost);

    new MapInteractionManager(this.map, eventBus, {
      getLockedRouteGroupId: () => this.getLockedRouteGroupId(),
      getMapFilters: () => this.currentFilters,
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
      this.highlightLayersReady = false;
      applyOpenBikeMapLineMinZoomToMap(this.map);
      applyPaintRulesToMap(this.map);
      applyFilterRulesToMap(
        this.map,
        this.currentFilters,
        this.highlightExcludedMvtIds,
      );
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
    applyFilterRulesToMap(
      this.map,
      this.currentFilters,
      this.highlightExcludedMvtIds,
    );
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
    if (!selectedObject) {
      this.infoPanFeatureId = null;
      this.infoFitKey = null;
      return;
    }

    if (selectedObject.fitToMap && selectedObject.feature) {
      const fitKey = `${selectedObject.id}:${featureFitGeometryKey(selectedObject.feature)}`;
      if (this.infoFitKey !== fitKey) {
        this.infoFitKey = fitKey;
        fitMapToFeature(this.map, selectedObject.feature);
      }
    } else {
      this.infoFitKey = null;
    }

    if (!selectedObject.showInfo || !selectedObject.pan) {
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
    this.ensureHighlightSources();

    const anchor = this.getFeatureHighlightAnchor();
    if (!anchor.ready) {
      return;
    }

    this.removeLegacyHighlightLayers();

    if (!this.highlightLayersReady) {
      this.ensureHighlightGlowLayer(
        SELECTED_GLOW_LAYER_ID,
        SELECTED_HALO_SOURCE_ID,
        ROUTE_HIGHLIGHT_YELLOW_GLOW,
        anchor.insertBeforeId,
      );
      this.ensureSelectedLineLayer(anchor.insertBeforeId);
      this.highlightLayersReady = Boolean(
        this.map.getLayer(highlightCoreLayerId(SELECTED_GLOW_LAYER_ID)),
      );
      return;
    }

    this.ensureHighlightGlowLayer(
      SELECTED_GLOW_LAYER_ID,
      SELECTED_HALO_SOURCE_ID,
      ROUTE_HIGHLIGHT_YELLOW_GLOW,
      anchor.insertBeforeId,
    );
    this.ensureSelectedLineLayer(anchor.insertBeforeId);
  }

  private ensureHighlightSources(): void {
    if (!this.map.getSource(SELECTED_HALO_SOURCE_ID)) {
      this.map.addSource(SELECTED_HALO_SOURCE_ID, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
    }
    if (!this.map.getSource(SELECTED_SOURCE_ID)) {
      this.map.addSource(SELECTED_SOURCE_ID, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
    }
  }

  private removeLegacyHighlightLayers(): void {
    const glowLayerId = SELECTED_GLOW_LAYER_ID;
    const legacyLayerIds = [
      highlightOutlineLayerId(glowLayerId),
      highlightCasingLayerId(glowLayerId),
      highlightStsOuterLayerId(glowLayerId),
      highlightStsCenterLayerId(glowLayerId),
      highlightImbaLineLayerId(glowLayerId),
      "openbikemap-selected-group-line-glow",
      "openbikemap-selected-group-line-glow-outline",
      "openbikemap-selected-group-line-casing",
      "openbikemap-selected-group-line",
      "openbikemap-selected-group-sts-outer",
      "openbikemap-selected-group-sts-center",
      "openbikemap-selected-group-imba-line",
      "openbikemap-selected-group-label-stripe",
      "openbikemap-selected-group-label",
    ];

    for (const layerId of legacyLayerIds) {
      if (this.map.getLayer(layerId)) {
        this.map.removeLayer(layerId);
      }
    }

    if (this.map.getSource("openbikemap-selected-group")) {
      this.map.removeSource("openbikemap-selected-group");
    }
  }

  /** Where to insert highlight layers (undefined = on top of the style). */
  private getFeatureHighlightAnchor(): {
    ready: boolean;
    insertBeforeId?: string;
  } {
    const style = this.map.getStyle();
    if (!style?.layers) {
      return { ready: false };
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
      return { ready: false };
    }

    return {
      ready: true,
      insertBeforeId: style.layers[lastFeatureLayerIndex + 1]?.id,
    };
  }

  private ensureSelectedLineLayer(insertBeforeId?: string): void {
    const glowLayerId = SELECTED_GLOW_LAYER_ID;
    const lineLayerId = highlightCoreLayerId(glowLayerId);
    const lineLayout: maplibregl.LineLayerSpecification["layout"] = {
      "line-cap": "round",
      "line-join": "round",
    };

    this.ensureHighlightLineLayer(lineLayerId, SELECTED_SOURCE_ID, {
      paint: {
        "line-color": HIGHLIGHT_LINE_COLOR_EXPRESSION,
        "line-width": ROUTE_HIGHLIGHT_CORE_LINE_WIDTH,
        "line-opacity": 1,
      },
      layout: lineLayout,
      filter: HIGHLIGHT_LINE_OVERLAY_FILTER,
    }, insertBeforeId);

    this.ensureHighlightSymbolLayer(
      highlightLabelStripeLayerId(glowLayerId),
      SELECTED_SOURCE_ID,
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
        filter: HIGHLIGHT_LABEL_FILTER,
      },
      insertBeforeId,
    );

    this.ensureHighlightSymbolLayer(
      highlightLabelLayerId(glowLayerId),
      SELECTED_SOURCE_ID,
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
        filter: HIGHLIGHT_LABEL_FILTER,
      },
      insertBeforeId,
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
    insertBeforeId?: string,
  ): void {
    if (this.map.getLayer(layerId)) {
      this.map.setFilter(layerId, options.filter ?? null);
      for (const [property, value] of Object.entries(options.paint ?? {})) {
        this.map.setPaintProperty(layerId, property, value);
      }
      return;
    }

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
    insertBeforeId?: string,
  ): void {
    if (this.map.getLayer(layerId)) {
      this.map.setFilter(layerId, options.filter ?? null);
      return;
    }

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
    insertBeforeId?: string,
  ): void {
    this.removeHighlightOutlineLayer(layerId);

    if (this.map.getLayer(layerId)) {
      this.map.setFilter(layerId, HIGHLIGHT_GLOW_OVERLAY_FILTER);
      this.map.setPaintProperty(layerId, "line-color", glow.color);
      this.map.setPaintProperty(layerId, "line-width", glow.width);
      this.map.setPaintProperty(layerId, "line-opacity", glow.opacity);
      return;
    }

    this.map.addLayer(
      {
        id: layerId,
        type: "line",
        source: sourceId,
        filter: HIGHLIGHT_GLOW_OVERLAY_FILTER,
        paint: {
          "line-color": glow.color,
          "line-width": glow.width,
          "line-opacity": glow.opacity,
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

  private collectMvtIdsForFeature(
    feature: MapFeature,
    ids: Set<string>,
  ): void {
    for (const related of findRelatedFeatures(this.map, feature)) {
      ids.add(related.properties.id);
    }

    const sourceLayer =
      feature.properties.type === FeatureType.Route ? "routes" : "trails";
    const layerIds =
      feature.properties.type === FeatureType.Route
        ? ROUTE_LAYER_STACK
        : TRAIL_LAYER_STACK;
    const layers = layerIds.filter((layerId) => this.map.getLayer(layerId));
    if (layers.length === 0) {
      return;
    }

    const screenBox = geometryScreenBox(this.map, feature.geometry, 32);
    if (!screenBox) {
      return;
    }

    const groupId = feature.properties.groupId;
    const name = feature.properties.name;
    const ref =
      feature.properties.type === FeatureType.Route
        ? feature.properties.ref
        : null;

    for (const raw of this.map.queryRenderedFeatures(screenBox, { layers })) {
      if (raw.source !== "openbikemap" || raw.sourceLayer !== sourceLayer) {
        continue;
      }

      const id = raw.properties?.id;
      if (id == null || id === "") {
        continue;
      }
      const idStr = String(id);
      if (ids.has(idStr)) {
        continue;
      }

      if (groupId && String(raw.properties?.groupId ?? "") === groupId) {
        ids.add(idStr);
        continue;
      }
      if (name && String(raw.properties?.name ?? "") === name) {
        ids.add(idStr);
        continue;
      }
      if (ref && String(raw.properties?.ref ?? "") === ref) {
        ids.add(idStr);
      }
    }
  }

  private resolveHighlightExcludedMvtIds(
    highlightedFeatures: MapFeature[],
  ): string[] {
    const ids = new Set<string>();
    const routeGroup = this.routeGroupSelection;
    const stageFeatures = routeGroup?.stageFeatures;

    if (routeGroup && stageFeatures && stageFeatures.length > 0) {
      if (routeGroup.activeStageId) {
        const stage = findRouteStageFeature(
          routeGroup,
          routeGroup.activeStageId,
        );
        if (stage) {
          this.collectMvtIdsForFeature(stage, ids);
        }
      } else {
        for (const stage of stageFeatures) {
          this.collectMvtIdsForFeature(stage, ids);
        }
      }
      return [...ids];
    }

    for (const feature of highlightedFeatures) {
      this.collectMvtIdsForFeature(feature, ids);
    }
    return [...ids];
  }

  private applyHighlightMvtMask(excludedIds: string[]): void {
    this.highlightExcludedMvtIds = excludedIds;
    applyFilterRulesToMap(this.map, this.currentFilters, excludedIds);
  }

  private setHighlightSourceData(features: MapFeature[]): void {
    const lineSource = this.map.getSource(
      SELECTED_SOURCE_ID,
    ) as maplibregl.GeoJSONSource | undefined;
    const haloSource = this.map.getSource(
      SELECTED_HALO_SOURCE_ID,
    ) as maplibregl.GeoJSONSource | undefined;
    if (!lineSource || !haloSource) {
      return;
    }

    const data = {
      type: "FeatureCollection" as const,
      features: normalizeHighlightFeatures(features),
    };
    lineSource.setData(data);
    haloSource.setData(data);
  }

  private updateSelectedHighlight(): void {
    if (!this.map.isStyleLoaded()) {
      this.map.once("style.load", () => this.updateSelectedHighlight());
      return;
    }

    this.ensureSelectedHighlightLayer();

    const routeGroup = this.routeGroupSelection;
    const stageFeatures = routeGroup?.stageFeatures;
    let highlightFeatures: MapFeature[] = [];

    if (routeGroup && stageFeatures && stageFeatures.length > 0) {
      if (routeGroup.activeStageId) {
        const stage = findRouteStageFeature(
          routeGroup,
          routeGroup.activeStageId,
        );
        highlightFeatures = stage ? [stage] : [];
      } else {
        highlightFeatures = [routeGroup.wholeRouteFeature];
      }
    } else if (this.selectedFeature) {
      highlightFeatures = [this.selectedFeature];
    }

    this.setHighlightSourceData(highlightFeatures);
    const excludedIds = this.resolveHighlightExcludedMvtIds(highlightFeatures);
    this.applyHighlightMvtMask(excludedIds);
    if (highlightFeatures.length > 0) {
      this.map.once("idle", () => {
        this.applyHighlightMvtMask(
          this.resolveHighlightExcludedMvtIds(highlightFeatures),
        );
      });
    }
  }
}
