import { Switch } from "@mui/material";
import * as React from "react";
import MapFilters from "../MapFilters";
import EventBus from "./EventBus";
import { MtbFilterContent } from "./MtbFilterContent";
import { PanelShell } from "./PanelShell";

export const MtbFilterPanel: React.FunctionComponent<{
  eventBus: EventBus;
  mapFilters: MapFilters;
}> = (props) => {
  return (
    <PanelShell
      title="STS"
      subtitle="Single Track Scale — European off-road trail difficulty (S0–S6)."
      actions={
        <Switch
          checked={props.mapFilters.showMtbSts}
          onChange={() => props.eventBus.toggleMtbStsGroup()}
          inputProps={{ "aria-label": "Show STS trails on map" }}
        />
      }
      onClose={() => props.eventBus.closeMenu()}
    >
      <MtbFilterContent eventBus={props.eventBus} mapFilters={props.mapFilters} />
    </PanelShell>
  );
};
