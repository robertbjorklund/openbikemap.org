import { Typography } from "@mui/material";
import type * as maplibregl from "maplibre-gl";
import * as React from "react";
import type { MapFeature } from "../types/FeatureTypes";
import EventBus from "./EventBus";
import { InfoPanel } from "./InfoPanel";
import { PanelShell } from "./PanelShell";

export const RoutePanel: React.FunctionComponent<{
  feature: MapFeature | null;
  eventBus: EventBus;
  map?: maplibregl.Map;
}> = (props) => {
  if (!props.feature) {
    return (
      <PanelShell
        title="Route"
        onClose={() => props.eventBus.closeRoutePanel()}
      >
        <Typography variant="body2" color="text.secondary">
          No route or trail is selected on the map. Click a trail or bicycle
          route on the map to view its details here.
        </Typography>
      </PanelShell>
    );
  }

  return (
    <InfoPanel
      feature={props.feature}
      eventBus={props.eventBus}
      map={props.map}
    />
  );
};
