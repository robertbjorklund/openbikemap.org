import * as React from "react";

import { openCookiePolicy } from "./ExternalURLOpener";

import EventBus from "./EventBus";

import { SearchBox } from "./SearchBox";

import { SidePanelRail } from "./SidePanelRail";

import type { SidePanelView } from "./SidePanelView";



export const SidePanelFrame: React.FunctionComponent<

  React.PropsWithChildren<{

    open: boolean;

    searchOpen: boolean;

    activeView: SidePanelView;

    eventBus: EventBus;

    onToggleSearch: () => void;

    onCloseSearch: () => void;

  }>

> = (props) => {

  const withSearchClosed = (action: () => void) => () => {

    if (props.searchOpen) {

      props.onCloseSearch();

    }

    action();

  };



  return (

    <>

      <div className={`side-panel${props.open ? " side-panel-open" : ""}`}>

        <SidePanelRail

          open={props.open}

          searchOpen={props.searchOpen}

          activeView={props.activeView}

          onToggleSearch={props.onToggleSearch}

          onOpenMapLayers={withSearchClosed(() => props.eventBus.openMapLayers())}

          onOpenRoute={withSearchClosed(() => props.eventBus.openRoute())}

          onOpenFilter={withSearchClosed(() => props.eventBus.openFilter())}

          onOpenSettings={withSearchClosed(() => props.eventBus.openSettings())}

          onOpenCredits={withSearchClosed(() => props.eventBus.openCredits())}

          onOpenAbout={withSearchClosed(() => props.eventBus.openAboutInfo())}

          onOpenCookiePolicy={withSearchClosed(openCookiePolicy)}

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


