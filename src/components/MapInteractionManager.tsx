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
  private attached = false;

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
    if (this.attached) {
      return;
    }
    this.attached = true;

    this.map.on("click", this.onMapClick);
    this.map.on("mousemove", this.onMouseMove);
  }

  private onMapClick = debounce(
    10,
    (e: maplibregl.MapMouseEvent) => {
      if (!this.interactionsEnabled) {
        return;
      }

      const layers = this.getTappableLayerIds();
      if (layers.length === 0) {
        return;
      }

      const features = this.map.queryRenderedFeatures(e.point, { layers });
      if (features.length === 0) {
        this.eventBus.hideInfo();
        return;
      }

      const feature = features[0];
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

  private onMouseMove = (e: maplibregl.MapMouseEvent) => {
    const layers = this.getTappableLayerIds();
    if (layers.length === 0) {
      this.map.getCanvas().style.cursor = "";
      return;
    }

    const features = this.map.queryRenderedFeatures(e.point, { layers });
    this.map.getCanvas().style.cursor =
      features.length > 0 && this.interactionsEnabled ? "pointer" : "";
  };
}
