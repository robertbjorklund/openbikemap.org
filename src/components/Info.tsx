import * as React from "react";
import {
  FeatureType,
  type MapFeature,
  type RouteFeature,
  type TrailFeature,
} from "../types/FeatureTypes";
import EventBus from "./EventBus";
import { RouteInfo } from "./RouteInfo";
import { TrailInfo } from "./TrailInfo";

export const Info: React.FunctionComponent<{
  feature: MapFeature;
  eventBus: EventBus;
  width?: number;
  embedded?: boolean;
}> = (props) => {
  const { feature } = props;

  if (feature.properties.type === FeatureType.Trail) {
    return (
      <TrailInfo
        feature={feature as TrailFeature}
        eventBus={props.eventBus}
        width={props.width}
        embedded={props.embedded}
      />
    );
  }

  return (
    <RouteInfo
      feature={feature as RouteFeature}
      eventBus={props.eventBus}
      width={props.width}
      embedded={props.embedded}
    />
  );
};
