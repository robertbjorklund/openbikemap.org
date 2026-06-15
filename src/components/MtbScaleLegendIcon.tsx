import { Box } from "@mui/material";
import * as React from "react";
import {
  MTB_SCALE_NOT_SET,
  type MtbScaleFilter,
} from "../types/BikeActivity";
import {
  MTB_TRAIL_COLOR_BLACK,
  MTB_TRAIL_COLOR_BLUE,
  MTB_TRAIL_COLOR_ORANGE,
  MTB_TRAIL_COLOR_RED,
  TRAIL_COLOR_OTHER,
} from "../types/MtbTrailColors";

const DEFAULT_ICON_SIZE = 18;

function IconFrame({
  size,
  children,
}: React.PropsWithChildren<{ size: number }>) {
  return (
    <Box
      component="span"
      sx={{
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
      aria-hidden
    >
      {children}
    </Box>
  );
}

function BlueSquare({ size }: { size: number }) {
  return (
    <IconFrame size={size}>
      <svg width={size} height={size} viewBox="0 0 18 18">
        <rect x="4" y="4" width="10" height="10" fill={MTB_TRAIL_COLOR_BLUE} />
      </svg>
    </IconFrame>
  );
}

function RedTriangle({ size }: { size: number }) {
  return (
    <IconFrame size={size}>
      <svg width={size} height={size} viewBox="0 0 18 18">
        <polygon points="9,3 15,15 3,15" fill={MTB_TRAIL_COLOR_RED} />
      </svg>
    </IconFrame>
  );
}

function BlackDiamond({ size }: { size: number }) {
  return (
    <IconFrame size={size}>
      <svg width={size} height={size} viewBox="0 0 18 18">
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

function OrangeDoubleDiamond({ size }: { size: number }) {
  return (
    <IconFrame size={size}>
      <svg width={size} height={size} viewBox="0 0 18 18">
        <polygon points="5,2 9,7 5,12 1,7" fill={MTB_TRAIL_COLOR_ORANGE} />
        <polygon points="13,2 17,7 13,12 9,7" fill={MTB_TRAIL_COLOR_ORANGE} />
      </svg>
    </IconFrame>
  );
}

function PurpleCircle({ size }: { size: number }) {
  return (
    <IconFrame size={size}>
      <svg width={size} height={size} viewBox="0 0 18 18">
        <circle cx="9" cy="9" r="6" fill={TRAIL_COLOR_OTHER} />
      </svg>
    </IconFrame>
  );
}

export const MtbScaleLegendIcon: React.FunctionComponent<{
  scale: MtbScaleFilter;
  size?: number;
}> = (props) => {
  const { scale } = props;
  const size = props.size ?? DEFAULT_ICON_SIZE;

  if (scale === MTB_SCALE_NOT_SET) {
    return <PurpleCircle size={size} />;
  }
  if (scale <= 1) {
    return <BlueSquare size={size} />;
  }
  if (scale === 2) {
    return <RedTriangle size={size} />;
  }
  if (scale <= 5) {
    return <BlackDiamond size={size} />;
  }
  return <OrangeDoubleDiamond size={size} />;
};
