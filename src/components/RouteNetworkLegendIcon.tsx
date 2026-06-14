import { Box } from "@mui/material";
import * as React from "react";
import {
  isEuroVeloRoute,
} from "../types/EuroVelo";
import {
  parseRouteShieldNumber,
  RouteNetwork,
  routeNetworkColor,
} from "../types/RouteNetwork";
import { EuroVeloLegendIcon } from "./EuroVeloLegendIcon";
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

function contrastTextColor(hex: string): string {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? "#212121" : "#ffffff";
}

function labelFontSize(label: string, size: number): number {
  if (label.length <= 2) {
    return size * 0.38;
  }
  if (label.length <= 3) {
    return size * 0.3;
  }
  return size * 0.22;
}

export const RouteNetworkLegendIcon: React.FunctionComponent<{
  network: string | null;
  size?: number;
  /** Route ref shown inside the shield (e.g. "23" on Sverigeleden). */
  label?: string | null;
  name?: string | null;
}> = (props) => {
  const size = props.size ?? DEFAULT_ICON_SIZE;
  const ref = props.label?.trim() || null;
  const name = props.name?.trim() || null;
  const shieldNumber = parseRouteShieldNumber(ref, name);

  if (
    isEuroVeloRoute(ref, name, props.network) ||
    (props.network === RouteNetwork.Icn && !ref && !name)
  ) {
    return <EuroVeloLegendIcon number={shieldNumber} size={size} />;
  }

  const color = routeNetworkColor(props.network, ref, name);
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
      aria-hidden={!shieldNumber}
      aria-label={shieldNumber ? `Route ${shieldNumber}` : undefined}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <polygon points={flatTopOctagonPoints(size)} fill={color} />
        {shieldNumber && (
          <text
            x={size / 2}
            y={size / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fill={contrastTextColor(color)}
            fontSize={labelFontSize(shieldNumber, size)}
            fontWeight={700}
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {shieldNumber}
          </text>
        )}
      </svg>
    </Box>
  );
};
