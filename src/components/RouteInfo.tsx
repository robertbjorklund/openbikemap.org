import { CardActions, Typography } from "@mui/material";
import * as React from "react";
import { ROUTE_NETWORK_LABELS, RouteNetwork } from "../types/RouteNetwork";
import type { RouteFeature } from "../types/FeatureTypes";
import { getSegmentCount } from "../utils/FeatureGroup";
import { formatLength, getFeatureLengthMeters } from "../utils/Length";
import { CardHeader } from "./CardHeader";
import EventBus from "./EventBus";
import { GpxDownloadButton } from "./GpxDownloadButton";
import { ScrollableCard } from "./ScrollableCard";
import { SourceSummary } from "./SourceSummary";

function RouteInfoBody({
  feature,
  showTitle = true,
}: {
  feature: RouteFeature;
  showTitle?: boolean;
}) {
  const { properties } = feature;
  const title = properties.name || properties.ref || "Bicycle route";
  const networkLabel =
    properties.network &&
    (ROUTE_NETWORK_LABELS[properties.network as RouteNetwork] ??
      properties.network);
  const segmentCount = getSegmentCount(feature);
  const length = formatLength(getFeatureLengthMeters(feature));

  return (
    <>
      {showTitle && (
        <Typography gutterBottom variant="h5" component="h2">
          {title}
        </Typography>
      )}
      {properties.ref && properties.name && (
        <Typography color="text.secondary" gutterBottom>
          Ref: {properties.ref}
        </Typography>
      )}
      {networkLabel && (
        <Typography gutterBottom>Bicycle route · {networkLabel}</Typography>
      )}
      {segmentCount > 1 && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {segmentCount} connected segments on map
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

      <SourceSummary sources={properties.sources} />
    </>
  );
}

export const RouteInfo: React.FunctionComponent<{
  feature: RouteFeature;
  eventBus: EventBus;
  width?: number;
  embedded?: boolean;
}> = (props) => {
  if (props.embedded) {
    return <RouteInfoBody feature={props.feature} showTitle={false} />;
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
      <RouteInfoBody feature={props.feature} />
    </ScrollableCard>
  );
};
