import SettingsIcon from "@mui/icons-material/Settings";
import { IconButton } from "@mui/material";
import * as React from "react";
import { AppConfig } from "../AppConfig";
import { BicycleRouteRailIcon } from "./icons/BicycleRouteRailIcon";
import { ImbaRailIcon } from "./icons/ImbaRailIcon";
import { StsRailIcon } from "./icons/StsRailIcon";
import type { SidePanelNavView, SidePanelView } from "./SidePanelView";

function navButtonClass(active: boolean): string {
  return `mobile-bottom-nav-button${active ? " mobile-bottom-nav-button-active" : ""}`;
}

export const MobileBottomNav: React.FunctionComponent<{
  open: boolean;
  activeView: SidePanelView;
  onOpenRoutesFilter: () => void;
  onOpenMtbFilter: () => void;
  onOpenImbaFilter: () => void;
  onOpenApp: () => void;
}> = (props) => {
  const { mtbTrail, mtbBikePark, routes } = AppConfig.layerFilters;

  const isActive = (view: SidePanelNavView) =>
    props.open && props.activeView === view;

  return (
    <nav className="mobile-bottom-nav" aria-label="Map tools">
      <IconButton
        className={navButtonClass(isActive("routesFilter"))}
        aria-label={`${routes.railLabel} filter`}
        aria-pressed={isActive("routesFilter")}
        title={routes.railLabel}
        onClick={props.onOpenRoutesFilter}
      >
        <BicycleRouteRailIcon />
      </IconButton>

      <IconButton
        className={navButtonClass(isActive("mtbFilter"))}
        aria-label={`${mtbTrail.railLabel} filter`}
        aria-pressed={isActive("mtbFilter")}
        title={mtbTrail.railLabel}
        onClick={props.onOpenMtbFilter}
      >
        <StsRailIcon />
      </IconButton>

      <IconButton
        className={navButtonClass(isActive("imbaFilter"))}
        aria-label={`${mtbBikePark.railLabel} filter`}
        aria-pressed={isActive("imbaFilter")}
        title={mtbBikePark.railLabel}
        onClick={props.onOpenImbaFilter}
      >
        <ImbaRailIcon />
      </IconButton>

      <IconButton
        className={navButtonClass(isActive("app"))}
        aria-label="Settings and information"
        aria-pressed={isActive("app")}
        title="Settings"
        onClick={props.onOpenApp}
      >
        <SettingsIcon sx={{ fontSize: 26 }} />
      </IconButton>
    </nav>
  );
};
