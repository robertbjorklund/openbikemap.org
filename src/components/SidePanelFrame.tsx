import * as React from "react";

import EventBus from "./EventBus";

import { SearchBox } from "./SearchBox";

import { SidePanelRail } from "./SidePanelRail";

import { SidePanelRailExpandTab } from "./SidePanelRailExpandTab";

import type { SidePanelView } from "./SidePanelView";

export const SidePanelFrame: React.FunctionComponent<
  React.PropsWithChildren<{
    open: boolean;
    searchOpen: boolean;
    activeView: SidePanelView;
    railExpanded: boolean;
    railCollapsible: boolean;
    eventBus: EventBus;
    onToggleSearch: () => void;
    onCloseSearch: () => void;
    onExpandRail: () => void;
    onCollapseRail: () => void;
  }>
> = (props) => {
  const withSearchClosed = (action: () => void) => () => {
    if (props.searchOpen) {
      props.onCloseSearch();
    }
    action();
  };

  const railCollapsed = props.railCollapsible && !props.railExpanded;
  const panelClassName = [
    "side-panel",
    props.open ? "side-panel-open" : "",
    railCollapsed ? "side-panel-rail-collapsed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {railCollapsed && (
        <SidePanelRailExpandTab onExpand={props.onExpandRail} />
      )}

      <div className={panelClassName}>
        <SidePanelRail
          open={props.open}
          searchOpen={props.searchOpen}
          activeView={props.activeView}
          showCollapseButton={props.railCollapsible && props.railExpanded}
          onCollapseRail={props.onCollapseRail}
          onToggleSearch={props.onToggleSearch}
          onOpenMapLayers={withSearchClosed(() => props.eventBus.openMapLayers())}
          onOpenRoute={withSearchClosed(() => props.eventBus.openRoute())}
          onOpenMtbFilter={withSearchClosed(() => props.eventBus.openMtbFilter())}
          onOpenImbaFilter={withSearchClosed(() => props.eventBus.openImbaFilter())}
          onOpenRoutesFilter={withSearchClosed(() =>
            props.eventBus.openRoutesFilter(),
          )}
          onOpenSettings={withSearchClosed(() => props.eventBus.openSettings())}
          onOpenCredits={withSearchClosed(() => props.eventBus.openCredits())}
          onOpenAbout={withSearchClosed(() => props.eventBus.openAboutInfo())}
          onOpenCookiePolicy={withSearchClosed(() =>
            props.eventBus.openCookiePolicy(),
          )}
        />

        {props.open && (
          <div className="side-panel-content">{props.children}</div>
        )}
      </div>

      {props.searchOpen && (
        <SearchBox eventBus={props.eventBus} onClose={props.onToggleSearch} />
      )}
    </>
  );
};
