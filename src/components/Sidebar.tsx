import InfoIcon from "@mui/icons-material/Info";
import MapIcon from "@mui/icons-material/Map";
import {
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import * as React from "react";
import { AppConfig } from "../AppConfig";
import { MapStyle } from "../MapStyle";
import EventBus from "./EventBus";

interface Props {
  eventBus: EventBus;
  open: boolean;
  currentMapStyle: MapStyle;
}

export default class Sidebar extends React.Component<Props> {
  close = () => {
    this.props.eventBus.closeSidebar();
  };

  render() {
    return (
      <Drawer anchor="left" open={this.props.open} onClose={this.close}>
        <div style={{ width: 280, paddingTop: 8 }}>
          <Typography variant="h6" sx={{ px: 2, pb: 1 }}>
            {AppConfig.appName}
          </Typography>
          <List>
            <ListItemButton onClick={() => this.props.eventBus.openAboutInfo()}>
              <ListItemIcon>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="About" />
            </ListItemButton>
            <Divider />
            <ListItemButton
              selected={this.props.currentMapStyle === MapStyle.Terrain}
              onClick={() => this.props.eventBus.setMapStyle(MapStyle.Terrain)}
            >
              <ListItemIcon>
                <MapIcon />
              </ListItemIcon>
              <ListItemText primary="Terrain basemap" />
            </ListItemButton>
            <ListItemButton
              selected={this.props.currentMapStyle === MapStyle.Bright}
              onClick={() => this.props.eventBus.setMapStyle(MapStyle.Bright)}
            >
              <ListItemIcon>
                <MapIcon />
              </ListItemIcon>
              <ListItemText primary="Bright basemap" />
            </ListItemButton>
          </List>
        </div>
      </Drawer>
    );
  }
}
