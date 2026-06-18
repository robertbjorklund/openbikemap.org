import { AppConfig } from "../AppConfig";
import { MapMarker } from "../MapMarker";
import { MapStyle } from "../MapStyle";
import { trackMatomoEvent } from "../utils/matomo";
import {
  BikeActivity,
  IMBA_SCALE_FILTERS,
  MTB_SCALE_FILTERS,
  type MtbImbaScaleFilter,
  type MtbScaleFilter,
} from "../types/BikeActivity";
import {
  ROUTE_NETWORK_FILTERS,
  type RouteNetworkFilter,
} from "../types/RouteNetwork";
import { type MapFeature } from "../types/FeatureTypes";
import { mergeSegmentGroup } from "../utils/FeatureGroup";
import { resolveFeatureGroup } from "../utils/resolveFeatureGroup";
import {
  buildRouteGroupSelection,
  findRouteStageFeature,
} from "../utils/routeGroupSelection";
import EventBus, { type ShowInfoOptions } from "./EventBus";
import { isFeatureVisibleUnderFilters } from "./MapFilterRules";
import { loadGeoJSON } from "./GeoJSONLoader";
import type { ObjectIDType } from "./SelectedObject";
import type { AppPanelTab } from "./AppPanelTab";
import type { SidePanelView } from "./SidePanelView";
import { isSidePanelRailCollapsible } from "./sidePanelRailLayout";
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
    this.openMtbFilter();
  };

  openMtbFilter = () => {
    this.toggleSidePanel("mtbFilter");
  };

  openImbaFilter = () => {
    this.toggleSidePanel("imbaFilter");
  };

  openRoutesFilter = () => {
    this.toggleSidePanel("routesFilter");
  };

  openRoute = () => {
    if (this._state.sidePanelView === "route") {
      if (this._state.selectedObject && !this._state.selectedObject.showInfo) {
        this.update({
          selectedObject: {
            ...this._state.selectedObject,
            showInfo: true,
          },
        });
        return;
      }
      this.collapseInfoPanel();
      return;
    }

    if (this._state.selectedObject?.feature) {
      this.update({
        sidePanelView: "route",
        selectedObject: {
          ...this._state.selectedObject,
          showInfo: true,
        },
      });
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
    this.openAppPanel("settings");
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

  openAboutInfo = () => {
    this.openAppPanel("about");
  };

  setAppPanelTab = (tab: AppPanelTab) => {
    if (this._state.sidePanelView !== "app") {
      return;
    }
    if (this._state.appPanelTab === tab) {
      return;
    }
    this.update({ appPanelTab: tab });
  };

  closeAboutInfo = () => {
    this.closeMenu();
  };

  setUnitSystem = (unitSystem: UnitSystem) => {
    setUnitSystem(unitSystem);
  };

  setMapStyle = (style: MapStyle) => {
    trackMatomoEvent("Map", "Basemap", style);
    this.update({ mapStyle: style });
  };

  toggleActivity = (activity: BikeActivity) => {
    const hidden = this._state.mapFilters.hiddenActivities;
    const enabling = hidden.includes(activity);
    const hiddenActivities = enabling
      ? hidden.filter((a) => a !== activity)
      : [...hidden, activity];

    const mapFilters = { ...this._state.mapFilters, hiddenActivities };

    if (activity === BikeActivity.Mtb) {
      mapFilters.hiddenMtbScales = enabling
        ? []
        : [...MTB_SCALE_FILTERS];
      mapFilters.hiddenMtbImbaScales = enabling
        ? []
        : [...IMBA_SCALE_FILTERS];
      mapFilters.showMtbSts = enabling;
      mapFilters.showMtbImba = enabling;
    }

    if (activity === BikeActivity.Routes) {
      mapFilters.hiddenRouteNetworks = enabling
        ? []
        : [...ROUTE_NETWORK_FILTERS];
      mapFilters.showBicycleRoutes = enabling;
      mapFilters.showMtbRoutes = enabling;
    }

    this.update({ mapFilters });
    trackMatomoEvent(
      "Filter",
      activity,
      enabling ? "show" : "hide",
    );
  };

  toggleMtbStsGroup = () => {
    this.update({
      mapFilters: {
        ...this._state.mapFilters,
        showMtbSts: !this._state.mapFilters.showMtbSts,
      },
    });
  };

  toggleMtbImbaGroup = () => {
    this.update({
      mapFilters: {
        ...this._state.mapFilters,
        showMtbImba: !this._state.mapFilters.showMtbImba,
      },
    });
  };

  toggleMtbScale = (scale: MtbScaleFilter) => {
    const hidden = this._state.mapFilters.hiddenMtbScales;
    const hiddenMtbScales = hidden.includes(scale)
      ? hidden.filter((s) => s !== scale)
      : [...hidden, scale];

    this.update({
      mapFilters: {
        ...this._state.mapFilters,
        hiddenMtbScales,
      },
    });
  };

  toggleMtbImbaScale = (scale: MtbImbaScaleFilter) => {
    const hidden = this._state.mapFilters.hiddenMtbImbaScales;
    const hiddenMtbImbaScales = hidden.includes(scale)
      ? hidden.filter((s) => s !== scale)
      : [...hidden, scale];

    this.update({
      mapFilters: {
        ...this._state.mapFilters,
        hiddenMtbImbaScales,
      },
    });
  };

  showAllMtbScales = () => {
    this.update({
      mapFilters: {
        ...this._state.mapFilters,
        hiddenMtbScales: [],
      },
    });
  };

  hideAllMtbScales = () => {
    this.update({
      mapFilters: {
        ...this._state.mapFilters,
        hiddenMtbScales: [...MTB_SCALE_FILTERS],
      },
    });
  };

  showAllMtbImbaScales = () => {
    this.update({
      mapFilters: {
        ...this._state.mapFilters,
        hiddenMtbImbaScales: [],
      },
    });
  };

  hideAllMtbImbaScales = () => {
    this.update({
      mapFilters: {
        ...this._state.mapFilters,
        hiddenMtbImbaScales: [...IMBA_SCALE_FILTERS],
      },
    });
  };

  toggleBicycleRoutesGroup = () => {
    this.update({
      mapFilters: {
        ...this._state.mapFilters,
        showBicycleRoutes: !this._state.mapFilters.showBicycleRoutes,
      },
    });
  };

  toggleMtbRoutesGroup = () => {
    this.update({
      mapFilters: {
        ...this._state.mapFilters,
        showMtbRoutes: !this._state.mapFilters.showMtbRoutes,
      },
    });
  };

  toggleRoutesGroup = () => {
    const next = !(
      this._state.mapFilters.showBicycleRoutes &&
      this._state.mapFilters.showMtbRoutes
    );
    this.update({
      mapFilters: {
        ...this._state.mapFilters,
        showBicycleRoutes: next,
        showMtbRoutes: next,
      },
    });
  };

  toggleRouteNetwork = (network: RouteNetworkFilter) => {
    const hidden = this._state.mapFilters.hiddenRouteNetworks;
    const hiddenRouteNetworks = hidden.includes(network)
      ? hidden.filter((value) => value !== network)
      : [...hidden, network];

    this.update({
      mapFilters: {
        ...this._state.mapFilters,
        hiddenRouteNetworks,
      },
    });
  };

  showAllRouteNetworks = () => {
    this.update({
      mapFilters: {
        ...this._state.mapFilters,
        hiddenRouteNetworks: [],
      },
    });
  };

  hideAllRouteNetworks = () => {
    this.update({
      mapFilters: {
        ...this._state.mapFilters,
        hiddenRouteNetworks: [...ROUTE_NETWORK_FILTERS],
      },
    });
  };

  private loadFullRelatedFeatures = async (
    primaryId: string,
    idType: ObjectIDType,
    relatedFeatures: MapFeature[],
    primaryFeature: MapFeature,
  ): Promise<MapFeature[]> => {
    const uniqueIds = [...new Set(relatedFeatures.map((f) => f.properties.id))];

    return Promise.all(
      uniqueIds.map(async (segmentId) => {
        if (segmentId === primaryId) {
          return primaryFeature;
        }
        try {
          return await loadGeoJSON<MapFeature>(segmentId, idType);
        } catch {
          const fallback = relatedFeatures.find(
            (feature) => feature.properties.id === segmentId,
          );
          if (!fallback) {
            throw new Error(`Missing segment ${segmentId}`);
          }
          return fallback;
        }
      }),
    );
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

      const expandedRelated = await resolveFeatureGroup(
        apiFeature,
        relatedFeatures,
      );
      const fullRelated = await this.loadFullRelatedFeatures(
        id,
        idType,
        expandedRelated,
        apiFeature,
      );

      this.update({
        selectedObject: {
          ...this._state.selectedObject,
          feature: buildDisplayFeature(apiFeature, fullRelated),
          routeGroup: buildRouteGroupSelection(apiFeature, fullRelated),
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
            routeGroup: buildRouteGroupSelection(
              fallbackFeature,
              relatedFeatures,
            ),
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
        pan:
          options?.focusLngLat !== undefined &&
          options.focusClickX !== undefined
            ? {
                animate: true,
                lngLat: options.focusLngLat,
                clickX: options.focusClickX,
              }
            : undefined,
      },
    });

    const featureKind =
      clickedFeature?.properties.type ??
      (idType === "openstreetmap" ? "unknown" : "feature");
    trackMatomoEvent("Feature", "View", featureKind);

    this.loadInfoData(id, idType, relatedFeatures, clickedFeature);
  };

  selectRouteStage = (stageId: string) => {
    const routeGroup = this._state.selectedObject?.routeGroup;
    if (!routeGroup) {
      return;
    }
    const stage = findRouteStageFeature(routeGroup, stageId);
    if (!stage) {
      return;
    }
    this.update({
      selectedObject: {
        ...this._state.selectedObject!,
        id: stage.properties.id,
        feature: stage,
        routeGroup: {
          ...routeGroup,
          activeStageId: stageId,
        },
      },
    });
  };

  showRouteGroupOverview = () => {
    const routeGroup = this._state.selectedObject?.routeGroup;
    if (!routeGroup || !routeGroup.activeStageId) {
      return;
    }
    this.update({
      selectedObject: {
        ...this._state.selectedObject!,
        id: routeGroup.wholeRouteFeature.properties.id,
        feature: routeGroup.wholeRouteFeature,
        routeGroup: {
          ...routeGroup,
          activeStageId: null,
        },
      },
    });
  };

  collapseInfoPanel = () => {
    if (this._state.sidePanelView === "route") {
      if (this._state.selectedObject) {
        this.update({
          sidePanelView: isSidePanelRailCollapsible() ? "route" : null,
          selectedObject: {
            ...this._state.selectedObject,
            showInfo: false,
          },
        });
      } else {
        this.setSidePanel(null);
      }
      return;
    }

    if (this._state.selectedObject) {
      this.update({
        selectedObject: {
          ...this._state.selectedObject,
          showInfo: false,
        },
      });
    }
  };

  hideInfo = () => {
    this.update({
      sidePanelView:
        this._state.sidePanelView === "route" ? null : this._state.sidePanelView,
      selectedObject: null,
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
    let appPanelTab: AppPanelTab = this._state.appPanelTab;
    if (urlState.aboutInfoOpen) {
      sidePanelView = "app";
      appPanelTab = "about";
    } else if (showInfo && urlState.selectedObjectID) {
      sidePanelView = "route";
    }

    this.update({
      sidePanelView,
      appPanelTab,
      selectedObject: urlState.selectedObjectID
        ? {
            id: urlState.selectedObjectID,
            idType: urlState.selectedObjectIDType,
            showInfo,
          }
        : null,
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

  private openAppPanel(tab: AppPanelTab) {
    if (
      this._state.sidePanelView === "app" &&
      this._state.appPanelTab === tab
    ) {
      this.closeMenu();
      return;
    }

    const changes: StateChanges = {
      sidePanelView: "app",
      appPanelTab: tab,
    };

    if (
      isSidePanelRailCollapsible() &&
      this._state.selectedObject?.showInfo
    ) {
      changes.selectedObject = {
        ...this._state.selectedObject,
        showInfo: false,
      };
    }

    this.update(changes);
  }

  private setSidePanel(view: SidePanelView) {
    this.update({ sidePanelView: view });
  }

  private toggleSidePanel(view: Exclude<SidePanelView, null>) {
    if (this._state.sidePanelView === view) {
      this.closeMenu();
      return;
    }

    const changes: StateChanges = { sidePanelView: view };

    if (
      isSidePanelRailCollapsible() &&
      this._state.selectedObject?.showInfo
    ) {
      changes.selectedObject = {
        ...this._state.selectedObject,
        showInfo: false,
      };
    }

    this.update(changes);
  }

  private update(changes: StateChanges): void {
    if (changes.mapFilters !== undefined) {
      const feature = this._state.selectedObject?.feature;
      if (
        feature &&
        !isFeatureVisibleUnderFilters(feature, changes.mapFilters)
      ) {
        changes.selectedObject = null;
        if (this._state.sidePanelView === "route") {
          changes.sidePanelView = null;
        }
      }
    }

    const state = this._state as unknown as Record<string, unknown>;
    Object.keys(changes).forEach((key) => {
      const change = (changes as Record<string, unknown>)[key];
      if (state[key] !== change) {
        state[key] = change;
      } else if (key !== "mapFilters") {
        delete (changes as Record<string, unknown>)[key];
      }
    });

    this.updateHandler(this._state, changes);
  }
}
