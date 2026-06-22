import { Box } from "@mui/material";
import * as React from "react";
import {
  formatWindSpeed,
  windArrowRotationDeg,
} from "../utils/weather/formatWeather";

export const WindDirectionArrow: React.FunctionComponent<{
  directionDeg: number;
  size?: number;
}> = ({ directionDeg, size = 14 }) => (
  <Box
    component="span"
    aria-hidden
    sx={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: size,
      height: size,
      transform: `rotate(${windArrowRotationDeg(directionDeg)}deg)`,
      transformOrigin: "center center",
      lineHeight: 1,
      fontSize: size,
      fontWeight: 700,
      color: "text.secondary",
    }}
  >
    ↑
  </Box>
);

export const WeatherWindLine: React.FunctionComponent<{
  speedMs: number;
  directionDeg: number;
  compact?: boolean;
}> = ({ speedMs, directionDeg, compact = false }) => (
  <Box
    component="span"
    sx={{
      display: "inline-flex",
      alignItems: "center",
      gap: 0.5,
      verticalAlign: "middle",
    }}
  >
    <Box component="span">{formatWindSpeed(speedMs)}</Box>
    <WindDirectionArrow directionDeg={directionDeg} size={compact ? 13 : 14} />
  </Box>
);
