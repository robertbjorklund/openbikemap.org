import * as maplibregl from "maplibre-gl";

import * as ReactDOM from "react-dom/client";

import MapFilters from "../MapFilters";

import { MapStyle } from "../MapStyle";

import type { MapFeature } from "../types/FeatureTypes";

import { AboutPanel } from "./AboutPanel";

import { CreditsPanel } from "./CreditsPanel";

import EventBus from "./EventBus";

import { FilterPanel } from "./FilterPanel";

import { RoutePanel } from "./RoutePanel";

import { MapLayersPanel } from "./MapLayersPanel";

import { SettingsPanel } from "./SettingsPanel";

import { SidePanelFrame } from "./SidePanelFrame";

import type { SidePanelView } from "./SidePanelView";

import { Themed } from "./Themed";



export const SIDE_PANEL_RAIL_WIDTH = 80;

/** Fly-out panel content width; total open width includes the rail. */
export const SIDE_PANEL_CONTENT_WIDTH = 400;

export const SIDE_PANEL_WIDTH =
  SIDE_PANEL_RAIL_WIDTH + SIDE_PANEL_CONTENT_WIDTH;



export class SidePanelControl implements maplibregl.IControl {

  private panel: HTMLDivElement;

  private placeholder: HTMLDivElement;

  private root: ReactDOM.Root | null = null;

  private map: maplibregl.Map | null = null;

  private view: SidePanelView = null;

  private searchOpen = false;

  private mapStyle: MapStyle;

  private mapFilters: MapFilters;

  private infoFeature: MapFeature | null = null;



  constructor(

    private eventBus: EventBus,

    mapFilters: MapFilters,

    mapStyle: MapStyle,

  ) {

    this.mapFilters = mapFilters;

    this.mapStyle = mapStyle;

    this.panel = document.createElement("div");

    this.placeholder = document.createElement("div");

    this.placeholder.style.display = "none";

  }



  onAdd = (map: maplibregl.Map) => {

    this.map = map;

    this.root = ReactDOM.createRoot(this.panel);

    map.getContainer().appendChild(this.panel);

    this.initRailLayout();

    this.render();

    return this.placeholder;

  };



  onRemove = () => {

    this.root?.unmount();

    this.root = null;

    this.panel.remove();

    this.placeholder.remove();

    this.map?.getContainer().style.removeProperty("--side-panel-rail-width");
    this.map?.getContainer().style.removeProperty("--side-panel-width");

    this.map = null;

  };



  getDefaultPosition = (): maplibregl.ControlPosition => {

    return "top-left";

  };



  getView = (): SidePanelView => this.view;

  updateMapFilters = (mapFilters: MapFilters) => {
    this.mapFilters = mapFilters;
    this.render();
  };

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
      if (options.infoFeature !== null || view !== "route") {
        this.infoFeature = options.infoFeature;
      }
    }

    this.render();

  };



  private closeSearch = () => {
    if (!this.searchOpen) {
      return;
    }
    this.searchOpen = false;
    this.render();
  };

  private handleToggleSearch = () => {
    const willOpen = !this.searchOpen;
    if (willOpen && this.view !== null) {
      if (this.view === "route") {
        this.eventBus.hideInfo();
      } else {
        this.eventBus.closeMenu();
      }
      this.view = null;
    }
    this.searchOpen = !this.searchOpen;
    this.render();
  };

  /** Reserve rail width only; expanded panel content overlays the map. */
  private initRailLayout = () => {
    const container = this.map?.getContainer();
    container?.style.setProperty(
      "--side-panel-rail-width",
      `${SIDE_PANEL_RAIL_WIDTH}px`,
    );
    container?.style.setProperty(
      "--side-panel-width",
      `${SIDE_PANEL_WIDTH}px`,
    );
  };



  private render = () => {

    if (!this.root) {

      return;

    }



    const open = this.view !== null;

    let content: React.ReactNode = null;



    if (this.view === "mapLayers") {

      content = (

        <MapLayersPanel

          eventBus={this.eventBus}

          mapStyle={this.mapStyle}

        />

      );

    } else if (this.view === "filter") {

      content = (

        <FilterPanel eventBus={this.eventBus} mapFilters={this.mapFilters} />

      );

    } else if (this.view === "settings") {

      content = <SettingsPanel eventBus={this.eventBus} />;

    } else if (this.view === "credits") {

      content = <CreditsPanel eventBus={this.eventBus} />;

    } else if (this.view === "about") {

      content = <AboutPanel eventBus={this.eventBus} />;

    } else if (this.view === "route") {
      content = (
        <RoutePanel
          feature={this.infoFeature}
          eventBus={this.eventBus}
          map={this.map ?? undefined}
        />
      );
    }



    this.root.render(

      <Themed>

        <SidePanelFrame
          open={open}
          searchOpen={this.searchOpen}
          activeView={this.view}
          eventBus={this.eventBus}
          onToggleSearch={this.handleToggleSearch}
          onCloseSearch={this.closeSearch}
        >
          {content}
        </SidePanelFrame>

      </Themed>,

    );

  };

}

