import RouteIcon from "@mui/icons-material/Route";
import SettingsIcon from "@mui/icons-material/Settings";
import { IconButton } from "@mui/material";
import * as React from "react";
import { AppConfig } from "../AppConfig";
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
  onOpenRoute: () => void;
  onOpenMtbFilter: () => void;
  onOpenImbaFilter: () => void;
  onOpenRoutesFilter: () => void;
  onOpenApp: () => void;
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
          className={railButtonClass(isActive("app"))}
          aria-label="Settings and information"
          aria-pressed={isActive("app")}
          title="Settings"
          onClick={props.onOpenApp}
        >
          <SettingsIcon sx={RAIL_ICON_SX} />
        </IconButton>
      </div>
    </div>
  );
};
