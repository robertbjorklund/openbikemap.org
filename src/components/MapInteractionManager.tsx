import * as maplibregl from "maplibre-gl";
import { debounce } from "throttle-debounce";
import { FeatureType, type MapFeature } from "../types/FeatureTypes";
import { findRelatedFeatures } from "../utils/FeatureGroup";
import EventBus from "./EventBus";
import { mapFeatureFromMvt } from "./MvtFeature";
import type { RouteGroupSelection } from "./SelectedObject";

const TAPPABLE_LAYER_IDS = ["tappable-trail", "tappable-route"];

export interface RouteInteractionCallbacks {
  getRouteGroup: () => RouteGroupSelection | null;
  /** When set, only routes in this group accept clicks. */
  getLockedRouteGroupId: () => string | null;
  onStageHover: (stageId: string | null, point?: maplibregl.Point) => void;
}

export class MapInteractionManager {
  private map: maplibregl.Map;
  private eventBus: EventBus;
  private callbacks: RouteInteractionCallbacks | undefined;
  private interactionsEnabled = true;
  private attachedLayerHandlers = new Set<string>();
  private hoverLayerCount = 0;
  private mapHandlersAttached = false;

  constructor(
    map: maplibregl.Map,
    eventBus: EventBus,
    callbacks?: RouteInteractionCallbacks,
  ) {
    this.map = map;
    this.eventBus = eventBus;
    this.callbacks = callbacks;

    map.on("styledata", () => {
      this.attachListeners();
    });
  }

  setInteractionsEnabled(enabled: boolean): void {
    this.interactionsEnabled = enabled;
  }

  private getTappableLayerIds(): string[] {
    const style = this.map.getStyle();
    if (!style?.layers) {
      return TAPPABLE_LAYER_IDS.filter((id) => this.map.getLayer(id) !== undefined);
    }
    return style.layers
      .map((layer) => layer.id)
      .filter(
        (id) =>
          id.includes("tappable") &&
          this.map.getLayer(id) !== undefined,
      );
  }

  private getRouteTappableLayerIds(): string[] {
    return this.getTappableLayerIds().filter((id) => id.includes("route"));
  }

  private attachListeners() {
    const layers = this.getTappableLayerIds();

    for (const layerId of layers) {
      if (this.attachedLayerHandlers.has(layerId)) {
        continue;
      }
      this.attachedLayerHandlers.add(layerId);
      this.map.on("click", layerId, this.onLayerClick);
      this.map.on("mouseenter", layerId, this.onLayerMouseEnter);
      this.map.on("mouseleave", layerId, this.onLayerMouseLeave);
    }

    if (!this.mapHandlersAttached) {
      this.mapHandlersAttached = true;
      this.map.on("mousemove", this.onMapMouseMove);
      this.map.on("mouseleave", this.onMapMouseLeave);
    }
  }

  private pickRouteFeatureInGroupAtPoint(
    point: maplibregl.PointLike,
    groupId: string,
  ): MapFeature | null {
    const layers = this.getRouteTappableLayerIds();
    if (layers.length === 0) {
      return null;
    }

    const hits = this.map.queryRenderedFeatures(point, { layers });
    for (const hit of hits) {
      const sourceLayer = (
        hit.layer as { "source-layer"?: string } | undefined
      )?.["source-layer"];
      if (!sourceLayer) {
        continue;
      }
      const mapFeature = mapFeatureFromMvt(
        hit as maplibregl.MapGeoJSONFeature,
        sourceLayer,
      );
      if (
        mapFeature?.properties.type === FeatureType.Route &&
        mapFeature.properties.groupId === groupId
      ) {
        return mapFeature;
      }
    }
    return null;
  }

  private pickRouteStageAtPoint(
    point: maplibregl.PointLike,
    groupId: string,
  ): string | null {
    const feature = this.pickRouteFeatureInGroupAtPoint(point, groupId);
    if (
      feature?.properties.type === FeatureType.Route &&
      feature.properties.stageId
    ) {
      return feature.properties.stageId;
    }
    return null;
  }

  private onMapMouseMove = (e: maplibregl.MapMouseEvent) => {
    if (!this.interactionsEnabled) {
      return;
    }

    const routeGroup = this.callbacks?.getRouteGroup();
    if (!routeGroup) {
      this.callbacks?.onStageHover(null, e.point);
      return;
    }

    const stageId = this.pickRouteStageAtPoint(e.point, routeGroup.groupId);
    this.callbacks?.onStageHover(stageId, e.point);
  };

  private onMapMouseLeave = () => {
    if (!this.interactionsEnabled) {
      return;
    }
    this.callbacks?.onStageHover(null);
  };

  private onLayerClick = debounce(
    10,
    (e: maplibregl.MapLayerMouseEvent) => {
      if (!this.interactionsEnabled) {
        return;
      }

      const sourceLayer = (
        e.features?.[0]?.layer as { "source-layer"?: string } | undefined
      )?.["source-layer"];
      if (!sourceLayer) {
        return;
      }

      const lockedGroupId = this.callbacks?.getLockedRouteGroupId();
      const isRouteLayer = sourceLayer === "routes";

      if (lockedGroupId && isRouteLayer) {
        const picked = this.pickRouteFeatureInGroupAtPoint(
          e.point,
          lockedGroupId,
        );
        if (!picked) {
          return;
        }
        const routeGroup = this.callbacks?.getRouteGroup();
        if (
          routeGroup &&
          picked.properties.type === FeatureType.Route &&
          picked.properties.stageId
        ) {
          this.eventBus.selectRouteStage(picked.properties.stageId);
        }
        return;
      }

      const feature = e.features?.[0];
      if (!feature) {
        return;
      }

      const mapFeature = mapFeatureFromMvt(feature, sourceLayer);
      const id = mapFeature?.properties.id;
      if (!id || !mapFeature) {
        return;
      }

      const relatedFeatures = findRelatedFeatures(this.map, mapFeature);
      this.eventBus.showInfo(id, { clickedFeature: mapFeature, relatedFeatures });
    },
    { atBegin: true },
  );

  private onLayerMouseEnter = () => {
    if (!this.interactionsEnabled) {
      return;
    }
    this.hoverLayerCount += 1;
    this.map.getCanvas().style.cursor = "pointer";
  };

  private onLayerMouseLeave = () => {
    this.hoverLayerCount = Math.max(0, this.hoverLayerCount - 1);
    if (this.hoverLayerCount === 0) {
      this.map.getCanvas().style.cursor = "";
    }
  };
}
