import * as React from "react";

import EventBus from "./EventBus";

import { MobileBottomNav } from "./MobileBottomNav";

import { SearchBox } from "./SearchBox";

import { SidePanelRail } from "./SidePanelRail";

import { isMobileLayout } from "./sidePanelRailLayout";

import type { SidePanelView } from "./SidePanelView";

export const SidePanelFrame: React.FunctionComponent<
  React.PropsWithChildren<{
    open: boolean;
    activeView: SidePanelView;
    hasRouteSelection?: boolean;
    routeBottomSheetOpen?: boolean;
    routeBottomSheetCollapsed?: boolean;
    routeBottomSheetContent?: React.ReactNode;
    eventBus: EventBus;
  }>
> = (props) => {
  const mobileLayout = isMobileLayout();
  const routeBottomSheetOpen = props.routeBottomSheetOpen ?? false;
  const routeBottomSheetCollapsed = props.routeBottomSheetCollapsed ?? false;
  const routeHostOnly =
    routeBottomSheetOpen && props.activeView === "route";
  const showFlyoutContent =
    props.open && (!routeBottomSheetOpen || props.activeView !== "route");
  const showMobileFlyoutSheet = mobileLayout && showFlyoutContent;
  const panelClassName = [
    "side-panel",
    props.open || routeBottomSheetOpen ? "side-panel-open" : "",
    routeHostOnly ? "side-panel-route-host" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <SearchBox eventBus={props.eventBus} />

      {!mobileLayout && (
        <div className={panelClassName}>
          <SidePanelRail
            open={props.open || routeBottomSheetOpen}
            activeView={props.activeView}
            hasRouteSelection={props.hasRouteSelection ?? false}
            onOpenRoute={() => props.eventBus.openRoute()}
            onOpenMtbFilter={() => props.eventBus.openMtbFilter()}
            onOpenImbaFilter={() => props.eventBus.openImbaFilter()}
            onOpenRoutesFilter={() => props.eventBus.openRoutesFilter()}
            onOpenApp={() => props.eventBus.openSettings()}
          />

          {showFlyoutContent && (
            <div className="side-panel-content">{props.children}</div>
          )}
        </div>
      )}

      {showMobileFlyoutSheet && (
        <div className="mobile-flyout-bottom-sheet">{props.children}</div>
      )}

      {mobileLayout && (
        <MobileBottomNav
          open={props.open || routeBottomSheetOpen}
          activeView={props.activeView}
          onOpenRoutesFilter={() => props.eventBus.openRoutesFilter()}
          onOpenMtbFilter={() => props.eventBus.openMtbFilter()}
          onOpenImbaFilter={() => props.eventBus.openImbaFilter()}
          onOpenApp={() => props.eventBus.openSettings()}
        />
      )}

      {routeBottomSheetOpen && props.routeBottomSheetContent != null && (
        <div
          className={[
            "route-bottom-sheet",
            routeBottomSheetCollapsed ? "route-bottom-sheet-collapsed" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {props.routeBottomSheetContent}
        </div>
      )}
    </>
  );
};
