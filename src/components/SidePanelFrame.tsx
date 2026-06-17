import * as React from "react";

import EventBus from "./EventBus";

import { SearchBox } from "./SearchBox";

import { SidePanelRail } from "./SidePanelRail";

import { SidePanelRailExpandTab } from "./SidePanelRailExpandTab";

import type { SidePanelView } from "./SidePanelView";

export const SidePanelFrame: React.FunctionComponent<
  React.PropsWithChildren<{
    open: boolean;
    activeView: SidePanelView;
    hasRouteSelection?: boolean;
    routeBottomSheetOpen?: boolean;
    routeBottomSheetCollapsed?: boolean;
    routeBottomSheetContent?: React.ReactNode;
    railExpanded: boolean;
    railCollapsible: boolean;
    eventBus: EventBus;
    onExpandRail: () => void;
    onCollapseRail: () => void;
  }>
> = (props) => {
  const railCollapsed = props.railCollapsible && !props.railExpanded;
  const routeBottomSheetOpen = props.routeBottomSheetOpen ?? false;
  const routeBottomSheetCollapsed = props.routeBottomSheetCollapsed ?? false;
  const routeHostOnly =
    routeBottomSheetOpen && props.activeView === "route";
  const showFlyoutContent =
    props.open && (!routeBottomSheetOpen || props.activeView !== "route");
  const panelClassName = [
    "side-panel",
    props.open || routeBottomSheetOpen ? "side-panel-open" : "",
    railCollapsed ? "side-panel-rail-collapsed" : "",
    routeHostOnly ? "side-panel-route-host" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <SearchBox eventBus={props.eventBus} />

      {railCollapsed && (
        <SidePanelRailExpandTab onExpand={props.onExpandRail} />
      )}

      <div className={panelClassName}>
        <SidePanelRail
          open={props.open || routeBottomSheetOpen}
          activeView={props.activeView}
          hasRouteSelection={props.hasRouteSelection ?? false}
          showCollapseButton={props.railCollapsible && props.railExpanded}
          onCollapseRail={props.onCollapseRail}
          onOpenRoute={() => props.eventBus.openRoute()}
          onOpenMtbFilter={() => props.eventBus.openMtbFilter()}
          onOpenImbaFilter={() => props.eventBus.openImbaFilter()}
          onOpenRoutesFilter={() => props.eventBus.openRoutesFilter()}
          onOpenSettings={() => props.eventBus.openSettings()}
          onOpenAbout={() => props.eventBus.openAboutInfo()}
        />

        {showFlyoutContent && (
          <div className="side-panel-content">{props.children}</div>
        )}
      </div>

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
