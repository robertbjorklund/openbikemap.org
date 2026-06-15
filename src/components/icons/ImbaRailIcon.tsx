import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import { Box } from "@mui/material";
import * as React from "react";

const RAIL_SIZE = 26;
const BIKE_SIZE = 26;
const WEDGE_SVG_WIDTH = 26;
const WEDGE_INSET = 1;
const WEDGE_BASE_WIDTH = 24;
const IMBA_SLOPE_DEG = 20;
const IMBA_ROTATION = `${IMBA_SLOPE_DEG}deg`;

const WEDGE_VERTICAL =
  WEDGE_BASE_WIDTH * Math.tan((IMBA_SLOPE_DEG * Math.PI) / 180);
const WEDGE_SVG_HEIGHT = WEDGE_INSET + WEDGE_VERTICAL + WEDGE_INSET;

const WEDGE_TOP_Y = WEDGE_INSET;
const WEDGE_BASE_Y = WEDGE_INSET + WEDGE_VERTICAL;
const WEDGE_BASE_X1 = WEDGE_INSET;
const WEDGE_BASE_X2 = WEDGE_INSET + WEDGE_BASE_WIDTH;

const BIKE_ICON_SX = {
  fontSize: BIKE_SIZE,
  display: "block",
  "& path": {
    stroke: "currentColor",
    strokeWidth: 0.35,
    strokeLinejoin: "round",
  },
} as const;

/** Horizontal base, vertical short leg, hypotenuse at IMBA_SLOPE_DEG. */
function ImbaWedge(): React.ReactElement {
  return (
    <svg
      width={WEDGE_SVG_WIDTH}
      height={WEDGE_SVG_HEIGHT}
      viewBox={`0 0 ${WEDGE_SVG_WIDTH} ${WEDGE_SVG_HEIGHT}`}
      fill="none"
      aria-hidden
    >
      <path
        d={`M ${WEDGE_BASE_X1} ${WEDGE_TOP_Y} L ${WEDGE_BASE_X1} ${WEDGE_BASE_Y} L ${WEDGE_BASE_X2} ${WEDGE_BASE_Y} Z`}
        fill="currentColor"
      />
    </svg>
  );
}

export const ImbaRailIcon: React.FunctionComponent = () => (
  <Box
    aria-hidden
    sx={{
      width: RAIL_SIZE,
      minHeight: RAIL_SIZE,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      color: "inherit",
      lineHeight: 0,
      overflow: "visible",
    }}
  >
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflow: "visible",
      }}
    >
      <Box
        sx={{
          transform: `rotate(${IMBA_ROTATION})`,
          transformOrigin: "26% 92%",
          mb: "-2px",
        }}
      >
        <DirectionsBikeIcon sx={BIKE_ICON_SX} />
      </Box>
      <ImbaWedge />
    </Box>
  </Box>
);
