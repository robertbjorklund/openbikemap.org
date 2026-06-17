const beaconToken = import.meta.env.VITE_CF_BEACON_TOKEN?.trim() ?? "";

/** Enabled when a Cloudflare Web Analytics beacon token is set at build time. */
export const isCloudflareAnalyticsConfigured = beaconToken.length > 0;

export const CloudflareAnalyticsConfig = {
  beaconToken,
} as const;
