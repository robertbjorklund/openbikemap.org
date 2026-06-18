export type AppPanelTab = "settings" | "about" | "credits" | "cookies";

export const APP_PANEL_TABS: readonly AppPanelTab[] = [
  "settings",
  "about",
  "credits",
  "cookies",
] as const;

export const APP_PANEL_TAB_LABELS: Record<AppPanelTab, string> = {
  settings: "Settings",
  about: "About",
  credits: "Credits",
  cookies: "Cookies",
};

export function parseAppPanelTab(value: string | undefined): AppPanelTab {
  if (value && APP_PANEL_TABS.includes(value as AppPanelTab)) {
    return value as AppPanelTab;
  }
  return "about";
}
