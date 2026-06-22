import { AppConfig } from "../AppConfig";
import type State from "../components/State";
import { buildFeatureShareUrl } from "./FeatureShareUrl";
import { getFeatureDisplayTitle } from "./featureDisplayTitle";

const SITE_URL = `https://${AppConfig.appDomain}`;

const DEFAULT_TITLE = AppConfig.appName;

const DEFAULT_DESCRIPTION =
  "Find MTB trails and long-distance cycling routes. Filter by difficulty or network, download GPX, and ride.";

function setMetaContent(
  selector: string,
  content: string,
  createAttributes: Record<string, string>,
): void {
  let element = document.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    for (const [key, value] of Object.entries(createAttributes)) {
      element.setAttribute(key, value);
    }
    document.head.appendChild(element);
  }
  element.content = content;
}

function buildPageUrl(state: State): string {
  if (
    state.selectedObject?.showInfo &&
    state.selectedObject.feature &&
    state.selectedObject.id
  ) {
    return buildFeatureShareUrl(
      state.selectedObject.id,
      state.selectedObject.idType,
    );
  }

  if (state.sidePanelView === "app" && state.appPanelTab === "about") {
    return `${SITE_URL}/?about`;
  }

  return `${SITE_URL}/`;
}

function buildPageTitle(state: State): string {
  if (
    state.selectedObject?.showInfo &&
    state.selectedObject.feature
  ) {
    return `${getFeatureDisplayTitle(state.selectedObject.feature)} — ${AppConfig.appName}`;
  }

  if (state.sidePanelView === "app" && state.appPanelTab === "about") {
    return `About — ${AppConfig.appName}`;
  }

  return DEFAULT_TITLE;
}

function buildPageDescription(state: State): string {
  if (
    state.selectedObject?.showInfo &&
    state.selectedObject.feature
  ) {
    const name = getFeatureDisplayTitle(state.selectedObject.feature);
    return `View ${name} on ${AppConfig.appName}. MTB trails and signed cycling routes with GPX download.`;
  }

  return DEFAULT_DESCRIPTION;
}

/** Sync document title and core SEO meta tags with current app state. */
export function syncPageMetadata(state: State): void {
  const title = buildPageTitle(state);
  const description = buildPageDescription(state);
  const url = buildPageUrl(state);

  document.title = title;

  setMetaContent('meta[name="description"]', description, {
    name: "description",
  });
  setMetaContent('meta[property="og:title"]', title, {
    property: "og:title",
  });
  setMetaContent('meta[property="og:description"]', description, {
    property: "og:description",
  });
  setMetaContent('meta[property="og:url"]', url, { property: "og:url" });
  setMetaContent('meta[name="twitter:title"]', title, {
    name: "twitter:title",
  });
  setMetaContent('meta[name="twitter:description"]', description, {
    name: "twitter:description",
  });
}

export const pageMetadataDefaults = {
  siteUrl: SITE_URL,
  defaultTitle: DEFAULT_TITLE,
  defaultDescription: DEFAULT_DESCRIPTION,
  ogImageUrl: `${SITE_URL}/og-image.svg`,
};
