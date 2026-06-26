import { Box, Divider, Link, Typography } from "@mui/material";

import type * as maplibregl from "maplibre-gl";

import * as React from "react";

import { ROUTE_NETWORK_LABELS, RouteNetwork, formatRouteDisplayTitle } from "../types/RouteNetwork";
import { formatOsmColourLabel } from "../types/MtbRouteColors";

import type { RouteFeature } from "../types/FeatureTypes";

import { getSegmentCount } from "../utils/FeatureGroup";

import { formatLength, getFeatureLengthMeters } from "../utils/Length";

import { parseRouteDisplayName } from "../utils/RouteDisplayName";
import { formatRouteStageLabel } from "../utils/RouteStage";
import {
  inferSverigeledenSectionLabel,
} from "../utils/SverigeledenSection";
import { getMapFeatureKind } from "../utils/MapFeatureKind";
import { FeatureDetailStat } from "./FeatureDetailStat";
import { CardHeader } from "./CardHeader";

import { ElevationStats } from "./ElevationStats";

import EventBus from "./EventBus";

import {
  InfoFeatureHeader,
  TITLE_ICON_SIZE,
} from "./InfoFeatureHeader";
import { RouteNetworkLegendIcon } from "./RouteNetworkLegendIcon";
import { MtbRouteLegendIcon } from "./MtbRouteLegendIcon";
import { MapFeatureKindRailIcon } from "./MapFeatureKindRailIcon";

import { InfoPanelActions } from "./InfoPanelActions";

import { ScrollableCard } from "./ScrollableCard";

import { SourceSummary } from "./SourceSummary";

import { FeatureWeather } from "./FeatureWeather";

import { RouteStageList } from "./RouteStageList";

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

  weatherEnabled = true,

}: {

  feature: RouteFeature;

  routeGroup?: RouteGroupSelection;

  eventBus?: EventBus;

  showTitle?: boolean;

  showPanelActions?: boolean;

  compactMobile?: boolean;

  map?: maplibregl.Map;

  weatherEnabled?: boolean;

}) {

  const { properties } = feature;

  const title =
    routeGroup && !routeGroup.activeStageId
      ? inferSverigeledenSectionLabel(
          routeGroup.stageFeatures.map((stage) => stage.properties),
          parseRouteDisplayName,
        ) ??
        formatRouteDisplayTitle(properties.name, properties.ref)
      : formatRouteDisplayTitle(properties.name, properties.ref);

  const stageLabel = formatRouteStageLabel(properties);
  const isStageView = !!routeGroup?.activeStageId;
  const isMtbRoute = properties.osmRouteType === "mtb";
  const networkLabel =

    properties.network &&

    (ROUTE_NETWORK_LABELS[properties.network as RouteNetwork] ??

      properties.network);
  const colourLabel = formatOsmColourLabel(properties.osmColour);
  const featureKind = getMapFeatureKind(feature);
  const subtitle = isStageView && stageLabel
    ? stageLabel
    : isMtbRoute
      ? colourLabel
        ? `${featureKind.label} · ${colourLabel}`
        : featureKind.label
      : networkLabel
        ? `${featureKind.label} · ${networkLabel}`
        : featureKind.label;
  const subtitleIcon = (
    <MapFeatureKindRailIcon kind={featureKind.kind} size={22} />
  );

  const segmentCount = getSegmentCount(feature);

  const unitSystem = useUnitSystem();

  const length = formatLength(getFeatureLengthMeters(feature), unitSystem);



  const routeIcon = isMtbRoute ? (
    <MtbRouteLegendIcon
      osmColour={properties.osmColour}
      size={TITLE_ICON_SIZE}
    />
  ) : (
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
            icon={routeIcon}
          />
        ) : (
          <InfoFeatureHeader
            subtitle={subtitle}
            subtitleIcon={subtitleIcon}
          />
        ))}

      {routeGroup && !routeGroup.activeStageId && eventBus && (
        <RouteStageList routeGroup={routeGroup} eventBus={eventBus} />
      )}

      {routeGroup?.activeStageId && (
        <Typography variant="body2" sx={{ mb: 1 }}>
          <Link
            component="button"
            variant="body2"
            onClick={() => eventBus?.showRouteGroupOverview()}
            sx={{ cursor: "pointer" }}
          >
            ← Route overview
          </Link>
        </Typography>
      )}

      {!compactMobile && <Divider sx={{ my: 1.5 }} />}

      {length && <FeatureDetailStat>Length: {length}</FeatureDetailStat>}

      {properties.pavedRatio !== null && (
        <FeatureDetailStat>
          Surface: {Math.round(properties.pavedRatio * 100)}% paved
        </FeatureDetailStat>
      )}

      {!compactMobile && properties.distance && (
        <FeatureDetailStat>Distance: {properties.distance}</FeatureDetailStat>
      )}

      {!compactMobile && properties.roundtrip !== null && (
        <FeatureDetailStat>
          Roundtrip: {properties.roundtrip ? "Yes" : "No"}
        </FeatureDetailStat>
      )}

      {!compactMobile && !(routeGroup && !routeGroup.activeStageId) && (
        <ElevationStats feature={feature} map={map} />
      )}

      {!compactMobile && (
        <FeatureWeather
          feature={feature}
          routeGroup={routeGroup}
          compact={false}
          enabled={weatherEnabled}
        />
      )}

      {showPanelActions && (
        <>
          <Divider sx={{ my: compactMobile ? 1 : 1.5 }} />
          <Box sx={{ mb: compactMobile ? 0.5 : 1 }}>
            <InfoPanelActions feature={feature} />
          </Box>
        </>
      )}

      {compactMobile && <ElevationStats feature={feature} map={map} />}

      {compactMobile && (
        <FeatureWeather
          feature={feature}
          routeGroup={routeGroup}
          compact
          enabled={weatherEnabled}
        />
      )}

      {compactMobile && properties.distance && (
        <FeatureDetailStat>Distance: {properties.distance}</FeatureDetailStat>
      )}

      {compactMobile && properties.roundtrip !== null && (
        <FeatureDetailStat>
          Roundtrip: {properties.roundtrip ? "Yes" : "No"}
        </FeatureDetailStat>
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

  weatherEnabled?: boolean;

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

        weatherEnabled={props.weatherEnabled ?? true}

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


