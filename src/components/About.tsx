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
          <strong>{AppConfig.layerFilters.mtbTrail.panelTitle}</strong> — off-road
          singletrack rated with Single Track Scale (S0–S6). Drawn as a solid
          double line (coloured rails with a white centre, like Nordic ski trails
          on OpenSkiMap).
        </li>
        <li>
          <strong>{AppConfig.layerFilters.mtbBikePark.panelTitle}</strong> — bike
          park and flow trails rated with IMBA difficulty (0–4). Drawn as dashed
          lines on a light gray backing. IMBA 4 is orange.
        </li>
        <li>
          <strong>{AppConfig.layerFilters.routes.panelTitle}</strong> — signed
          long-distance cycling routes from local to international level (LCN,
          RCN, NCN, EuroVelo/ICN), drawn as solid lines on asphalt and gravel.
          Multi-stage routes can be browsed and downloaded stage by stage.
        </li>
      </Typography>
      <Typography paragraph sx={{ mt: 1 }}>
        Use the {AppConfig.layerFilters.mtbTrail.railLabel},{" "}
        {AppConfig.layerFilters.mtbBikePark.railLabel}, and{" "}
        {AppConfig.layerFilters.routes.railLabel} buttons in the side panel to
        show, hide, or filter each layer by difficulty or route network.
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
