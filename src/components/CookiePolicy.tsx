import { Link, Typography } from "@mui/material";
import * as React from "react";
import { AppConfig } from "../AppConfig";

export const CookiePolicy: React.FunctionComponent = () => {
  return (
    <>
      <Typography paragraph>
        {AppConfig.appName} is designed to work with minimal tracking. This page
        explains what is stored in your browser and what third-party services
        may receive when you use the map.
      </Typography>

      <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
        Local storage on your device
      </Typography>
      <Typography paragraph>
        We save a few preferences locally in your browser (not sent to our
        servers): map position, zoom, bearing, pitch, basemap choice (terrain or
        satellite), and unit system (metric or imperial). MTB and bicycle route
        filter settings apply for your current session only and are reset when
        you reload the page. You can clear stored preferences at any time
        through your browser settings.
      </Typography>

      <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
        Links and browser history
      </Typography>
      <Typography paragraph>
        When you select a trail or route, or add map markers, that choice may be
        encoded in the page URL so you can bookmark or share a link. The URL is
        stored in your browser history like any other website address.
      </Typography>

      <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
        OpenBikeMap services
      </Typography>
      <Typography paragraph>
        To show MTB trails and bicycle routes, search, and feature details, the
        app sends requests to {AppConfig.appName} services (API and vector
        tiles). Those requests may be logged on our servers in the usual way for
        operating a web service, but we do not use first-party analytics or
        advertising cookies.
      </Typography>

      <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
        Third-party map services
      </Typography>
      <Typography paragraph>
        When you load the map, tile and font requests are also sent to external
        providers such as{" "}
        <Link href="https://openfreemap.org/" target="_blank" rel="noreferrer">
          OpenFreeMap
        </Link>
        ,{" "}
        <Link
          href="https://www.openmaptiles.org/"
          target="_blank"
          rel="noreferrer"
        >
          OpenMapTiles
        </Link>
        , and, if you choose terrain view,{" "}
        <Link href="https://mapterhorn.com/" target="_blank" rel="noreferrer">
          Mapterhorn
        </Link>
        . If you choose satellite view,{" "}
        <Link href="https://www.esri.com/" target="_blank" rel="noreferrer">
          Esri
        </Link>
        . Those services may use cookies or similar technologies according to
        their own policies.
      </Typography>

      <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
        Your location
      </Typography>
      <Typography paragraph>
        If you use the map&apos;s location control, your browser may ask for
        permission to access your device location. That information is handled by
        your browser and is not sent to {AppConfig.appName} for storage.
      </Typography>

      <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
        Analytics and advertising
      </Typography>
      <Typography paragraph>
        {AppConfig.appName} does not use first-party analytics or advertising
        cookies.
      </Typography>

      <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
        Contact
      </Typography>
      <Typography paragraph>
        Questions about this policy can be sent via the project page at{" "}
        <Link
          href={`https://${AppConfig.appDomain}/?about`}
          target="_blank"
          rel="noreferrer"
        >
          {AppConfig.appDomain}
        </Link>
        .
      </Typography>
    </>
  );
};
