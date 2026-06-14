import type * as maplibregl from "maplibre-gl";
import * as React from "react";
import {
  toMtbImbaScaleFilter,
  toMtbScaleFilter,
} from "../types/BikeActivity";
import { formatRouteDisplayTitle } from "../types/RouteNetwork";
import {
  FeatureType,
  TrailCategory,
  TRAIL_CATEGORY_LABELS,
  type MapFeature,
  type RouteFeature,
  type TrailFeature,
} from "../types/FeatureTypes";
import EventBus from "./EventBus";
import type { RouteGroupSelection } from "./SelectedObject";
import { Info } from "./Info";
import { MtbImbaLegendIcon } from "./MtbImbaLegendIcon";
import { MtbScaleLegendIcon } from "./MtbScaleLegendIcon";
import { PanelShell } from "./PanelShell";
import { RouteNetworkLegendIcon } from "./RouteNetworkLegendIcon";

const PANEL_TITLE_ICON_SIZE = 32;

function featurePanelTitle(feature: MapFeature): string {
  const { properties } = feature;
  if (properties.type === FeatureType.Trail) {
    return (
      properties.name ||
      properties.ref ||
      TRAIL_CATEGORY_LABELS[properties.category]
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
  map?: maplibregl.Map;
}> = (props) => {
  return (
    <PanelShell
      title={featurePanelTitle(props.feature)}
      titleIcon={featurePanelTitleIcon(props.feature)}
      onClose={() => props.eventBus.hideInfo()}
    >
      <Info
        feature={props.feature}
        routeGroup={props.routeGroup}
        eventBus={props.eventBus}
        embedded
        showFeatureTitle={false}
        map={props.map}
      />
    </PanelShell>
  );
};
