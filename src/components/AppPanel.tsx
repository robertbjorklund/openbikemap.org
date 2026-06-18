import { Box, Tab, Tabs } from "@mui/material";
import * as React from "react";
import { About } from "./About";
import {
  APP_PANEL_TAB_LABELS,
  type AppPanelTab,
} from "./AppPanelTab";
import { CookiePolicy } from "./CookiePolicy";
import { Credits } from "./Credits";
import EventBus from "./EventBus";
import { PanelShell } from "./PanelShell";
import { SettingsPanelBody } from "./SettingsPanelBody";

export const AppPanel: React.FunctionComponent<{
  eventBus: EventBus;
  activeTab: AppPanelTab;
  onTabChange: (tab: AppPanelTab) => void;
}> = (props) => {
  const tabHeader = (
    <Tabs
      value={props.activeTab}
      onChange={(_event, value: AppPanelTab) => props.onTabChange(value)}
      variant="scrollable"
      scrollButtons="auto"
      aria-label="App sections"
      sx={{
        minHeight: 40,
        "& .MuiTab-root": { minHeight: 40, py: 0.5, textTransform: "none" },
      }}
    >
      {(Object.keys(APP_PANEL_TAB_LABELS) as AppPanelTab[]).map((tab) => (
        <Tab key={tab} value={tab} label={APP_PANEL_TAB_LABELS[tab]} />
      ))}
    </Tabs>
  );

  return (
    <PanelShell
      headerCenter={
        <Box sx={{ flex: 1, minWidth: 0 }}>{tabHeader}</Box>
      }
      hideFeatureTitleSection
      showBack={false}
      onClose={() => props.eventBus.closeMenu()}
    >
      {props.activeTab === "settings" && (
        <SettingsPanelBody eventBus={props.eventBus} />
      )}
      {props.activeTab === "about" && <About eventBus={props.eventBus} />}
      {props.activeTab === "credits" && <Credits />}
      {props.activeTab === "cookies" && <CookiePolicy />}
    </PanelShell>
  );
};
