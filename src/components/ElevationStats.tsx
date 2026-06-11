import { Typography } from "@mui/material";
import type * as maplibregl from "maplibre-gl";
import * as React from "react";
import type { MapFeature } from "../types/FeatureTypes";
import { getFeatureElevationData } from "../utils/getFeatureElevationData";
import { HeightProfile } from "./HeightProfile";
import { useUnitSystem } from "./UnitSystemManager";
import { formattedSlope } from "./utils/formattedSlope";
import * as UnitHelpers from "./utils/UnitHelpers";

export const ElevationStats: React.FunctionComponent<{
  feature: MapFeature;
  map?: maplibregl.Map;
}> = ({ feature, map }) => {
  const unitSystem = useUnitSystem();
  const elevationData = React.useMemo(
    () => getFeatureElevationData(feature),
    [feature],
  );

  if (!elevationData) {
    return null;
  }

  const profile = feature.properties.elevationProfile;
  if (!profile || feature.geometry.type !== "LineString") {
    return null;
  }

  return (
    <>
      <Typography className="distance-and-elevation-info">
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
      </Typography>
      {(elevationData.averagePitchInPercent !== null ||
        elevationData.maxPitchInPercent !== null) && (
        <Typography className="distance-and-elevation-info">
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
        </Typography>
      )}
      <HeightProfile
        displayGeometry={feature.geometry as GeoJSON.LineString}
        profileGeometry={elevationData.profileGeometry}
        elevationData={elevationData}
        resolution={profile.resolution}
        map={map}
      />
    </>
  );
};
