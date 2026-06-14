import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import { Box } from "@mui/material";
import * as React from "react";

export type PedalBikeRailVariant = "smooth" | "rough";

const RAIL_SIZE = 26;
const BIKE_SIZE = 26;
const TRACK_WIDTH = 26;
const TRACK_HEIGHT = 9;
const TRACK_STROKE = 2.5;
const STONE_RADIUS = 1.15;
const MTB_ROTATION = "-14deg";

const BIKE_ICON_SX = {
  fontSize: BIKE_SIZE,
  display: "block",
  mb: "-2px",
  "& path": {
    stroke: "currentColor",
    strokeWidth: 0.35,
    strokeLinejoin: "round",
  },
} as const;

function TrackLine({ variant }: { variant: PedalBikeRailVariant }) {
  return (
    <svg
      width={TRACK_WIDTH}
      height={TRACK_HEIGHT}
      viewBox={`0 0 ${TRACK_WIDTH} ${TRACK_HEIGHT}`}
      fill="none"
      aria-hidden
    >
      {variant === "smooth" ? (
        <line
          x1="1"
          y1="4.5"
          x2={TRACK_WIDTH - 1}
          y2="4.5"
          stroke="currentColor"
          strokeWidth={TRACK_STROKE}
          strokeLinecap="round"
        />
      ) : (
        <>
          <path
            d="M1 5.5 C3.2 -0.2 5.8 8.2 7.8 4.2"
            stroke="currentColor"
            strokeWidth={TRACK_STROKE}
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="9.5" cy="4.3" r={STONE_RADIUS} fill="currentColor" />
          <path
            d="M11.8 3.2 C14.2 8.5 16.5 -0.2 18.8 4.5"
            stroke="currentColor"
            strokeWidth={TRACK_STROKE}
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="20.5" cy="2.9" r={STONE_RADIUS} fill="currentColor" />
          <path
            d="M22.8 5.8 C24.5 0 26.2 8.5 25 3.5"
            stroke="currentColor"
            strokeWidth={TRACK_STROKE}
            strokeLinecap="round"
            fill="none"
          />
        </>
      )}
    </svg>
  );
}

export const PedalBikeRailIcon: React.FunctionComponent<{
  variant: PedalBikeRailVariant;
}> = ({ variant }) => {
  const bike = <DirectionsBikeIcon sx={BIKE_ICON_SX} />;

  const track = <TrackLine variant={variant} />;

  return (
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
      {variant === "rough" ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transform: `rotate(${MTB_ROTATION})`,
            transformOrigin: "50% 72%",
          }}
        >
          {bike}
          {track}
        </Box>
      ) : (
        <>
          {bike}
          {track}
        </>
      )}
    </Box>
  );
};
