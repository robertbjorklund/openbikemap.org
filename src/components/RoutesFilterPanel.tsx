import * as React from "react";
import { AppConfig } from "../AppConfig";
import MapFilters from "../MapFilters";
import EventBus from "./EventBus";
import { PanelShell } from "./PanelShell";
import { RoutesFilterContent } from "./RoutesFilterContent";

export const RoutesFilterPanel: React.FunctionComponent<{
  eventBus: EventBus;
  mapFilters: MapFilters;
}> = (props) => {
  const { panelTitle } = AppConfig.layerFilters.routes;

  return (
    <PanelShell
      title={panelTitle}
      subtitle="Signed cycling networks and named MTB route loops."
      showBack={false}
      onClose={() => props.eventBus.closeMenu()}
    >
      <RoutesFilterContent
        eventBus={props.eventBus}
        mapFilters={props.mapFilters}
      />
    </PanelShell>
  );
};
