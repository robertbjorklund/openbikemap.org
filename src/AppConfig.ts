/**

 * Application-specific branding and endpoints.

 * When creating openhikemap.org (or other variants), swap this file

 * while keeping the shared architecture intact.

 */

export const AppConfig = {

  appName: "OpenBikeMap.org",

  /** Shorter brand label in side-panel chrome (no domain suffix). */
  panelTitle: "OpenBikeMap",

  appDomain: "openbikemap.org",

  tagline:
    "Explore MTB trails and signed bicycle routes — filter by difficulty or network, download GPX, and ride.",

  /**

   * UI chrome only — not used for map features.

   * Teal sits apart from MTB legend colors: STS blue/red/black, IMBA green/blue/black/orange.

   */

  primaryColor: "#007B8B",

  accentColor: "#005A66",

  primarySoftColor: "#E0F2F4",

  /** Google Maps–style CTA chips: light blue fill, dark label/icon. */
  ctaBackgroundColor: "#D2E3FC",
  ctaHoverBackgroundColor: "#C2D9FA",
  ctaTextColor: "#001D35",

  defaultObjectIdType: "openbikemap" as const,

  /** Shown when a feature has no name or ref in OpenStreetMap. */
  untitledFeatureTitle: "Untitled",

  apiBaseUrl:

    import.meta.env.VITE_API_BASE_URL ?? "https://api.openbikemap.org",

  tilesBaseUrl:

    import.meta.env.VITE_TILES_BASE_URL ?? "https://tiles.openbikemap.org",

  /** Preview banner + feedback (set VITE_BETA_BANNER=false to hide). */
  showBetaBanner: import.meta.env.VITE_BETA_BANNER !== "false",

  feedbackGithubRepo: "https://github.com/robertbjorklund/openbikemap.org",

  /** Contrasts with teal brand — beta banner and feedback CTA. */
  betaAccentColor: "#E91E63",

  betaBannerBackground: "#1E2A32",

  /** User-facing map layer filter names (panels, rail, feature headers). */
  layerFilters: {
    mtbTrail: {
      panelTitle: "MTB — Trail",
      railLabel: "Trail",
      showSwitchAriaLabel: "Show trail MTB on map",
    },
    mtbBikePark: {
      panelTitle: "MTB — Bike park",
      railLabel: "Bike park",
      showSwitchAriaLabel: "Show bike park MTB on map",
    },
    routes: {
      panelTitle: "Routes",
      railLabel: "Routes",
      featureLabel: "Cycling route",
      showSwitchAriaLabel: "Show signed routes on map",
    },
    bicycleRoutes: {
      panelTitle: "Cycling networks",
      subtitle:
        "Signed long-distance cycling routes (LCN, RCN, NCN, EuroVelo/ICN).",
      showSwitchAriaLabel: "Show cycling network routes on map",
    },
    mtbRoutes: {
      panelTitle: "MTB routes",
      subtitle:
        "Named MTB loops and bike-park routes from OpenStreetMap (route=mtb), coloured by OSM tag when available.",
      showSwitchAriaLabel: "Show MTB routes on map",
    },
  },

} as const;



export type ObjectIDType =

  | typeof AppConfig.defaultObjectIdType

  | "openstreetmap";

