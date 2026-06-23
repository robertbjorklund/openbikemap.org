import { Box, Divider, Typography } from "@mui/material";

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

  type TrailFeature,

} from "../types/FeatureTypes";

import { getDefaultFeatureTitle, getMapFeatureKind } from "../utils/MapFeatureKind";
import { getSegmentCount } from "../utils/FeatureGroup";
import { formatLength, getFeatureLengthMeters } from "../utils/Length";
import { FeatureDetailStat } from "./FeatureDetailStat";
import { CardHeader } from "./CardHeader";
import { ElevationStats } from "./ElevationStats";
import EventBus from "./EventBus";
import {
  InfoFeatureHeader,
  TITLE_ICON_SIZE,
} from "./InfoFeatureHeader";
import { InfoPanelActions } from "./InfoPanelActions";
import { MapFeatureKindRailIcon } from "./MapFeatureKindRailIcon";

import { MtbImbaLegendIcon } from "./MtbImbaLegendIcon";

import { MtbScaleLegendIcon } from "./MtbScaleLegendIcon";

import { ScrollableCard } from "./ScrollableCard";

import { SourceSummary } from "./SourceSummary";

import { FeatureWeather } from "./FeatureWeather";

import { useUnitSystem } from "./UnitSystemManager";



function TrailInfoBody({

  feature,

  showTitle = true,

  showPanelActions = false,

  compactMobile = false,

  map,

  weatherEnabled = true,

}: {

  feature: TrailFeature;

  showTitle?: boolean;

  showPanelActions?: boolean;

  compactMobile?: boolean;

  map?: maplibregl.Map;

  weatherEnabled?: boolean;

}) {

  const { properties } = feature;

  const unitSystem = useUnitSystem();

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

  const featureKind = getMapFeatureKind(feature);
  const title =
    properties.name || properties.ref || getDefaultFeatureTitle(feature);

  const length = formatLength(getFeatureLengthMeters(feature), unitSystem);

  const segmentCount = getSegmentCount(feature);

  const subtitle = featureKind.label;
  const subtitleIcon = (
    <MapFeatureKindRailIcon kind={featureKind.kind} size={22} />
  );

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

      {!compactMobile &&
        (showTitle ? (
          <InfoFeatureHeader
            title={title}
            subtitle={subtitle}
            subtitleIcon={subtitleIcon}
            icon={difficultyIcon}
          />
        ) : (
          subtitle && (
            <InfoFeatureHeader
              subtitle={subtitle}
              subtitleIcon={subtitleIcon}
            />
          )
        ))}

      {isMtbTrail && !compactMobile && (

        <Box sx={{ mb: 1.5 }}>

          <Typography variant="body2" fontWeight={500}>

            {ratingSystemLabel}

          </Typography>

          <Typography variant="body2" color="text.secondary">

            {scaleLabel}

          </Typography>

        </Box>

      )}

      {isMtbTrail && compactMobile && (

        <Typography variant="body2" gutterBottom sx={{ mb: 0.5 }}>

          {scaleLabel}

        </Typography>

      )}

      {!compactMobile && <Divider sx={{ my: 1.5 }} />}

      {length && <FeatureDetailStat>Length: {length}</FeatureDetailStat>}

      {!compactMobile && properties.surface && (
        <FeatureDetailStat>Surface: {properties.surface}</FeatureDetailStat>
      )}

      {!compactMobile && properties.lit !== null && (
        <FeatureDetailStat>Lit: {properties.lit ? "Yes" : "No"}</FeatureDetailStat>
      )}

      {!compactMobile && properties.network && (
        <FeatureDetailStat>Network: {properties.network}</FeatureDetailStat>
      )}

      {!compactMobile && (
        <FeatureWeather
          feature={feature}
          compact={false}
          enabled={weatherEnabled}
        />
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

      {compactMobile && (
        <FeatureWeather feature={feature} compact enabled={weatherEnabled} />
      )}

      {compactMobile && <ElevationStats feature={feature} map={map} />}

      {compactMobile && properties.surface && (
        <FeatureDetailStat>Surface: {properties.surface}</FeatureDetailStat>
      )}

      {compactMobile && properties.lit !== null && (
        <FeatureDetailStat>Lit: {properties.lit ? "Yes" : "No"}</FeatureDetailStat>
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

  compactMobile?: boolean;

  map?: maplibregl.Map;

  weatherEnabled?: boolean;

}> = (props) => {

  const showTitle = props.showFeatureTitle ?? true;

  if (props.embedded) {

    return (

      <TrailInfoBody

        feature={props.feature}

        showTitle={showTitle}

        showPanelActions

        compactMobile={props.compactMobile ?? false}

        map={props.map}

        weatherEnabled={props.weatherEnabled ?? true}

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


