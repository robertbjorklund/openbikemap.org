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
      onClose={() => props.eventBus.closeMenu()}
    >
      <RoutesFilterContent
        eventBus={props.eventBus}
        mapFilters={props.mapFilters}
      />
    </PanelShell>
  );
};
