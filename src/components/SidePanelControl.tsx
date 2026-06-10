import * as maplibregl from "maplibre-gl";
import * as ReactDOM from "react-dom/client";
import MapFilters from "../MapFilters";
import { MapStyle } from "../MapStyle";
import type { MapFeature } from "../types/FeatureTypes";
import { AboutPanel } from "./AboutPanel";
import EventBus from "./EventBus";
import { InfoPanel } from "./InfoPanel";
import { LayersPanel } from "./LayersPanel";
import { MenuPanel } from "./MenuPanel";
import type { SidePanelView } from "./SidePanelView";
import { Themed } from "./Themed";

export const SIDE_PANEL_WIDTH = 400;

export class SidePanelControl implements maplibregl.IControl {
  private panel: HTMLDivElement;
  private placeholder: HTMLDivElement;
  private root: ReactDOM.Root | null = null;
  private map: maplibregl.Map | null = null;
  private view: SidePanelView = null;
  private mapFilters: MapFilters;
  private mapStyle: MapStyle;
  private infoFeature: MapFeature | null = null;

  constructor(
    private eventBus: EventBus,
    mapFilters: MapFilters,
    mapStyle: MapStyle,
  ) {
    this.mapFilters = mapFilters;
    this.mapStyle = mapStyle;
    this.panel = document.createElement("div");
    this.panel.className = "side-panel";
    this.placeholder = document.createElement("div");
    this.placeholder.style.display = "none";
  }

  onAdd = (map: maplibregl.Map) => {
    this.map = map;
    this.root = ReactDOM.createRoot(this.panel);
    map.getContainer().appendChild(this.panel);
    this.render();
    return this.placeholder;
  };

  onRemove = () => {
    this.root?.unmount();
    this.root = null;
    this.panel.remove();
    this.placeholder.remove();
    this.map = null;
  };

  getDefaultPosition = (): maplibregl.ControlPosition => {
    return "top-left";
  };

  getView = (): SidePanelView => this.view;

  setView = (
    view: SidePanelView,
    options?: {
      mapFilters?: MapFilters;
      mapStyle?: MapStyle;
      infoFeature?: MapFeature | null;
    },
  ) => {
    this.view = view;
    if (options?.mapFilters) {
      this.mapFilters = options.mapFilters;
    }
    if (options?.mapStyle) {
      this.mapStyle = options.mapStyle;
    }
    if (options?.infoFeature !== undefined) {
      this.infoFeature = options.infoFeature;
    }
    this.panel.classList.toggle("side-panel-open", view !== null);
    this.map
      ?.getContainer()
      .classList.toggle("side-panel-visible", view !== null);
    this.render();
  };

  private render = () => {
    if (!this.root) {
      return;
    }

    let content: React.ReactNode = null;
    if (this.view === "menu") {
      content = (
        <MenuPanel eventBus={this.eventBus} currentMapStyle={this.mapStyle} />
      );
    } else if (this.view === "layers") {
      content = (
        <LayersPanel eventBus={this.eventBus} mapFilters={this.mapFilters} />
      );
    } else if (this.view === "about") {
      content = <AboutPanel eventBus={this.eventBus} />;
    } else if (this.view === "info" && this.infoFeature) {
      content = (
        <InfoPanel feature={this.infoFeature} eventBus={this.eventBus} />
      );
    }

    this.root.render(<Themed>{content}</Themed>);
  };
}
