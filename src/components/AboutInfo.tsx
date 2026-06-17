import { Divider, Typography } from "@mui/material";
import * as React from "react";
import { About } from "./About";
import { CookiePolicy } from "./CookiePolicy";
import { Credits } from "./Credits";
import EventBus from "./EventBus";

export const AboutInfo: React.FunctionComponent<{ eventBus: EventBus }> = (
  props,
) => {
  return (
    <>
      <About eventBus={props.eventBus} />

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>
        Credits
      </Typography>
      <Credits />

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>
        Cookie policy
      </Typography>
      <CookiePolicy />
    </>
  );
};
