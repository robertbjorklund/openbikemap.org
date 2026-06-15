import { Switch } from "@mui/material";
import * as React from "react";
import MapFilters from "../MapFilters";
import {
  BIKE_ACTIVITY_LABELS,
  BikeActivity,
} from "../types/BikeActivity";
import EventBus from "./EventBus";
import { PanelShell } from "./PanelShell";
import { RoutesFilterContent } from "./RoutesFilterContent";

export const RoutesFilterPanel: React.FunctionComponent<{
  eventBus: EventBus;
  mapFilters: MapFilters;
}> = (props) => {
  return (
    <PanelShell
      title={BIKE_ACTIVITY_LABELS[BikeActivity.Routes]}
      subtitle="Signed long-distance cycling routes (asphalt and gravel)."
      actions={
        <Switch
          checked={props.mapFilters.showRoutes}
          onChange={() => props.eventBus.toggleRoutesGroup()}
          inputProps={{ "aria-label": "Show bicycle routes on map" }}
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
