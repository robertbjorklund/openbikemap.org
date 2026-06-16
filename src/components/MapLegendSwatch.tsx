import * as React from "react";
import {
  IMBA_TRAIL_CASING_COLOR,
  IMBA_TRAIL_COLOR_BLUE,
  MTB_TRAIL_COLOR_RED,
  TRAIL_STS_CENTER_LINE_COLOR,
} from "../types/MtbTrailColors";
import { RouteNetwork, ROUTE_NETWORK_COLORS } from "../types/RouteNetwork";

const SWATCH_WIDTH = 48;
const SWATCH_HEIGHT = 10;

function SwatchFrame({
  children,
  muted,
}: React.PropsWithChildren<{ muted?: boolean }>) {
  return (
    <span
      aria-hidden
      style={{
        display: "inline-flex",
        flexShrink: 0,
        width: SWATCH_WIDTH,
        height: SWATCH_HEIGHT,
        alignItems: "center",
        justifyContent: "center",
        opacity: muted ? 0.45 : 1,
      }}
    >
      {children}
    </span>
  );
}

/** STS trails — solid double line with white centre. */
export const StsLineSwatch: React.FunctionComponent<{ muted?: boolean }> = (
  props,
) => (
  <SwatchFrame muted={props.muted}>
    <svg width={SWATCH_WIDTH} height={SWATCH_HEIGHT} viewBox="0 0 48 10">
      <line
        x1="3"
        y1="2.5"
        x2="45"
        y2="2.5"
        stroke={MTB_TRAIL_COLOR_RED}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <line
        x1="3"
        y1="7.5"
        x2="45"
        y2="7.5"
        stroke={MTB_TRAIL_COLOR_RED}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <line
        x1="3"
        y1="5"
        x2="45"
        y2="5"
        stroke={TRAIL_STS_CENTER_LINE_COLOR}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  </SwatchFrame>
);

/** IMBA bike park trails — dashed line on light gray backing. */
export const ImbaLineSwatch: React.FunctionComponent<{ muted?: boolean }> = (
  props,
) => (
  <SwatchFrame muted={props.muted}>
    <svg width={SWATCH_WIDTH} height={SWATCH_HEIGHT} viewBox="0 0 48 10">
      <rect
        x="2"
        y="1.5"
        width="44"
        height="7"
        rx="1"
        fill={IMBA_TRAIL_CASING_COLOR}
      />
      <line
        x1="4"
        y1="5"
        x2="44"
        y2="5"
        stroke={IMBA_TRAIL_COLOR_BLUE}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="4 2.5"
      />
    </svg>
  </SwatchFrame>
);

/** Signed bicycle routes — solid coloured line. */
export const RouteLineSwatch: React.FunctionComponent<{ muted?: boolean }> = (
  props,
) => (
  <SwatchFrame muted={props.muted}>
    <svg width={SWATCH_WIDTH} height={SWATCH_HEIGHT} viewBox="0 0 48 10">
      <line
        x1="4"
        y1="5"
        x2="44"
        y2="5"
        stroke={ROUTE_NETWORK_COLORS[RouteNetwork.Ncn]}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  </SwatchFrame>
);
