import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import RouteIcon from "@mui/icons-material/Route";
import SettingsIcon from "@mui/icons-material/Settings";
import { IconButton } from "@mui/material";
import * as React from "react";
import { AppConfig } from "../AppConfig";
import { AboutRailIcon } from "./icons/AboutRailIcon";
import { BicycleRouteRailIcon } from "./icons/BicycleRouteRailIcon";
import { StsRailIcon } from "./icons/StsRailIcon";
import { ImbaRailIcon } from "./icons/ImbaRailIcon";
import type { SidePanelNavView, SidePanelView } from "./SidePanelView";

const RAIL_ICON_SX = { fontSize: 26 };

function railButtonClass(active: boolean): string {
  return `side-panel-rail-button${active ? " side-panel-rail-button-active" : ""}`;
}

export const SidePanelRail: React.FunctionComponent<{
  open: boolean;
  activeView: SidePanelView;
  hasRouteSelection?: boolean;
  showCollapseButton?: boolean;
  onCollapseRail?: () => void;
  onOpenRoute: () => void;
  onOpenMtbFilter: () => void;
  onOpenImbaFilter: () => void;
  onOpenRoutesFilter: () => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
}> = (props) => {
  const { mtbTrail, mtbBikePark, routes } = AppConfig.layerFilters;
  const isActive = (view: SidePanelNavView) => {
    if (view === "route") {
      return (
        props.hasRouteSelection ||
        (props.open && props.activeView === "route")
      );
    }
    return props.open && props.activeView === view;
  };

  return (
    <div className="side-panel-rail">
      {props.showCollapseButton && props.onCollapseRail && (
        <IconButton
          className="side-panel-rail-collapse-button"
          aria-label="Hide menu"
          title="Hide menu"
          onClick={props.onCollapseRail}
          size="small"
        >
          <ChevronLeftIcon sx={{ fontSize: 22 }} />
        </IconButton>
      )}
      <div className="side-panel-rail-main">
        <IconButton
          className={railButtonClass(isActive("routesFilter"))}
          aria-label={`${routes.railLabel} filter`}
          aria-pressed={isActive("routesFilter")}
          title={routes.railLabel}
          onClick={props.onOpenRoutesFilter}
        >
          <BicycleRouteRailIcon />
        </IconButton>

        <IconButton
          className={railButtonClass(isActive("mtbFilter"))}
          aria-label={`${mtbTrail.railLabel} filter`}
          aria-pressed={isActive("mtbFilter")}
          title={mtbTrail.railLabel}
          onClick={props.onOpenMtbFilter}
        >
          <StsRailIcon />
        </IconButton>

        <IconButton
          className={railButtonClass(isActive("imbaFilter"))}
          aria-label={`${mtbBikePark.railLabel} filter`}
          aria-pressed={isActive("imbaFilter")}
          title={mtbBikePark.railLabel}
          onClick={props.onOpenImbaFilter}
        >
          <ImbaRailIcon />
        </IconButton>

        <IconButton
          className={`${railButtonClass(isActive("route"))} side-panel-rail-route-button`}
          aria-label="Route"
          aria-pressed={isActive("route")}
          title="Route"
          onClick={props.onOpenRoute}
        >
          <RouteIcon sx={RAIL_ICON_SX} />
        </IconButton>
      </div>

      <div className="side-panel-rail-bottom">
        <IconButton
          className={railButtonClass(isActive("settings"))}
          aria-label="Settings"
          aria-pressed={isActive("settings")}
          title="Settings"
          onClick={props.onOpenSettings}
        >
          <SettingsIcon sx={RAIL_ICON_SX} />
        </IconButton>

        <IconButton
          className={railButtonClass(isActive("about"))}
          aria-label="About"
          aria-pressed={isActive("about")}
          title="About"
          onClick={props.onOpenAbout}
        >
          <AboutRailIcon />
        </IconButton>
      </div>
    </div>
  );
};
