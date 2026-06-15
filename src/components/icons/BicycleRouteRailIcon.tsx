import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import { Box } from "@mui/material";
import * as React from "react";

const RAIL_SIZE = 26;
const BIKE_SIZE = 26;

export const BicycleRouteRailIcon: React.FunctionComponent = () => (
  <Box
    aria-hidden
    sx={{
      width: RAIL_SIZE,
      minHeight: RAIL_SIZE,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      color: "inherit",
      lineHeight: 0,
    }}
  >
    <DirectionsBikeIcon
      sx={{
        fontSize: BIKE_SIZE,
        display: "block",
        "& path": {
          stroke: "currentColor",
          strokeWidth: 0.35,
          strokeLinejoin: "round",
        },
      }}
    />
  </Box>
);
