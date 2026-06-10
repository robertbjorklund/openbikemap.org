import * as React from "react";
import type { MapFeature } from "../types/FeatureTypes";
import EventBus from "./EventBus";
import { Info } from "./Info";
import { InfoPanelActions } from "./InfoPanelActions";
import { PanelShell } from "./PanelShell";

function infoTitle(feature: MapFeature): string {
  const { properties } = feature;
  if (properties.type === "route") {
    return properties.name || properties.ref || "Bicycle route";
  }
  return properties.name || properties.ref || "Trail";
}

export const InfoPanel: React.FunctionComponent<{
  feature: MapFeature;
  eventBus: EventBus;
}> = (props) => {
  return (
    <PanelShell
      title={infoTitle(props.feature)}
      onBack={() => props.eventBus.backToMenu()}
      actions={<InfoPanelActions feature={props.feature} />}
    >
      <Info feature={props.feature} eventBus={props.eventBus} embedded />
    </PanelShell>
  );
};
