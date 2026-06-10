import { Box } from "@mui/material";
import * as React from "react";
import {
  MTB_SCALE_NOT_SET,
  type MtbScaleFilter,
} from "../types/BikeActivity";
import {
  MTB_TRAIL_COLOR_BLACK,
  MTB_TRAIL_COLOR_BLUE,
  MTB_TRAIL_COLOR_GREEN,
  MTB_TRAIL_COLOR_RED,
  TRAIL_COLOR_OTHER,
} from "../types/MtbTrailColors";

const ICON_SIZE = 18;

function IconFrame(props: React.PropsWithChildren) {
  return (
    <Box
      component="span"
      sx={{
        width: ICON_SIZE,
        height: ICON_SIZE,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
      aria-hidden
    >
      {props.children}
    </Box>
  );
}

function GreenCircle() {
  return (
    <IconFrame>
      <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 18 18">
        <circle cx="9" cy="9" r="6" fill={MTB_TRAIL_COLOR_GREEN} />
      </svg>
    </IconFrame>
  );
}

function BlueSquare() {
  return (
    <IconFrame>
      <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 18 18">
        <rect x="4" y="4" width="10" height="10" fill={MTB_TRAIL_COLOR_BLUE} />
      </svg>
    </IconFrame>
  );
}

function RedTriangle() {
  return (
    <IconFrame>
      <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 18 18">
        <polygon points="9,3 15,15 3,15" fill={MTB_TRAIL_COLOR_RED} />
      </svg>
    </IconFrame>
  );
}

function BlackDiamond() {
  return (
    <IconFrame>
      <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 18 18">
        <polygon
          points="9,2 16,9 9,16 2,9"
          fill={MTB_TRAIL_COLOR_BLACK}
          stroke="rgba(0,0,0,0.15)"
          strokeWidth="0.5"
        />
      </svg>
    </IconFrame>
  );
}

function BlackDoubleDiamond() {
  return (
    <IconFrame>
      <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 18 18">
        <polygon points="9,1 12.5,5 9,9 5.5,5" fill={MTB_TRAIL_COLOR_BLACK} />
        <polygon points="9,7 12.5,11 9,15 5.5,11" fill={MTB_TRAIL_COLOR_BLACK} />
      </svg>
    </IconFrame>
  );
}

function PurpleCircle() {
  return (
    <IconFrame>
      <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 18 18">
        <circle
          cx="9"
          cy="9"
          r="6"
          fill="none"
          stroke={TRAIL_COLOR_OTHER}
          strokeWidth="2"
        />
      </svg>
    </IconFrame>
  );
}

export const MtbScaleLegendIcon: React.FunctionComponent<{
  scale: MtbScaleFilter;
}> = (props) => {
  const { scale } = props;

  if (scale === MTB_SCALE_NOT_SET) {
    return <PurpleCircle />;
  }
  if (scale <= 1) {
    return <GreenCircle />;
  }
  if (scale === 2) {
    return <BlueSquare />;
  }
  if (scale === 3) {
    return <RedTriangle />;
  }
  if (scale === 4) {
    return <BlackDiamond />;
  }
  return <BlackDoubleDiamond />;
};
