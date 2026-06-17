import type * as maplibregl from "maplibre-gl";
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

import type { RouteGroupSelection } from "./SelectedObject";

export const Info: React.FunctionComponent<{
  feature: MapFeature;
  eventBus: EventBus;
  routeGroup?: RouteGroupSelection;
  width?: number;
  embedded?: boolean;
  showFeatureTitle?: boolean;
  compactMobile?: boolean;
  map?: maplibregl.Map;
}> = (props) => {
  const { feature } = props;
  const showFeatureTitle = props.showFeatureTitle ?? true;
  const compactMobile = props.compactMobile ?? false;

  if (feature.properties.type === FeatureType.Trail) {
    return (
      <TrailInfo
        feature={feature as TrailFeature}
        eventBus={props.eventBus}
        width={props.width}
        embedded={props.embedded}
        showFeatureTitle={showFeatureTitle}
        compactMobile={compactMobile}
        map={props.map}
      />
    );
  }

  return (
    <RouteInfo
      feature={feature as RouteFeature}
      eventBus={props.eventBus}
      routeGroup={props.routeGroup}
      width={props.width}
      embedded={props.embedded}
      showFeatureTitle={showFeatureTitle}
      compactMobile={compactMobile}
      map={props.map}
    />
  );
};
