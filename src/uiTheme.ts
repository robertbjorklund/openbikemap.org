import type { Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";
import { AppConfig } from "./AppConfig";

/** Pill-shaped CTA buttons (Google Maps style). */
export const ctaButtonSx: SystemStyleObject<Theme> = {
  borderRadius: "20px",
  textTransform: "none",
  fontWeight: 500,
  fontSize: "0.875rem",
  lineHeight: 1.25,
  px: 2,
  py: 0.75,
  minHeight: 40,
  color: AppConfig.ctaTextColor,
  backgroundColor: AppConfig.ctaBackgroundColor,
  boxShadow: "none",
  "& .MuiButton-startIcon": {
    color: AppConfig.ctaTextColor,
    marginRight: 0.75,
    "& > *": { fontSize: 20 },
  },
  "&:hover": {
    backgroundColor: AppConfig.ctaHoverBackgroundColor,
    boxShadow: "none",
  },
  "&.Mui-disabled": {
    color: "rgba(0, 29, 53, 0.38)",
    backgroundColor: "rgba(210, 227, 252, 0.5)",
  },
};

/** Injects UI brand colors as CSS variables (distinct from map legend colors). */
export function applyUiTheme(): void {
  document.documentElement.style.setProperty(
    "--app-primary",
    AppConfig.primaryColor,
  );
  document.documentElement.style.setProperty(
    "--app-accent",
    AppConfig.accentColor,
  );
  document.documentElement.style.setProperty(
    "--app-primary-soft",
    AppConfig.primarySoftColor,
  );
}

export function withAlpha(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "");
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
