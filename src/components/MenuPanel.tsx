import InfoIcon from "@mui/icons-material/Info";
import LayersIcon from "@mui/icons-material/Layers";
import MapIcon from "@mui/icons-material/Map";
import { Divider, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import * as React from "react";
import { AppConfig } from "../AppConfig";
import { MapStyle } from "../MapStyle";
import EventBus from "./EventBus";
import { PanelShell } from "./PanelShell";

interface Props {
  eventBus: EventBus;
  currentMapStyle: MapStyle;
}

export const MenuPanel: React.FunctionComponent<Props> = (props) => {
  return (
    <PanelShell title={AppConfig.appName} onBack={() => props.eventBus.closeMenu()}>
      <List disablePadding>
        <ListItemButton onClick={() => props.eventBus.openAboutInfo()}>
          <ListItemIcon>
            <InfoIcon />
          </ListItemIcon>
          <ListItemText primary="About" />
        </ListItemButton>
        <ListItemButton onClick={() => props.eventBus.openLayers()}>
          <ListItemIcon>
            <LayersIcon />
          </ListItemIcon>
          <ListItemText primary="Layers & filters" />
        </ListItemButton>
        <Divider sx={{ my: 1 }} />
        <ListItemButton
          selected={props.currentMapStyle === MapStyle.Terrain}
          onClick={() => props.eventBus.setMapStyle(MapStyle.Terrain)}
        >
          <ListItemIcon>
            <MapIcon />
          </ListItemIcon>
          <ListItemText primary="Terrain basemap" />
        </ListItemButton>
        <ListItemButton
          selected={props.currentMapStyle === MapStyle.Bright}
          onClick={() => props.eventBus.setMapStyle(MapStyle.Bright)}
        >
          <ListItemIcon>
            <MapIcon />
          </ListItemIcon>
          <ListItemText primary="Bright basemap" />
        </ListItemButton>
      </List>
    </PanelShell>
  );
};
