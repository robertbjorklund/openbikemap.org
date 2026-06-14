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
        MTB and bicycle routes
      </Typography>
      <Typography paragraph sx={{ mb: 2 }}>
        Trail and route overlays are derived from{" "}
        <Link
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
        >
          © OpenStreetMap contributors
        </Link>
        , processed for {AppConfig.appName}, and served as vector tiles and
        GeoJSON. MTB difficulty follows OSM Single Track Scale (S0–S6) and IMBA
        scale (0–4) tags where mappers have added them.
      </Typography>

      <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
        Base map
      </Typography>
      <Typography paragraph sx={{ mb: 2 }}>
        Graciously provided by{" "}
        <Link href="https://openfreemap.org/" target="_blank" rel="noreferrer">
          OpenFreeMap
        </Link>{" "}
        and{" "}
        <Link
          href="https://www.openmaptiles.org/"
          target="_blank"
          rel="noreferrer"
        >
          © OpenMapTiles
        </Link>
        .
      </Typography>

      <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
        Satellite imagery
      </Typography>
      <Typography paragraph>
        Powered by{" "}
        <Link href="https://www.esri.com/" target="_blank" rel="noreferrer">
          Esri
        </Link>
        .
      </Typography>
    </PanelShell>
  );
};
