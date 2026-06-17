import * as maplibregl from "maplibre-gl";

import * as ReactDOM from "react-dom/client";

import MapFilters from "../MapFilters";

import type { MapFeature } from "../types/FeatureTypes";

import { AboutPanel } from "./AboutPanel";

import EventBus from "./EventBus";

import { ImbaFilterPanel } from "./ImbaFilterPanel";

import { MtbFilterPanel } from "./MtbFilterPanel";

import { RoutesFilterPanel } from "./RoutesFilterPanel";

import { RoutePanel } from "./RoutePanel";

import { SettingsPanel } from "./SettingsPanel";

import { SidePanelFrame } from "./SidePanelFrame";

import type { SidePanelView } from "./SidePanelView";

import type { RouteGroupSelection } from "./SelectedObject";

import { Themed } from "./Themed";

import {
  getLayoutViewportWidth,
  getSidePanelFlyoutContentWidth,
  getSidePanelRailExpanded,
  getSidePanelRailWidth,
  getRouteBottomSheetHeightPx,
  isMobileRouteBottomSheetActive,
  isSidePanelRailCollapsible,
  setSidePanelRailExpanded,
  SIDE_PANEL_CONTENT_WIDTH_DESKTOP,
  SIDE_PANEL_RAIL_WIDTH,
} from "./sidePanelRailLayout";

export { SIDE_PANEL_RAIL_WIDTH };

/** Fly-out panel content width on desktop; use getSidePanelFlyoutContentWidth on mobile. */
export const SIDE_PANEL_CONTENT_WIDTH = SIDE_PANEL_CONTENT_WIDTH_DESKTOP;

export const SIDE_PANEL_WIDTH =
  SIDE_PANEL_RAIL_WIDTH + SIDE_PANEL_CONTENT_WIDTH;



export class SidePanelControl implements maplibregl.IControl {

  private panel: HTMLDivElement;

  private placeholder: HTMLDivElement;

  private root: ReactDOM.Root | null = null;

  private map: maplibregl.Map | null = null;

  private view: SidePanelView = null;

  private mapFilters: MapFilters;

  private infoFeature: MapFeature | null = null;

  private routeGroup: RouteGroupSelection | null = null;

  private hasRouteSelection = false;
  private routeDetailsExpanded = true;

  private railExpanded = getSidePanelRailExpanded();

  private onRailResize = () => {
    this.railExpanded = getSidePanelRailExpanded();
    this.updatePanelWidth();
    this.map?.resize();
    this.render();
  };



  constructor(
    private eventBus: EventBus,
    mapFilters: MapFilters,
  ) {
    this.mapFilters = mapFilters;
    this.panel = document.createElement("div");
    this.placeholder = document.createElement("div");
    this.placeholder.style.display = "none";
  }



  onAdd = (map: maplibregl.Map) => {

    this.map = map;

    this.root = ReactDOM.createRoot(this.panel);

    map.getContainer().appendChild(this.panel);

    this.initRailLayout();

    window.addEventListener("resize", this.onRailResize);

    this.render();

    return this.placeholder;

  };



