import { Box, Typography } from "@mui/material";

import type * as maplibregl from "maplibre-gl";

import * as React from "react";

import {

  IMBA_SCALE_FILTER_LABELS,

  MTB_SCALE_FILTER_LABELS,

  toMtbImbaScaleFilter,

  toMtbScaleFilter,

} from "../types/BikeActivity";

import {

  TrailCategory,

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

import { MtbImbaLegendIcon } from "./MtbImbaLegendIcon";

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

  const isMtbTrail = properties.category === TrailCategory.MtbTrail;

  const isImbaTrail = properties.mtbScaleImba !== null;

  const scale = isImbaTrail

    ? toMtbImbaScaleFilter(properties.mtbScaleImba)

    : toMtbScaleFilter(properties.mtbScale);

  const scaleLabel = isImbaTrail

    ? IMBA_SCALE_FILTER_LABELS[scale as ReturnType<typeof toMtbImbaScaleFilter>]

    : MTB_SCALE_FILTER_LABELS[scale as ReturnType<typeof toMtbScaleFilter>];

  const ratingSystemLabel = isImbaTrail

    ? "IMBA — International Mountain Bicycling Association"

    : "STS — Single Track Scale";

  const subtitle = TRAIL_CATEGORY_LABELS[properties.category];

  const difficultyIcon = isMtbTrail ? (

    isImbaTrail ? (

      <MtbImbaLegendIcon

        scale={scale as ReturnType<typeof toMtbImbaScaleFilter>}

        size={TITLE_ICON_SIZE}

      />

    ) : (

      <MtbScaleLegendIcon

        scale={scale as ReturnType<typeof toMtbScaleFilter>}

        size={TITLE_ICON_SIZE}

      />

    )

  ) : undefined;



  return (

    <>

      {showTitle && (

        <InfoFeatureHeader

          title={title}

          subtitle={subtitle}

          icon={difficultyIcon}

        />

      )}

      {!showTitle && subtitle && (

        <InfoFeatureHeader subtitle={subtitle} />

      )}

      {isMtbTrail && (

        <Box sx={{ mb: 1.5 }}>

          <Typography variant="body2" fontWeight={500}>

            {ratingSystemLabel}

          </Typography>

          <Typography variant="body2" color="text.secondary">

            {scaleLabel}

          </Typography>

        </Box>

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

  showFeatureTitle?: boolean;

  map?: maplibregl.Map;

}> = (props) => {

  const showTitle = props.showFeatureTitle ?? true;

  if (props.embedded) {

    return (

      <TrailInfoBody

        feature={props.feature}

        showTitle={showTitle}

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


