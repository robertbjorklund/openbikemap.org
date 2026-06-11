import * as maplibregl from "maplibre-gl";
import { debounce } from "throttle-debounce";
import { findRelatedFeatures } from "../utils/FeatureGroup";
import EventBus from "./EventBus";
import { mapFeatureFromMvt } from "./MvtFeature";

const TAPPABLE_LAYER_IDS = ["tappable-trail", "tappable-route"];

export class MapInteractionManager {
  private map: maplibregl.Map;
  private eventBus: EventBus;
  private interactionsEnabled = true;
  private attachedLayerHandlers = new Set<string>();
  private hoverLayerCount = 0;

  constructor(map: maplibregl.Map, eventBus: EventBus) {
    this.map = map;
    this.eventBus = eventBus;

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
  }

  private onLayerClick = debounce(
    10,
    (e: maplibregl.MapLayerMouseEvent) => {
      if (!this.interactionsEnabled) {
        return;
      }

      const feature = e.features?.[0];
      if (!feature) {
        return;
      }

      const sourceLayer = (
        feature.layer as { "source-layer"?: string } | undefined
      )?.["source-layer"];
      if (!sourceLayer) {
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
