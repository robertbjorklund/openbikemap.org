import { isMatomoConfigured, MatomoConfig } from "../config/MatomoConfig";

type MatomoCommand = unknown[];

declare global {
  interface Window {
    _paq?: MatomoCommand[];
  }
}

let initialized = false;

function queue(command: MatomoCommand): void {
  window._paq = window._paq ?? [];
  window._paq.push(command);
}

function loadScript(): void {
  if (document.querySelector(`script[src="${MatomoConfig.scriptUrl}"]`)) {
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = MatomoConfig.scriptUrl;
  document.head.appendChild(script);
}

/** Self-hosted Matomo — no-op when VITE_MATOMO_URL / SITE_ID are unset. */
export function initMatomo(): void {
  if (!isMatomoConfigured || initialized) {
    return;
  }

  initialized = true;
  queue(["setTrackerUrl", MatomoConfig.trackerUrl]);
  queue(["setSiteId", MatomoConfig.siteId]);
  queue(["enableLinkTracking"]);
  queue(["setDoNotTrack", true]);
  loadScript();
}

/** Page view using path + query only (map hash zoom/lat/lng is excluded). */
export function trackAppPageView(documentTitle?: string): void {
  if (!isMatomoConfigured) {
    return;
  }

  const customUrl =
    window.location.pathname + window.location.search || "/";
  queue(["setCustomUrl", customUrl]);
  if (documentTitle) {
    queue(["setDocumentTitle", documentTitle]);
  }
  queue(["trackPageView"]);
}

export function trackMatomoEvent(
  category: string,
  action: string,
  name?: string,
  value?: number,
): void {
  if (!isMatomoConfigured) {
    return;
  }

  const command: MatomoCommand = ["trackEvent", category, action];
  if (name !== undefined) {
    command.push(name);
  }
  if (value !== undefined) {
    command.push(value);
  }
  queue(command);
}
