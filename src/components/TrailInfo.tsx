import { CardActions, Chip, Typography } from "@mui/material";
import * as React from "react";
import {
  MTB_SCALE_FILTER_LABELS,
  MTB_SCALE_LABELS,
  MTB_SCALE_NOT_SET,
} from "../types/BikeActivity";
import {
  FeatureType,
  TRAIL_CATEGORY_LABELS,
  type TrailFeature,
} from "../types/FeatureTypes";
import { getSegmentCount } from "../utils/FeatureGroup";
import { formatLength, getFeatureLengthMeters } from "../utils/Length";
import { CardHeader } from "./CardHeader";
import EventBus from "./EventBus";
import { GpxDownloadButton } from "./GpxDownloadButton";
import { ScrollableCard } from "./ScrollableCard";
import { SourceSummary } from "./SourceSummary";

function TrailInfoBody({
  feature,
  showTitle = true,
}: {
  feature: TrailFeature;
  showTitle?: boolean;
}) {
  const { properties } = feature;
  const title =
    properties.name || properties.ref || TRAIL_CATEGORY_LABELS[properties.category];
  const length = formatLength(getFeatureLengthMeters(feature));
  const segmentCount = getSegmentCount(feature);

  return (
    <>
      {showTitle && (
        <Typography gutterBottom variant="h5" component="h2">
          {title}
        </Typography>
      )}
      <Typography color="text.secondary" gutterBottom>
        {TRAIL_CATEGORY_LABELS[properties.category]}
      </Typography>

      {segmentCount > 1 && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {segmentCount} connected segments on map
        </Typography>
      )}
      {length && <Typography gutterBottom>Length: {length}</Typography>}
      {properties.type === FeatureType.Trail && (
        <Chip
          label={
            properties.mtbScale !== null
              ? (MTB_SCALE_LABELS[properties.mtbScale] ??
                `S${properties.mtbScale}`)
              : MTB_SCALE_FILTER_LABELS[MTB_SCALE_NOT_SET]
          }
          size="small"
          sx={{ mb: 1 }}
        />
      )}
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

      <SourceSummary sources={properties.sources} />
    </>
  );
}

export const TrailInfo: React.FunctionComponent<{
  feature: TrailFeature;
  eventBus: EventBus;
  width?: number;
  embedded?: boolean;
}> = (props) => {
  if (props.embedded) {
    return <TrailInfoBody feature={props.feature} showTitle={false} />;
  }

  return (
    <ScrollableCard
      width={props.width}
      header={<CardHeader onClose={props.eventBus.hideInfo} />}
      footer={
        <CardActions>
          <GpxDownloadButton feature={props.feature} />
        </CardActions>
      }
    >
      <TrailInfoBody feature={props.feature} />
    </ScrollableCard>
  );
};
