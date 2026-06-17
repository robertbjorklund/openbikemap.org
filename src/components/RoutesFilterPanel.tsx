import { Switch } from "@mui/material";
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
  const { panelTitle, showSwitchAriaLabel } = AppConfig.layerFilters.routes;

  return (
    <PanelShell
      title={panelTitle}
      subtitle="Signed long-distance cycling routes (asphalt and gravel)."
      showBack={false}
      actions={
        <Switch
          checked={props.mapFilters.showRoutes}
          onChange={() => props.eventBus.toggleRoutesGroup()}
          inputProps={{ "aria-label": showSwitchAriaLabel }}
        />
      }
      onClose={() => props.eventBus.closeMenu()}
    >
      <RoutesFilterContent
        eventBus={props.eventBus}
        mapFilters={props.mapFilters}
      />
    </PanelShell>
  );
};
