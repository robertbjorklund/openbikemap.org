const matomoUrl = import.meta.env.VITE_MATOMO_URL?.replace(/\/$/, "") ?? "";
const matomoSiteId = import.meta.env.VITE_MATOMO_SITE_ID ?? "";

/** Enabled when URL and site ID are set (omit in local dev unless configured). */
export const isMatomoConfigured =
  matomoUrl.length > 0 && matomoSiteId.length > 0;

export const MatomoConfig = {
  url: matomoUrl,
  siteId: matomoSiteId,
  trackerUrl: isMatomoConfigured ? `${matomoUrl}/matomo.php` : "",
  scriptUrl: isMatomoConfigured ? `${matomoUrl}/matomo.js` : "",
} as const;
