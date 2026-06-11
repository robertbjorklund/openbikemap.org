/**

 * Application-specific branding and endpoints.

 * When creating openhikemap.org (or other variants), swap this file

 * while keeping the shared architecture intact.

 */

export const AppConfig = {

  appName: "OpenBikeMap.org",

  appDomain: "openbikemap.org",

  tagline:

    "Find MTB trails and long-distance cycling routes for training and adventure — download GPX and ride.",

  /**

   * UI chrome only — not used for map features.

   * Teal sits apart from MTB legend colors: green #2e7d32, blue #1565c0, red #d32f2f.

   */

  primaryColor: "#007B8B",

  accentColor: "#005A66",

  primarySoftColor: "#E0F2F4",

  /** Google Maps–style CTA chips: light blue fill, dark label/icon. */
  ctaBackgroundColor: "#D2E3FC",
  ctaHoverBackgroundColor: "#C2D9FA",
  ctaTextColor: "#001D35",

  defaultObjectIdType: "openbikemap" as const,

  apiBaseUrl:

    import.meta.env.VITE_API_BASE_URL ?? "https://api.openbikemap.org",

  tilesBaseUrl:

    import.meta.env.VITE_TILES_BASE_URL ?? "https://tiles.openbikemap.org",

} as const;



export type ObjectIDType =

  | typeof AppConfig.defaultObjectIdType

  | "openstreetmap";

