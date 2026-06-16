import LayersIcon from "@mui/icons-material/Layers";
import PolicyIcon from "@mui/icons-material/Policy";
import RouteIcon from "@mui/icons-material/Route";
import SearchIcon from "@mui/icons-material/Search";
import SettingsIcon from "@mui/icons-material/Settings";
import CookieIcon from "@mui/icons-material/Cookie";
import { Divider, IconButton } from "@mui/material";
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
  searchOpen: boolean;
  activeView: SidePanelView;
  onToggleSearch: () => void;
  onOpenMapLayers: () => void;
  onOpenRoute: () => void;
  onOpenMtbFilter: () => void;
  onOpenImbaFilter: () => void;
  onOpenRoutesFilter: () => void;
  onOpenSettings: () => void;
  onOpenCredits: () => void;
  onOpenAbout: () => void;
  onOpenCookiePolicy: () => void;
}> = (props) => {
  const { mtbTrail, mtbBikePark, routes } = AppConfig.layerFilters;
  const isActive = (view: SidePanelNavView) =>
    props.open && props.activeView === view;

  return (
    <div className="side-panel-rail">
      <div className="side-panel-rail-main">
        <IconButton
          className={railButtonClass(props.searchOpen)}
          aria-label="Search"
          aria-pressed={props.searchOpen}
          title="Search"
          onClick={props.onToggleSearch}
        >
          <SearchIcon sx={RAIL_ICON_SX} />
        </IconButton>

        <Divider className="side-panel-rail-divider" aria-hidden />

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
          className={railButtonClass(isActive("route"))}
          aria-label="Route"
          aria-pressed={isActive("route")}
          title="Route"
          onClick={props.onOpenRoute}
        >
          <RouteIcon sx={RAIL_ICON_SX} />
        </IconButton>

        <Divider className="side-panel-rail-divider" aria-hidden />

        <IconButton
          className={railButtonClass(isActive("mapLayers"))}
          aria-label="Map layers"
          aria-pressed={isActive("mapLayers")}
          title="Map layers"
          onClick={props.onOpenMapLayers}
        >
          <LayersIcon sx={RAIL_ICON_SX} />
        </IconButton>

        <IconButton
          className={railButtonClass(isActive("settings"))}
          aria-label="Settings"
          aria-pressed={isActive("settings")}
          title="Settings"
          onClick={props.onOpenSettings}
        >
          <SettingsIcon sx={RAIL_ICON_SX} />
        </IconButton>
      </div>

      <div className="side-panel-rail-bottom">
        <IconButton
          className={railButtonClass(isActive("cookiePolicy"))}
          aria-label="Cookie policy"
          aria-pressed={isActive("cookiePolicy")}
          title="Cookie policy"
          onClick={props.onOpenCookiePolicy}
        >
          <CookieIcon sx={RAIL_ICON_SX} />
        </IconButton>

        <IconButton
          className={railButtonClass(isActive("credits"))}
          aria-label="Credits"
          aria-pressed={isActive("credits")}
          title="Credits"
          onClick={props.onOpenCredits}
        >
          <PolicyIcon sx={RAIL_ICON_SX} />
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
