import DownloadIcon from "@mui/icons-material/Download";
import { Button } from "@mui/material";
import * as React from "react";
import type { MapFeature } from "../types/FeatureTypes";
import {
  canExportFeatureGpx,
  downloadFeatureGpx,
} from "../utils/GpxExporter";
import { ctaButtonSx } from "../uiTheme";

export const GpxDownloadButton: React.FunctionComponent<{
  feature: MapFeature;
}> = (props) => {
  const canDownload = canExportFeatureGpx(props.feature);

  return (
    <Button
      startIcon={<DownloadIcon />}
      disabled={!canDownload}
      onClick={() => downloadFeatureGpx(props.feature)}
      sx={ctaButtonSx}
    >
      Download GPX
    </Button>
  );
};
