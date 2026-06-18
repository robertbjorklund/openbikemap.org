import { Box } from "@mui/material";
import * as React from "react";
import { mtbRouteColor } from "../types/MtbRouteColors";

export const MtbRouteLegendIcon: React.FunctionComponent<{
  osmColour?: string | null;
  size?: number;
}> = (props) => {
  const size = props.size ?? 18;
  const color = mtbRouteColor(props.osmColour);
  const lineY = size / 2;

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
        <line
          x1={size * 0.15}
          y1={lineY}
          x2={size * 0.85}
          y2={lineY}
          stroke={color}
          strokeWidth={Math.max(2, size * 0.14)}
          strokeLinecap="round"
        />
      </svg>
    </Box>
  );
};
