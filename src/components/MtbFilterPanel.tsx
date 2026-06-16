import { Switch } from "@mui/material";
import * as React from "react";
import MapFilters from "../MapFilters";
import EventBus from "./EventBus";
import { MtbFilterContent } from "./MtbFilterContent";
import { PanelShell } from "./PanelShell";
import { AppConfig } from "../AppConfig";

export const MtbFilterPanel: React.FunctionComponent<{
  eventBus: EventBus;
  mapFilters: MapFilters;
}> = (props) => {
  const { panelTitle, showSwitchAriaLabel } = AppConfig.layerFilters.mtbTrail;

  return (
    <PanelShell
      title={panelTitle}
      subtitle="Single Track Scale — European off-road trail difficulty (S0–S6)."
      actions={
        <Switch
          checked={props.mapFilters.showMtbSts}
          onChange={() => props.eventBus.toggleMtbStsGroup()}
          inputProps={{ "aria-label": showSwitchAriaLabel }}
        />
      }
      onClose={() => props.eventBus.closeMenu()}
    >
      <MtbFilterContent eventBus={props.eventBus} mapFilters={props.mapFilters} />
    </PanelShell>
  );
};
