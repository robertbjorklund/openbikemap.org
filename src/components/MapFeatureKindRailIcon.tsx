import { Box } from "@mui/material";
import * as React from "react";
import type { MapFeatureKind } from "../utils/MapFeatureKind";
import { BicycleRouteRailIcon } from "./icons/BicycleRouteRailIcon";
import { ImbaRailIcon } from "./icons/ImbaRailIcon";
import { StsRailIcon } from "./icons/StsRailIcon";

const RAIL_ICON_BASE_SIZE = 26;

export const MapFeatureKindRailIcon: React.FunctionComponent<{
  kind: MapFeatureKind;
  size?: number;
}> = ({ kind, size = 22 }) => {
  const scale = size / RAIL_ICON_BASE_SIZE;
  const icon =
    kind === "bicycle-route" ? (
      <BicycleRouteRailIcon />
    ) : kind === "imba" ? (
      <ImbaRailIcon />
    ) : (
      <StsRailIcon />
    );

  return (
    <Box
      aria-hidden
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "visible",
        color: "inherit",
        lineHeight: 0,
        "& > *": {
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        },
      }}
    >
      {icon}
    </Box>
  );
};
