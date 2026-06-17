import { Typography } from "@mui/material";
import type * as maplibregl from "maplibre-gl";
import * as React from "react";
import type { MapFeature } from "../types/FeatureTypes";
import EventBus from "./EventBus";
import type { RouteGroupSelection } from "./SelectedObject";
import { InfoPanel } from "./InfoPanel";
import { PanelShell } from "./PanelShell";
import { useMobilePanelLayout } from "./useMobilePanelLayout";

export const RoutePanel: React.FunctionComponent<{
  feature: MapFeature | null;
  routeGroup?: RouteGroupSelection;
  eventBus: EventBus;
  routeDetailsExpanded?: boolean;
  map?: maplibregl.Map;
}> = (props) => {
  const isMobile = useMobilePanelLayout();

  if (!props.feature) {
    return (
      <PanelShell
        title="Route"
        showBack={false}
        useCollapseDownIcon={isMobile}
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
      routeGroup={props.routeGroup}
      eventBus={props.eventBus}
      routeDetailsExpanded={props.routeDetailsExpanded}
      map={props.map}
    />
  );
};
