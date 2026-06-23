import { Typography, type TypographyProps } from "@mui/material";
import * as React from "react";

/** Body text for route/trail detail rows (length, surface, elevation, etc.). */
export const FeatureDetailStat: React.FunctionComponent<{
  children: React.ReactNode;
  className?: string;
  color?: TypographyProps["color"];
}> = ({ children, className, color }) => (
  <Typography
    variant="body2"
    gutterBottom
    className={className}
    color={color}
    sx={{ mb: 0.25, display: "block" }}
  >
    {children}
  </Typography>
);
