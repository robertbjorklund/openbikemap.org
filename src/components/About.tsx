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
        <li>
          MTB trails — off-road singletrack rated with Single Track Scale
          (S0–S6) and/or IMBA difficulty (0–4). Trails are drawn as dashed
          lines; the highest grades (S5, S6, IMBA 4) are highlighted in orange.
        </li>
        <li>
          Bicycle routes — signed long-distance cycling routes from local to
          international level (LCN, RCN, NCN, EuroVelo/ICN), on asphalt and
          gravel. Multi-stage routes can be browsed and downloaded stage by
          stage.
        </li>
      </Typography>
      <Typography paragraph sx={{ mt: 1 }}>
        Use the MTB and Bicycle routes buttons in the side panel to show, hide,
        or filter each layer by difficulty or route network.
      </Typography>
      <Typography paragraph sx={{ mt: 2 }}>
        Urban cycle paths and footways are intentionally excluded. The terrain
        basemap is provided by{" "}
        <Link href="https://openfreemap.org" target="_blank" rel="noreferrer">
          OpenFreeMap
        </Link>{" "}
        with hillshaded relief from{" "}
        <Link href="https://mapterhorn.com/" target="_blank" rel="noreferrer">
          Mapterhorn
        </Link>
        .
      </Typography>
      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        Data
      </Typography>
      <Typography paragraph>
        Trail and route data is sourced from{" "}
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
