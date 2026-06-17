import {
  CloudflareAnalyticsConfig,
  isCloudflareAnalyticsConfigured,
} from "../config/CloudflareAnalyticsConfig";

let initialized = false;

/** Cookieless Cloudflare Web Analytics — no-op when VITE_CF_BEACON_TOKEN is unset. */
export function initCloudflareAnalytics(): void {
  if (!isCloudflareAnalyticsConfigured || initialized) {
    return;
  }

  initialized = true;

  if (
    document.querySelector(
      'script[src="https://static.cloudflareinsights.com/beacon.min.js"]',
    )
  ) {
    return;
  }

  const script = document.createElement("script");
  script.defer = true;
  script.src = "https://static.cloudflareinsights.com/beacon.min.js";
  script.setAttribute(
    "data-cf-beacon",
    JSON.stringify({ token: CloudflareAnalyticsConfig.beaconToken }),
  );
  document.head.appendChild(script);
}
