import CookieIcon from "@mui/icons-material/Cookie";
import FilterListIcon from "@mui/icons-material/FilterList";
import LayersIcon from "@mui/icons-material/Layers";
import PolicyIcon from "@mui/icons-material/Policy";
import RouteIcon from "@mui/icons-material/Route";
import SearchIcon from "@mui/icons-material/Search";
import SettingsIcon from "@mui/icons-material/Settings";
import { IconButton } from "@mui/material";
import * as React from "react";
import { AboutRailIcon } from "./icons/AboutRailIcon";
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
  onOpenFilter: () => void;
  onOpenSettings: () => void;
  onOpenCredits: () => void;
  onOpenAbout: () => void;
  onOpenCookiePolicy: () => void;
}> = (props) => {
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

        <IconButton
          className={railButtonClass(isActive("filter"))}
          aria-label="Filter"
          aria-pressed={isActive("filter")}
          title="Filter"
          onClick={props.onOpenFilter}
        >
          <FilterListIcon sx={RAIL_ICON_SX} />
        </IconButton>

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
          className={railButtonClass(isActive("route"))}
          aria-label="Route"
          aria-pressed={isActive("route")}
          title="Route"
          onClick={props.onOpenRoute}
        >
          <RouteIcon sx={RAIL_ICON_SX} />
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
          className={railButtonClass(false)}
          aria-label="Cookie policy"
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
