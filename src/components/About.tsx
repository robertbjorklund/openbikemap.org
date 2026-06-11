import { Link, Typography } from "@mui/material";
import * as React from "react";
import { AppConfig } from "../AppConfig";
import EventBus from "./EventBus";

export const About: React.FunctionComponent<{ eventBus: EventBus }> = () => {
  return (
    <>
      <Typography paragraph>{AppConfig.tagline}</Typography>
      <Typography variant="h6" gutterBottom>
        Status
      </Typography>
      <Typography paragraph>
        This is the initial project scaffold. The basemap is provided by{" "}
        <Link href="https://openfreemap.org" target="_blank" rel="noreferrer">
          OpenFreeMap
        </Link>
        . Bicycle trail layers, search, and feature details will be added once
        the data pipeline and API are in place.
      </Typography>
      <Typography variant="h6" gutterBottom>
        Planned trail types
      </Typography>
      <Typography component="ul" sx={{ pl: 2 }}>
        <li>Cycleways</li>
        <li>Bicycle routes (lcn/ncn/rcn/icn)</li>
        <li>MTB trails</li>
        <li>Gravel and forest tracks</li>
      </Typography>
      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        Data
      </Typography>
      <Typography paragraph>
        Trail data will be sourced from{" "}
        <Link
          href="https://www.openstreetmap.org"
          target="_blank"
          rel="noreferrer"
        >
          OpenStreetMap
        </Link>{" "}
        and served as vector tiles and GeoJSON via dedicated OpenBikeMap
        services.
      </Typography>
    </>
  );
};
