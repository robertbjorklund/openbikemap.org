import { Box, Typography } from "@mui/material";

import type * as maplibregl from "maplibre-gl";

import * as React from "react";

import { ROUTE_NETWORK_LABELS, RouteNetwork } from "../types/RouteNetwork";

import type { RouteFeature } from "../types/FeatureTypes";

import { getSegmentCount } from "../utils/FeatureGroup";

import { formatLength, getFeatureLengthMeters } from "../utils/Length";

import { CardHeader } from "./CardHeader";

import { ElevationStats } from "./ElevationStats";

import EventBus from "./EventBus";

import {
  InfoFeatureHeader,
  TITLE_ICON_SIZE,
} from "./InfoFeatureHeader";
import { RouteNetworkLegendIcon } from "./RouteNetworkLegendIcon";

import { InfoPanelActions } from "./InfoPanelActions";

import { ScrollableCard } from "./ScrollableCard";

import { SourceSummary } from "./SourceSummary";

import { useUnitSystem } from "./UnitSystemManager";



function RouteInfoBody({

  feature,

  showTitle = true,

  showPanelActions = false,

  map,

}: {

  feature: RouteFeature;

  showTitle?: boolean;

  showPanelActions?: boolean;

  map?: maplibregl.Map;

}) {

  const { properties } = feature;

  const title = properties.name || properties.ref || "Bicycle route";

  const networkLabel =

    properties.network &&

    (ROUTE_NETWORK_LABELS[properties.network as RouteNetwork] ??

      properties.network);

  const subtitle = networkLabel

    ? `Bicycle route · ${networkLabel}`

    : "Bicycle route";

  const segmentCount = getSegmentCount(feature);

  const unitSystem = useUnitSystem();

  const length = formatLength(getFeatureLengthMeters(feature), unitSystem);



  return (

    <>

      {showTitle && (

        <InfoFeatureHeader
          title={title}
          subtitle={subtitle}
          icon={
            <RouteNetworkLegendIcon
              network={properties.network}
              size={TITLE_ICON_SIZE}
            />
          }
        />

      )}

      {properties.ref && properties.name && (

        <Typography color="text.secondary" gutterBottom>

          Ref: {properties.ref}

        </Typography>

      )}

      {length && <Typography gutterBottom>Length: {length}</Typography>}

      {properties.pavedRatio !== null && (

        <Typography variant="body2" gutterBottom>

          Surface: {Math.round(properties.pavedRatio * 100)}% paved

        </Typography>

      )}

      {properties.distance && (

        <Typography variant="body2">Distance: {properties.distance}</Typography>

      )}

      {properties.roundtrip !== null && (

        <Typography variant="body2">

          Roundtrip: {properties.roundtrip ? "Yes" : "No"}

        </Typography>

      )}



      <ElevationStats feature={feature} map={map} />



      {showPanelActions && (

        <Box sx={{ mt: 2, mb: 1 }}>

          <InfoPanelActions feature={feature} />

        </Box>

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

  width?: number;

  embedded?: boolean;

  map?: maplibregl.Map;

}> = (props) => {

  if (props.embedded) {

    return (

      <RouteInfoBody

        feature={props.feature}

        showPanelActions

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

        showPanelActions

        map={props.map}

      />

    </ScrollableCard>

  );

};


