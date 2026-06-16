import { Switch } from "@mui/material";
import * as React from "react";
import MapFilters from "../MapFilters";
import EventBus from "./EventBus";
import { ImbaFilterContent } from "./ImbaFilterContent";
import { PanelShell } from "./PanelShell";
import { AppConfig } from "../AppConfig";

export const ImbaFilterPanel: React.FunctionComponent<{
  eventBus: EventBus;
  mapFilters: MapFilters;
}> = (props) => {
  const { panelTitle, showSwitchAriaLabel } = AppConfig.layerFilters.mtbBikePark;

  return (
    <PanelShell
      title={panelTitle}
      subtitle="IMBA — International Mountain Bicycling Association trail difficulty (0–4)."
      actions={
        <Switch
          checked={props.mapFilters.showMtbImba}
          onChange={() => props.eventBus.toggleMtbImbaGroup()}
          inputProps={{ "aria-label": showSwitchAriaLabel }}
        />
      }
      onClose={() => props.eventBus.closeMenu()}
    >
      <ImbaFilterContent
        eventBus={props.eventBus}
        mapFilters={props.mapFilters}
      />
    </PanelShell>
  );
};
