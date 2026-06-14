import { Box } from "@mui/material";
import * as React from "react";
import {
  EUROVELO_ROUTE_COLOR,
  EUROVELO_STAR_COLOR,
  EUROVELO_STAR_POLYGONS,
} from "../types/EuroVelo";

const EUROVELO_VIEWBOX = 220;

function numberFontSize(number: string): number {
  if (number.length <= 1) {
    return 88;
  }
  if (number.length <= 2) {
    return 72;
  }
  return 56;
}

export const EuroVeloLegendIcon: React.FunctionComponent<{
  /** EuroVelo route number (e.g. "6" for EuroVelo 6). */
  number?: string | null;
  size?: number;
}> = (props) => {
  const size = props.size ?? 18;
  const number = props.number?.trim() || null;

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
      aria-hidden={!number}
      aria-label={number ? `EuroVelo ${number}` : "EuroVelo"}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${EUROVELO_VIEWBOX} ${EUROVELO_VIEWBOX}`}
      >
        <rect fill={EUROVELO_ROUTE_COLOR} width={EUROVELO_VIEWBOX} height={EUROVELO_VIEWBOX} />
        {EUROVELO_STAR_POLYGONS.map((points, index) => (
          <polygon key={index} fill={EUROVELO_STAR_COLOR} points={points} />
        ))}
        {number && (
          <text
            x={EUROVELO_VIEWBOX / 2}
            y={118}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#FFFFFF"
            fontSize={numberFontSize(number)}
            fontWeight={700}
            fontFamily="Arial, Helvetica, sans-serif"
          >
            {number}
          </text>
        )}
      </svg>
    </Box>
  );
};
