import * as React from "react";
import { MapStyle } from "../MapStyle";
import { BasemapStylePicker } from "./BasemapStylePicker";
import EventBus from "./EventBus";
import { PanelShell } from "./PanelShell";

export const MapLayersPanel: React.FunctionComponent<{
  eventBus: EventBus;
  mapStyle: MapStyle;
}> = (props) => {
  return (
    <PanelShell
      title="Layers"
      onClose={() => props.eventBus.closeMenu()}
    >
      <BasemapStylePicker
        mapStyle={props.mapStyle}
        eventBus={props.eventBus}
      />
    </PanelShell>
  );
};
