import { Box, Typography } from "@mui/material";

import type * as maplibregl from "maplibre-gl";

import * as React from "react";

import {

  MTB_SCALE_FILTER_LABELS,

  toMtbScaleFilter,

} from "../types/BikeActivity";

import {

  FeatureType,

  TRAIL_CATEGORY_LABELS,

  type TrailFeature,

} from "../types/FeatureTypes";

import { getSegmentCount } from "../utils/FeatureGroup";

import { formatLength, getFeatureLengthMeters } from "../utils/Length";

import { CardHeader } from "./CardHeader";

import { ElevationStats } from "./ElevationStats";

import EventBus from "./EventBus";

import {

  InfoFeatureHeader,

  TITLE_ICON_SIZE,

} from "./InfoFeatureHeader";

import { InfoPanelActions } from "./InfoPanelActions";

import { MtbScaleLegendIcon } from "./MtbScaleLegendIcon";

import { ScrollableCard } from "./ScrollableCard";

import { SourceSummary } from "./SourceSummary";

import { useUnitSystem } from "./UnitSystemManager";



function TrailInfoBody({

  feature,

  showTitle = true,

  showPanelActions = false,

  map,

}: {

  feature: TrailFeature;

  showTitle?: boolean;

  showPanelActions?: boolean;

  map?: maplibregl.Map;

}) {

  const { properties } = feature;

  const unitSystem = useUnitSystem();

  const title =

    properties.name || properties.ref || TRAIL_CATEGORY_LABELS[properties.category];

  const length = formatLength(getFeatureLengthMeters(feature), unitSystem);

  const segmentCount = getSegmentCount(feature);

  const scale = toMtbScaleFilter(properties.mtbScale);

  const subtitle = `${TRAIL_CATEGORY_LABELS[properties.category]} · ${MTB_SCALE_FILTER_LABELS[scale]}`;



  return (

    <>

      {showTitle && (

        <InfoFeatureHeader

          title={title}

          subtitle={subtitle}

          icon={

            properties.type === FeatureType.Trail ? (

              <MtbScaleLegendIcon scale={scale} size={TITLE_ICON_SIZE} />

            ) : undefined

          }

        />

      )}



      {length && <Typography gutterBottom>Length: {length}</Typography>}

      {properties.surface && (

        <Typography variant="body2">Surface: {properties.surface}</Typography>

      )}

      {properties.lit !== null && (

        <Typography variant="body2">

          Lit: {properties.lit ? "Yes" : "No"}

        </Typography>

      )}

      {properties.network && (

        <Typography variant="body2">Network: {properties.network}</Typography>

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



export const TrailInfo: React.FunctionComponent<{

  feature: TrailFeature;

  eventBus: EventBus;

  width?: number;

  embedded?: boolean;

  map?: maplibregl.Map;

}> = (props) => {

  if (props.embedded) {

    return (

      <TrailInfoBody

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

      <TrailInfoBody

        feature={props.feature}

        showPanelActions

        map={props.map}

      />

    </ScrollableCard>

  );

};