  onRemove = () => {

    this.root?.unmount();

    this.root = null;

    window.removeEventListener("resize", this.onRailResize);

    this.panel.remove();

    this.placeholder.remove();

    this.map?.getContainer().style.removeProperty("--side-panel-rail-width");
    this.map?.getContainer().style.removeProperty("--side-panel-width");
    this.map?.getContainer().style.removeProperty("--side-panel-content-width");
    this.map?.getContainer().style.removeProperty("--route-bottom-sheet-height");

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
      infoFeature?: MapFeature | null;
      routeGroup?: RouteGroupSelection | null;
      hasRouteSelection?: boolean;
      routeDetailsExpanded?: boolean;
    },
  ) => {
    this.view = view;

    if (options?.mapFilters) {
      this.mapFilters = options.mapFilters;
    }

    if (options?.infoFeature !== undefined) {
      this.infoFeature = options.infoFeature;
    }

    if (options?.routeGroup !== undefined) {
      this.routeGroup = options.routeGroup;
    }

    if (options?.hasRouteSelection !== undefined) {
      this.hasRouteSelection = options.hasRouteSelection;
    }
    if (options?.routeDetailsExpanded !== undefined) {
      this.routeDetailsExpanded = options.routeDetailsExpanded;
    }

    this.updatePanelWidth();
    this.map?.resize();
    this.render();
  };

  private handleExpandRail = () => {
    setSidePanelRailExpanded(true);
    this.railExpanded = true;
    this.updatePanelWidth();
    this.map?.resize();
    this.render();
  };

  private handleCollapseRail = () => {
    setSidePanelRailExpanded(false);
    this.railExpanded = false;
    this.updatePanelWidth();
    this.map?.resize();
    this.render();
  };

  /** Reserve rail width when closed; rail + content when a panel is open. */
  private updatePanelWidth = () => {
    const container = this.map?.getContainer();
    if (!container) {
      return;
    }
    const mapHeight = container.clientHeight;
    const viewportWidth = getLayoutViewportWidth();
    const railWidth = getSidePanelRailWidth(viewportWidth);
    const contentWidth = getSidePanelFlyoutContentWidth(viewportWidth);
    const mobileRouteBottomSheet = isMobileRouteBottomSheetActive(
      this.hasRouteSelection,
      viewportWidth,
    );
    const routePanelCollapsed = mobileRouteBottomSheet && !this.routeDetailsExpanded;
    const bottomSheetHeight = mobileRouteBottomSheet
      ? routePanelCollapsed
        ? 56
        : getRouteBottomSheetHeightPx(mapHeight)
      : 0;

    container.style.setProperty("--side-panel-rail-width", `${railWidth}px`);
    container.style.setProperty(
      "--side-panel-content-width",
      `${contentWidth}px`,
    );
    container.style.setProperty(
      "--route-bottom-sheet-height",
      `${bottomSheetHeight}px`,
    );

    const routeOnlyMobileSheet =
      mobileRouteBottomSheet && this.view === "route";
    const flyoutPanelOpen = this.view !== null && !routeOnlyMobileSheet;

    const openWidth = flyoutPanelOpen
      ? railWidth > 0
        ? railWidth + contentWidth
        : contentWidth
      : mobileRouteBottomSheet
        ? railWidth
        : railWidth;
    container.style.setProperty("--side-panel-width", `${openWidth}px`);
  };

  private initRailLayout = () => {
    this.updatePanelWidth();
  };



  private render = () => {

    if (!this.root) {

      return;

    }

    this.updatePanelWidth();

    const open = this.view !== null;
    const viewportWidth = getLayoutViewportWidth();
    const mobileRouteBottomSheet = isMobileRouteBottomSheetActive(
      this.hasRouteSelection,
      viewportWidth,
    );
    const routeBottomSheetOpen = mobileRouteBottomSheet;
    const routeBottomSheetCollapsed =
      routeBottomSheetOpen && !this.routeDetailsExpanded;

    const routePanel = this.hasRouteSelection ? (
      <RoutePanel
        feature={this.infoFeature}
        routeGroup={this.routeGroup ?? undefined}
        eventBus={this.eventBus}
        routeDetailsExpanded={this.routeDetailsExpanded}
        map={this.map ?? undefined}
      />
    ) : null;

    let content: React.ReactNode = null;
    let routeBottomSheetContent: React.ReactNode = null;

    if (this.view === "mtbFilter") {
      content = (
        <MtbFilterPanel eventBus={this.eventBus} mapFilters={this.mapFilters} />
      );
    } else if (this.view === "imbaFilter") {
      content = (
        <ImbaFilterPanel eventBus={this.eventBus} mapFilters={this.mapFilters} />
      );
    } else if (this.view === "routesFilter") {
      content = (
        <RoutesFilterPanel
          eventBus={this.eventBus}
          mapFilters={this.mapFilters}
        />
      );
    } else if (this.view === "settings") {

      content = <SettingsPanel eventBus={this.eventBus} />;

    } else if (this.view === "about") {

      content = <AboutPanel eventBus={this.eventBus} />;

    } else if (this.view === "route" && !routeBottomSheetOpen) {
      content = routePanel;
    }

    if (routeBottomSheetOpen && routePanel) {
      routeBottomSheetContent = routePanel;
    }



    this.root.render(

      <Themed>

        <SidePanelFrame
          open={open}
          activeView={this.view}
          hasRouteSelection={this.hasRouteSelection}
          routeBottomSheetOpen={routeBottomSheetOpen}
          routeBottomSheetCollapsed={routeBottomSheetCollapsed}
          routeBottomSheetContent={routeBottomSheetContent}
          railExpanded={this.railExpanded}
          railCollapsible={isSidePanelRailCollapsible()}
          eventBus={this.eventBus}
          onExpandRail={this.handleExpandRail}
          onCollapseRail={this.handleCollapseRail}
        >
          {content}
        </SidePanelFrame>

      </Themed>,

    );

  };

}

