import type * as maplibregl from "maplibre-gl";
import * as React from "react";
import type { MapFeature } from "../types/FeatureTypes";
import EventBus from "./EventBus";
import { Info } from "./Info";
import { PanelShell } from "./PanelShell";

export const InfoPanel: React.FunctionComponent<{
  feature: MapFeature;
  eventBus: EventBus;
  map?: maplibregl.Map;
}> = (props) => {
  return (
    <PanelShell onClose={() => props.eventBus.hideInfo()}>
      <Info
        feature={props.feature}
        eventBus={props.eventBus}
        embedded
        map={props.map}
      />
    </PanelShell>
  );
};
