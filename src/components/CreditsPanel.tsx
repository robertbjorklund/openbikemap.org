import { Link, Typography } from "@mui/material";
import * as React from "react";
import { AppConfig } from "../AppConfig";
import EventBus from "./EventBus";
import { PanelShell } from "./PanelShell";

export const CreditsPanel: React.FunctionComponent<{
  eventBus: EventBus;
}> = (props) => {
  return (
    <PanelShell
      title="Credits"
      onClose={() => props.eventBus.closeMenu()}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
        Map data
      </Typography>
      <Typography paragraph sx={{ mb: 2 }}>
        <Link href="https://www.openstreetmap.org/copyright" target="_blank">
          © OpenStreetMap contributors
        </Link>{" "}
        and{" "}
        <Link href={`https://${AppConfig.appDomain}/?about`}>
          {AppConfig.appName}
        </Link>
        .
      </Typography>

      <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
        Base map
      </Typography>
      <Typography paragraph sx={{ mb: 2 }}>
        Graciously provided by{" "}
        <Link href="https://openfreemap.org/" target="_blank">
          OpenFreeMap
        </Link>{" "}
        and{" "}
        <Link href="https://www.openmaptiles.org/" target="_blank">
          © OpenMapTiles
        </Link>
        .
      </Typography>

      <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
        Satellite imagery
      </Typography>
      <Typography paragraph sx={{ mb: 2 }}>
        Powered by{" "}
        <Link href="https://www.esri.com/" target="_blank">
          Esri
        </Link>
        .
      </Typography>

      <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
        Bicycle data
      </Typography>
      <Typography paragraph>
        Trail and route data is derived from OpenStreetMap and processed for{" "}
        {AppConfig.appName}.
      </Typography>
    </PanelShell>
  );
};
