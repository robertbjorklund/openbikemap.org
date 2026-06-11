import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import { Box } from "@mui/material";
import * as React from "react";
import { FeatureType, type MapFeature } from "../types/FeatureTypes";
import {
  canExportFeatureGpx,
  downloadFeatureGpx,
} from "../utils/GpxExporter";
import { osmEditUrlForFeature } from "../utils/OsmUrls";
import { FeatureShareMenu } from "./FeatureShareMenu";
import { PanelActionButton } from "./PanelActionButton";

function featureTitle(feature: MapFeature): string {
  const { properties } = feature;
  return properties.name || properties.ref || properties.id;
}

export const InfoPanelActions: React.FunctionComponent<{
  feature: MapFeature;
}> = (props) => {
  const { feature } = props;
  const canDownload = canExportFeatureGpx(feature);
  const isRoute = feature.properties.type === FeatureType.Route;
  const osmEditUrl = isRoute
    ? osmEditUrlForFeature(feature.properties.sources, feature.geometry)
    : null;

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 1,
        py: 0.5,
      }}
    >
      <PanelActionButton
        label="Download GPX"
        icon={<DownloadIcon />}
        disabled={!canDownload}
        onClick={() => downloadFeatureGpx(feature)}
      />
      <FeatureShareMenu
        objectId={feature.properties.id}
        title={featureTitle(feature)}
      />
      {osmEditUrl && (
        <PanelActionButton
          label="Edit route"
          icon={<EditIcon />}
          href={osmEditUrl}
        />
      )}
    </Box>
  );
};
