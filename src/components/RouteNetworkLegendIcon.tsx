import { Box } from "@mui/material";
import * as React from "react";
import { routeNetworkColor } from "../types/RouteNetwork";

const DEFAULT_ICON_SIZE = 18;

/** Regular octagon inscribed in a square (flat top). */
export function flatTopOctagonPoints(size: number): string {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.45;
  const points: string[] = [];
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI / 4) * i - Math.PI / 8;
    points.push(
      `${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`,
    );
  }
  return points.join(" ");
}

export const RouteNetworkLegendIcon: React.FunctionComponent<{
  network: string | null;
  size?: number;
}> = (props) => {
  const size = props.size ?? DEFAULT_ICON_SIZE;
  const color = routeNetworkColor(props.network);

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
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <polygon points={flatTopOctagonPoints(size)} fill={color} />
      </svg>
    </Box>
  );
};
