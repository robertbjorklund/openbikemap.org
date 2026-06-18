import type * as maplibregl from "maplibre-gl";
import { Box, Typography } from "@mui/material";
import * as React from "react";
import {
  toMtbImbaScaleFilter,
  toMtbScaleFilter,
} from "../types/BikeActivity";
import { formatRouteDisplayTitle } from "../types/RouteNetwork";
import {
  FeatureType,
  TrailCategory,
  type MapFeature,
  type RouteFeature,
  type TrailFeature,
} from "../types/FeatureTypes";
import { getDefaultFeatureTitle, getMapFeatureKind } from "../utils/MapFeatureKind";
import EventBus from "./EventBus";
import type { RouteGroupSelection } from "./SelectedObject";
import { Info } from "./Info";
import { MapFeatureKindRailIcon } from "./MapFeatureKindRailIcon";
import { MtbImbaLegendIcon } from "./MtbImbaLegendIcon";
import { MtbScaleLegendIcon } from "./MtbScaleLegendIcon";
import { PanelShell } from "./PanelShell";
import { OverflowScrollText } from "./OverflowScrollText";
import { MtbRouteLegendIcon } from "./MtbRouteLegendIcon";
import { RouteNetworkLegendIcon } from "./RouteNetworkLegendIcon";
import { useMobilePanelLayout } from "./useMobilePanelLayout";

const PANEL_TITLE_ICON_SIZE = 32;
const MOBILE_ROUTE_HEADER_ICON_SIZE = 26;
const MOBILE_ROUTE_SHIELD_SIZE = 28;

function featurePanelTitle(feature: MapFeature): string {
  const { properties } = feature;
  if (properties.type === FeatureType.Trail) {
    return (
      properties.name ||
      properties.ref ||
      getDefaultFeatureTitle(feature)
    );
  }
  return formatRouteDisplayTitle(properties.name, properties.ref);
}

function featurePanelTitleIcon(feature: MapFeature): React.ReactNode | undefined {
  const { properties } = feature;
  if (properties.type === FeatureType.Trail) {
    const trail = feature as TrailFeature;
    if (trail.properties.category !== TrailCategory.MtbTrail) {
      return undefined;
    }
    const isImbaTrail = trail.properties.mtbScaleImba !== null;
    const scale = isImbaTrail
      ? toMtbImbaScaleFilter(trail.properties.mtbScaleImba)
      : toMtbScaleFilter(trail.properties.mtbScale);
    return isImbaTrail ? (
      <MtbImbaLegendIcon
        scale={scale as ReturnType<typeof toMtbImbaScaleFilter>}
        size={PANEL_TITLE_ICON_SIZE}
      />
    ) : (
      <MtbScaleLegendIcon
        scale={scale as ReturnType<typeof toMtbScaleFilter>}
        size={PANEL_TITLE_ICON_SIZE}
      />
    );
  }

  const route = feature as RouteFeature;
  if (route.properties.osmRouteType === "mtb") {
    return (
      <MtbRouteLegendIcon
        osmColour={route.properties.osmColour}
        size={PANEL_TITLE_ICON_SIZE}
      />
    );
  }
  return (
    <RouteNetworkLegendIcon
      network={route.properties.network}
      label={route.properties.ref}
      name={route.properties.name}
      size={PANEL_TITLE_ICON_SIZE}
    />
  );
}

export const InfoPanel: React.FunctionComponent<{
  feature: MapFeature;
  routeGroup?: RouteGroupSelection;
  eventBus: EventBus;
  routeDetailsExpanded?: boolean;
  map?: maplibregl.Map;
}> = (props) => {
  const isMobile = useMobilePanelLayout();
  const compactMobilePanel = isMobile;
  const featureKind = getMapFeatureKind(props.feature);

  const headerCenter = compactMobilePanel ? (
    <Box
      className="route-mobile-header"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.75,
        flex: 1,
        minWidth: 0,
      }}
    >
      <MapFeatureKindRailIcon
        kind={featureKind.kind}
        size={MOBILE_ROUTE_HEADER_ICON_SIZE}
      />
      {props.feature.properties.type === FeatureType.Route &&
      (props.feature as RouteFeature).properties.osmRouteType === "mtb" ? (
        <MtbRouteLegendIcon
          osmColour={(props.feature as RouteFeature).properties.osmColour}
          size={MOBILE_ROUTE_SHIELD_SIZE}
        />
      ) : props.feature.properties.type === FeatureType.Route ? (
        <RouteNetworkLegendIcon
          network={(props.feature as RouteFeature).properties.network}
          label={(props.feature as RouteFeature).properties.ref}
          name={(props.feature as RouteFeature).properties.name}
          size={MOBILE_ROUTE_SHIELD_SIZE}
        />
      ) : (
        featurePanelTitleIcon(props.feature)
      )}
      <Typography
        variant="subtitle1"
        component="h2"
        sx={{ fontWeight: 600, flex: 1, minWidth: 0, mb: 0, overflow: "hidden" }}
      >
        <OverflowScrollText autoScroll>
          {featurePanelTitle(props.feature)}
        </OverflowScrollText>
      </Typography>
    </Box>
  ) : undefined;

  const routeDetailsExpanded = props.routeDetailsExpanded ?? true;

  return (
    <PanelShell
      title={compactMobilePanel ? undefined : featurePanelTitle(props.feature)}
      titleIcon={
        compactMobilePanel ? undefined : featurePanelTitleIcon(props.feature)
      }
      headerCenter={headerCenter}
      hideFeatureTitleSection={compactMobilePanel}
      useCollapseDownIcon={compactMobilePanel}
      sheetCollapsed={compactMobilePanel && !routeDetailsExpanded}
      onBack={() => {
        if (compactMobilePanel && !routeDetailsExpanded) {
          props.eventBus.openRoute();
        } else {
          props.eventBus.collapseInfoPanel();
        }
      }}
      onClose={() => props.eventBus.hideInfo()}
    >
      <Info
        feature={props.feature}
        routeGroup={props.routeGroup}
        eventBus={props.eventBus}
        embedded
        showFeatureTitle={false}
        compactMobile={compactMobilePanel}
        map={props.map}
      />
    </PanelShell>
  );
};
