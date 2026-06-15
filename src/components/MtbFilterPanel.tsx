import * as React from "react";
import MapFilters from "../MapFilters";
import { BIKE_ACTIVITY_LABELS, BikeActivity } from "../types/BikeActivity";
import EventBus from "./EventBus";
import { MtbFilterContent } from "./MtbFilterContent";
import { PanelShell } from "./PanelShell";

export const MtbFilterPanel: React.FunctionComponent<{
  eventBus: EventBus;
  mapFilters: MapFilters;
}> = (props) => {
  return (
    <PanelShell
      title={BIKE_ACTIVITY_LABELS[BikeActivity.Mtb]}
      onClose={() => props.eventBus.closeMenu()}
    >
      <MtbFilterContent eventBus={props.eventBus} mapFilters={props.mapFilters} />
    </PanelShell>
  );
};
