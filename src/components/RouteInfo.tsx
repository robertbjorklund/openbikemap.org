import { Box, Divider, Link, Typography } from "@mui/material";

import type * as maplibregl from "maplibre-gl";

import * as React from "react";

import { ROUTE_NETWORK_LABELS, RouteNetwork, formatRouteDisplayTitle } from "../types/RouteNetwork";

import type { RouteFeature } from "../types/FeatureTypes";

import { getSegmentCount } from "../utils/FeatureGroup";

import { formatLength, getFeatureLengthMeters } from "../utils/Length";

import { formatRouteStageLabel } from "../utils/RouteStage";
import { getMapFeatureKind } from "../utils/MapFeatureKind";
import { CardHeader } from "./CardHeader";

import { ElevationStats } from "./ElevationStats";

import EventBus from "./EventBus";

import {
  InfoFeatureHeader,
  TITLE_ICON_SIZE,
} from "./InfoFeatureHeader";
import { RouteNetworkLegendIcon } from "./RouteNetworkLegendIcon";
import { MapFeatureKindRailIcon } from "./MapFeatureKindRailIcon";

import { InfoPanelActions } from "./InfoPanelActions";

import { ScrollableCard } from "./ScrollableCard";

import { SourceSummary } from "./SourceSummary";

import type { RouteGroupSelection } from "./SelectedObject";

import { useUnitSystem } from "./UnitSystemManager";



function RouteInfoBody({

  feature,

  routeGroup,

  eventBus,

  showTitle = true,

  showPanelActions = false,

  compactMobile = false,

  map,

}: {

  feature: RouteFeature;

  routeGroup?: RouteGroupSelection;

  eventBus?: EventBus;

  showTitle?: boolean;

  showPanelActions?: boolean;

  compactMobile?: boolean;

  map?: maplibregl.Map;

}) {

  const { properties } = feature;

  const title = formatRouteDisplayTitle(properties.name, properties.ref);

  const stageLabel = formatRouteStageLabel(properties);
  const isStageView = !!routeGroup?.activeStageId;
  const networkLabel =

    properties.network &&

    (ROUTE_NETWORK_LABELS[properties.network as RouteNetwork] ??

      properties.network);

  const featureKind = getMapFeatureKind(feature);
  const subtitle = isStageView && stageLabel
    ? stageLabel
    : networkLabel
      ? `${featureKind.label} · ${networkLabel}`
      : featureKind.label;
  const subtitleIcon = (
    <MapFeatureKindRailIcon kind={featureKind.kind} size={22} />
  );

  const segmentCount = getSegmentCount(feature);

  const unitSystem = useUnitSystem();

  const length = formatLength(getFeatureLengthMeters(feature), unitSystem);



  const networkIcon = (
    <RouteNetworkLegendIcon
      network={properties.network}
      label={properties.ref}
      name={properties.name}
      size={TITLE_ICON_SIZE}
    />
  );

  return (

    <>

      {!compactMobile &&
        (showTitle ? (
          <InfoFeatureHeader
            title={title}
            subtitle={subtitle}
            subtitleIcon={subtitleIcon}
            icon={networkIcon}
          />
        ) : (
          <InfoFeatureHeader
            subtitle={subtitle}
            subtitleIcon={subtitleIcon}
          />
        ))}

      {routeGroup && !routeGroup.activeStageId && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {routeGroup.stageFeatures.length} etapper · hover to preview, click to
          select one
        </Typography>
      )}

      {routeGroup?.activeStageId && (
        <Typography variant="body2" sx={{ mb: 1 }}>
          <Link
            component="button"
            variant="body2"
            onClick={() => eventBus?.showRouteGroupOverview()}
            sx={{ cursor: "pointer" }}
          >
            ← View whole route
          </Link>
        </Typography>
      )}

      {!compactMobile && <Divider sx={{ my: 1.5 }} />}

      {length && (
        <Typography variant="body2" gutterBottom sx={{ mb: compactMobile ? 0.25 : undefined }}>
          Length: {length}
        </Typography>
      )}

      {properties.pavedRatio !== null && (

        <Typography variant="body2" gutterBottom sx={{ mb: compactMobile ? 0.5 : undefined }}>

          Surface: {Math.round(properties.pavedRatio * 100)}% paved

        </Typography>

      )}

      {!compactMobile && properties.distance && (

        <Typography variant="body2">Distance: {properties.distance}</Typography>

      )}

      {!compactMobile && properties.roundtrip !== null && (

        <Typography variant="body2">

          Roundtrip: {properties.roundtrip ? "Yes" : "No"}

        </Typography>

      )}

      {!compactMobile && <ElevationStats feature={feature} map={map} />}

      {showPanelActions && (
        <>
          <Divider sx={{ my: compactMobile ? 1 : 1.5 }} />
          <Box sx={{ mb: compactMobile ? 0.5 : 1 }}>
            <InfoPanelActions feature={feature} />
          </Box>
        </>
      )}

      {compactMobile && <ElevationStats feature={feature} map={map} />}

      {compactMobile && properties.distance && (

        <Typography variant="body2">Distance: {properties.distance}</Typography>

      )}

      {compactMobile && properties.roundtrip !== null && (

        <Typography variant="body2">

          Roundtrip: {properties.roundtrip ? "Yes" : "No"}

        </Typography>

      )}

      {segmentCount > 1 && (

        <Typography variant="body2" color="text.secondary" gutterBottom>

          {segmentCount} connected segments on map

        </Typography>

      )}

      <SourceSummary sources={properties.sources} />

    </>

  );

}



export const RouteInfo: React.FunctionComponent<{

  feature: RouteFeature;

  eventBus: EventBus;

  routeGroup?: RouteGroupSelection;

  width?: number;

  embedded?: boolean;

  showFeatureTitle?: boolean;

  compactMobile?: boolean;

  map?: maplibregl.Map;

}> = (props) => {

  const showTitle = props.showFeatureTitle ?? true;

  if (props.embedded) {

    return (

      <RouteInfoBody

        feature={props.feature}

        routeGroup={props.routeGroup}

        eventBus={props.eventBus}

        showTitle={showTitle}

        showPanelActions

        compactMobile={props.compactMobile ?? false}

        map={props.map}

      />

    );

  }



  return (

    <ScrollableCard

      width={props.width}

      header={<CardHeader onClose={props.eventBus.hideInfo} />}

    >

      <RouteInfoBody

        feature={props.feature}

        routeGroup={props.routeGroup}

        eventBus={props.eventBus}

        showPanelActions

        map={props.map}

      />

    </ScrollableCard>

  );

};


