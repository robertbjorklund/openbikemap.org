/**
 * Application-specific branding and endpoints.
 * When creating openhikemap.org (or other variants), swap this file
 * while keeping the shared architecture intact.
 */
export const AppConfig = {
  appName: "OpenBikeMap.org",
  appDomain: "openbikemap.org",
  tagline:
    "Explore bicycle trails, cycling routes, and bike infrastructure worldwide.",
  primaryColor: "#2e7d32",
  accentColor: "#1565c0",
  defaultObjectIdType: "openbikemap" as const,
  apiBaseUrl:
    import.meta.env.VITE_API_BASE_URL ?? "https://api.openbikemap.org",
  tilesBaseUrl:
    import.meta.env.VITE_TILES_BASE_URL ?? "https://tiles.openbikemap.org",
} as const;

export type ObjectIDType =
  | typeof AppConfig.defaultObjectIdType
  | "openstreetmap";
