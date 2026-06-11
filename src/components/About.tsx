import { Link, Typography } from "@mui/material";
import * as React from "react";
import { AppConfig } from "../AppConfig";
import EventBus from "./EventBus";

export const About: React.FunctionComponent<{ eventBus: EventBus }> = () => {
  return (
    <>
      <Typography paragraph>{AppConfig.tagline}</Typography>
      <Typography variant="h6" gutterBottom>
        What&apos;s on the map
      </Typography>
      <Typography component="ul" sx={{ pl: 2 }}>
        <li>Signed bicycle routes (lcn/ncn/rcn/icn) — asphalt and gravel</li>
        <li>MTB trails by difficulty (mtb:scale S0–S6)</li>
      </Typography>
      <Typography paragraph sx={{ mt: 2 }}>
        Urban cycle paths and footways are intentionally excluded. The basemap is
        provided by{" "}
        <Link href="https://openfreemap.org" target="_blank" rel="noreferrer">
          OpenFreeMap
        </Link>
        .
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
