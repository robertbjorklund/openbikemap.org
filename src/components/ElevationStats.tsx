import type * as maplibregl from "maplibre-gl";
import * as React from "react";
import type { MapFeature } from "../types/FeatureTypes";
import {
  featureSupportsElevationChart,
  getFeatureElevationData,
  getFeatureElevationDisplayLine,
} from "../utils/getFeatureElevationData";
import { FeatureDetailStat } from "./FeatureDetailStat";
import { HeightProfile } from "./HeightProfile";
import { useMobilePanelLayout } from "./useMobilePanelLayout";
import { useUnitSystem } from "./UnitSystemManager";
import { formattedSlope } from "./utils/formattedSlope";
import * as UnitHelpers from "./utils/UnitHelpers";

export const ElevationStats: React.FunctionComponent<{
  feature: MapFeature;
  map?: maplibregl.Map;
}> = ({ feature, map }) => {
  const unitSystem = useUnitSystem();
  const compactMobilePanel = useMobilePanelLayout();
  const elevationData = React.useMemo(
    () => getFeatureElevationData(feature),
    [feature],
  );

  if (!elevationData || !featureSupportsElevationChart(feature)) {
    return null;
  }

  const profile = feature.properties.elevationProfile;
  const displayLine = getFeatureElevationDisplayLine(feature);
  if (!profile || !displayLine) {
    return null;
  }

  return (
    <>
      <FeatureDetailStat className="feature-detail-stat-inline">
        {elevationData.inclinedLengthInMeters > 0 && (
          <span>
            Distance:{" "}
            {UnitHelpers.distanceText({
              distanceInMeters: elevationData.inclinedLengthInMeters,
              unitSystem,
            })}
          </span>
        )}
        {elevationData.ascentInMeters > 1 && (
          <span>
            Ascent:{" "}
            {UnitHelpers.heightText(elevationData.ascentInMeters, unitSystem)}
          </span>
        )}
        {elevationData.descentInMeters > 1 && (
          <span>
            Descent:{" "}
            {UnitHelpers.heightText(elevationData.descentInMeters, unitSystem)}
          </span>
        )}
      </FeatureDetailStat>
      {(elevationData.averagePitchInPercent !== null ||
        elevationData.maxPitchInPercent !== null) && (
        <FeatureDetailStat className="feature-detail-stat-inline">
          {elevationData.averagePitchInPercent !== null && (
            <span>
              Average slope:{" "}
              {formattedSlope(elevationData.averagePitchInPercent)}
            </span>
          )}
          {elevationData.maxPitchInPercent !== null && (
            <span>
              Max slope: {formattedSlope(elevationData.maxPitchInPercent)}
            </span>
          )}
        </FeatureDetailStat>
      )}
      <HeightProfile
        displayGeometry={displayLine}
        profileGeometry={elevationData.profileGeometry}
        elevationData={elevationData}
        resolution={profile.resolution}
        map={map}
        compact={compactMobilePanel}
      />
    </>
  );
};
