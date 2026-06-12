import { AppConfig } from "../AppConfig";
import { MapMarker } from "../MapMarker";
import { MapStyle } from "../MapStyle";
import {
  BikeActivity,
  MTB_SCALE_FILTERS,
  type MtbScaleFilter,
} from "../types/BikeActivity";
import {
  ROUTE_NETWORK_FILTERS,
  type RouteNetworkFilter,
} from "../types/RouteNetwork";
import { FeatureType, type MapFeature } from "../types/FeatureTypes";
import {
  getRouteGroupKey,
  matchesRouteGroupKey,
  mergeSegmentGroup,
} from "../utils/FeatureGroup";
import EventBus, { type ShowInfoOptions } from "./EventBus";
import { isFeatureVisibleUnderFilters } from "./MapFilterRules";
import { loadGeoJSON, searchFeatures } from "./GeoJSONLoader";
import type { ObjectIDType } from "./SelectedObject";
import type { SidePanelView } from "./SidePanelView";
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
    this.openFilter();
  };

  openMapLayers = () => {
    this.toggleSidePanel("mapLayers");
  };

  openFilter = () => {
    this.toggleSidePanel("filter");
  };

  openRoute = () => {
    if (this._state.sidePanelView === "route") {
      this.setSidePanel(null);
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
    this.toggleSidePanel("settings");
  };

  openCredits = () => {
    this.toggleSidePanel("credits");
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

  backToLayers = () => {
    const changes: StateChanges = { sidePanelView: "filter" };
    if (this._state.sidePanelView === "route") {
      changes.selectedObject = null;
    }
    this.update(changes);
  };

  openAboutInfo = () => {
    this.toggleSidePanel("about");
  };

  closeAboutInfo = () => {
    this.closeMenu();
  };

  setUnitSystem = (unitSystem: UnitSystem) => {
    setUnitSystem(unitSystem);
  };

  setMapStyle = (style: MapStyle) => {
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
    }

    if (activity === BikeActivity.Routes) {
      mapFilters.hiddenRouteNetworks = enabling
        ? []
        : [...ROUTE_NETWORK_FILTERS];
    }

    this.update({ mapFilters });
  };

  toggleMtbScale = (scale: MtbScaleFilter) => {
    const hidden = this._state.mapFilters.hiddenMtbScales;
    const hiddenMtbScales = hidden.includes(scale)
      ? hidden.filter((s) => s !== scale)
      : [...hidden, scale];

    const allScalesHidden = MTB_SCALE_FILTERS.every((value) =>
      hiddenMtbScales.includes(value),
    );
    const hiddenActivities = allScalesHidden
      ? [...new Set([...this._state.mapFilters.hiddenActivities, BikeActivity.Mtb])]
      : this._state.mapFilters.hiddenActivities.filter(
          (activity) => activity !== BikeActivity.Mtb,
        );

    this.update({
      mapFilters: {
        ...this._state.mapFilters,
        hiddenMtbScales,
        hiddenActivities,
      },
    });
  };

  toggleRouteNetwork = (network: RouteNetworkFilter) => {
    const hidden = this._state.mapFilters.hiddenRouteNetworks;
    const hiddenRouteNetworks = hidden.includes(network)
      ? hidden.filter((value) => value !== network)
      : [...hidden, network];

    const allNetworksHidden = ROUTE_NETWORK_FILTERS.every((value) =>
      hiddenRouteNetworks.includes(value),
    );
    const hiddenActivities = allNetworksHidden
      ? [
          ...new Set([
            ...this._state.mapFilters.hiddenActivities,
            BikeActivity.Routes,
          ]),
        ]
      : this._state.mapFilters.hiddenActivities.filter(
          (activity) => activity !== BikeActivity.Routes,
        );

    this.update({
      mapFilters: {
        ...this._state.mapFilters,
        hiddenRouteNetworks,
        hiddenActivities,
      },
    });
  };

  private resolveRelatedRouteFeatures = async (
    primaryFeature: MapFeature,
    relatedFeatures: MapFeature[],
  ): Promise<MapFeature[]> => {
    if (primaryFeature.properties.type !== FeatureType.Route) {
      return relatedFeatures;
    }

    const routeKey = getRouteGroupKey(primaryFeature);
    if (!routeKey) {
      return relatedFeatures;
    }

    const query =
      primaryFeature.properties.name?.trim() ||
      primaryFeature.properties.ref?.trim();
    if (!query) {
      return relatedFeatures;
    }

    try {
      const searchHits = await searchFeatures(query, 100);
      const byId = new Map(
        relatedFeatures.map((feature) => [feature.properties.id, feature]),
      );
      for (const hit of searchHits) {
        if (
          hit.properties.type === FeatureType.Route &&
          matchesRouteGroupKey(hit.properties, routeKey) &&
          !byId.has(hit.properties.id)
        ) {
          byId.set(hit.properties.id, hit);
        }
      }
      return [...byId.values()];
    } catch {
      return relatedFeatures;
    }
  };

  private loadFullRelatedFeatures = async (
    primaryId: string,
    idType: ObjectIDType,
    relatedFeatures: MapFeature[],
    primaryFeature: MapFeature,
  ): Promise<MapFeature[]> => {
    const uniqueIds = [...new Set(relatedFeatures.map((f) => f.properties.id))];
    if (uniqueIds.length <= 1) {
      return [primaryFeature];
    }

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

      const expandedRelated = await this.resolveRelatedRouteFeatures(
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
      },
    });

    this.loadInfoData(id, idType, relatedFeatures, clickedFeature);
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
    if (urlState.aboutInfoOpen) {
      sidePanelView = "about";
    } else if (showInfo && urlState.selectedObjectID) {
      sidePanelView = "route";
    }

    this.update({
      sidePanelView,
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

  private setSidePanel(view: SidePanelView) {
    this.update({ sidePanelView: view });
  }

  private toggleSidePanel(view: Exclude<SidePanelView, null>) {
    if (this._state.sidePanelView === view) {
      this.closeMenu();
    } else {
      this.setSidePanel(view);
    }
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
      } else {
        delete (changes as Record<string, unknown>)[key];
      }
    });

    if (
      this._state.selectedObject?.showInfo &&
      this._state.sidePanelView === null
    ) {
      this._state.sidePanelView = "route";
      changes.sidePanelView = "route";
    }

    this.updateHandler(this._state, changes);
  }
}
