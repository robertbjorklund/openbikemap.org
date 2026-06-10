import DownloadIcon from "@mui/icons-material/Download";
import { Button } from "@mui/material";
import * as React from "react";
import type { MapFeature } from "../types/FeatureTypes";
import {
  canExportFeatureGpx,
  downloadFeatureGpx,
} from "../utils/GpxExporter";

export const GpxDownloadButton: React.FunctionComponent<{
  feature: MapFeature;
}> = (props) => {
  const canDownload = canExportFeatureGpx(props.feature);

  return (
    <Button
      startIcon={<DownloadIcon />}
      disabled={!canDownload}
      onClick={() => downloadFeatureGpx(props.feature)}
      size="small"
      variant="outlined"
    >
      Download GPX
    </Button>
  );
};
