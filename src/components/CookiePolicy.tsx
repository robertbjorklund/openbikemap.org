import { Link, Typography } from "@mui/material";
import * as React from "react";
import { AppConfig } from "../AppConfig";

export const CookiePolicy: React.FunctionComponent = () => {
  return (
    <>
      <Typography paragraph>
        {AppConfig.appName} is designed to work with minimal tracking. This page
        explains what is stored in your browser and what third-party services
        may set when you use the map.
      </Typography>

      <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
        Local storage on your device
      </Typography>
      <Typography paragraph>
        We save a few preferences locally in your browser (not sent to our
        servers): map position and zoom, basemap choice, and unit system
        (metric or imperial). You can clear this at any time through your
        browser settings.
      </Typography>

      <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
        Third-party map services
      </Typography>
      <Typography paragraph>
        When you load the map, tile and font requests are sent to external
        providers such as{" "}
        <Link href="https://openfreemap.org/" target="_blank" rel="noreferrer">
          OpenFreeMap
        </Link>{" "}
        and, if you choose satellite view,{" "}
        <Link href="https://www.esri.com/" target="_blank" rel="noreferrer">
          Esri
        </Link>
        . Those services may use cookies or similar technologies according to
        their own policies.
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
