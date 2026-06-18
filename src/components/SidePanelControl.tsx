import * as maplibregl from "maplibre-gl";

import * as ReactDOM from "react-dom/client";

import MapFilters from "../MapFilters";

import type { MapFeature } from "../types/FeatureTypes";

import { AppPanel } from "./AppPanel";

import type { AppPanelTab } from "./AppPanelTab";

import EventBus from "./EventBus";

import { ImbaFilterPanel } from "./ImbaFilterPanel";

import { MtbFilterPanel } from "./MtbFilterPanel";

import { RoutesFilterPanel } from "./RoutesFilterPanel";

import { RoutePanel } from "./RoutePanel";

import { SidePanelFrame } from "./SidePanelFrame";

import type { SidePanelView } from "./SidePanelView";

import type { RouteGroupSelection } from "./SelectedObject";

import { Themed } from "./Themed";

import {
  getLayoutViewportWidth,
  getMobileBottomNavHeightPx,
  getMobileFlyoutBottomInsetPx,
  getMobileFlyoutBottomSheetHeightPx,
  getSidePanelFlyoutContentWidth,
  getSidePanelRailWidth,
  getRouteBottomSheetHeightPx,
  isMobileLayout,
  isMobileRouteBottomSheetActive,
  ROUTE_BOTTOM_SHEET_COLLAPSED_HEIGHT_PX,
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

  private appPanelTab: AppPanelTab = "settings";

  private mapFilters: MapFilters;

  private infoFeature: MapFeature | null = null;

  private routeGroup: RouteGroupSelection | null = null;

  private hasRouteSelection = false;
  private routeDetailsExpanded = true;

  private onLayoutResize = () => {
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

    window.addEventListener("resize", this.onLayoutResize);

    this.render();

    return this.placeholder;
  };

  onRemove = () => {
    this.root?.unmount();

    this.root = null;

    window.removeEventListener("resize", this.onLayoutResize);

    this.panel.remove();

    this.placeholder.remove();

    const container = this.map?.getContainer();
    container?.style.removeProperty("--side-panel-rail-width");
    container?.style.removeProperty("--side-panel-width");
    container?.style.removeProperty("--side-panel-content-width");
    container?.style.removeProperty("--route-bottom-sheet-height");
    container?.style.removeProperty("--mobile-bottom-nav-height");
    container?.style.removeProperty("--mobile-flyout-bottom-sheet-height");
    container?.style.removeProperty("--mobile-flyout-bottom-inset");

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
      appPanelTab?: AppPanelTab;
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
    if (options?.appPanelTab !== undefined) {
      this.appPanelTab = options.appPanelTab;
    }

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
    const mobileLayout = isMobileLayout(viewportWidth);
    const railWidth = getSidePanelRailWidth(viewportWidth);
    const contentWidth = getSidePanelFlyoutContentWidth(viewportWidth);
    const bottomNavHeight = getMobileBottomNavHeightPx(viewportWidth);
    const mobileRouteBottomSheet = isMobileRouteBottomSheetActive(
      this.hasRouteSelection,
      viewportWidth,
    );
    const routePanelCollapsed = mobileRouteBottomSheet && !this.routeDetailsExpanded;
    const bottomSheetHeight = mobileRouteBottomSheet
      ? routePanelCollapsed
        ? ROUTE_BOTTOM_SHEET_COLLAPSED_HEIGHT_PX
        : getRouteBottomSheetHeightPx(mapHeight)
      : 0;

    const routeOnlyMobileSheet =
      mobileRouteBottomSheet && this.view === "route";
    const flyoutPanelOpen = this.view !== null && !routeOnlyMobileSheet;
    const mobileFlyoutBottomSheet = mobileLayout && flyoutPanelOpen;
    const flyoutBottomInset = getMobileFlyoutBottomInsetPx(
      mobileRouteBottomSheet && routePanelCollapsed && mobileFlyoutBottomSheet,
    );
    const flyoutBottomSheetHeight = mobileFlyoutBottomSheet
      ? getMobileFlyoutBottomSheetHeightPx(mapHeight, flyoutBottomInset)
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
    container.style.setProperty(
      "--mobile-bottom-nav-height",
      `${bottomNavHeight}px`,
    );
    container.style.setProperty(
      "--mobile-flyout-bottom-sheet-height",
      `${flyoutBottomSheetHeight}px`,
    );
    container.style.setProperty(
      "--mobile-flyout-bottom-inset",
      `${flyoutBottomInset}px`,
    );

    const openWidth = mobileLayout
      ? 0
      : flyoutPanelOpen
        ? railWidth + contentWidth
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

    const showRoutePanel = this.view === "route" || this.hasRouteSelection;
    const routePanel = showRoutePanel ? (
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
    } else if (this.view === "app") {
      content = (
        <AppPanel
          eventBus={this.eventBus}
          activeTab={this.appPanelTab}
          onTabChange={(tab) => this.eventBus.setAppPanelTab(tab)}
        />
      );
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
          eventBus={this.eventBus}
        >
          {content}
        </SidePanelFrame>
      </Themed>,
    );
  };
}
