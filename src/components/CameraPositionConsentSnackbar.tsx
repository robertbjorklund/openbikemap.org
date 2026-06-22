import { Button, Snackbar } from "@mui/material";
import * as React from "react";
import { AppConfig } from "../AppConfig";

export const CameraPositionConsentSnackbar: React.FunctionComponent<{
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
}> = (props) => (
  <Snackbar
    open={props.open}
    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    message={`Remember map position, zoom, and orientation on ${AppConfig.appName}?`}
    action={
      <>
        <Button color="inherit" size="small" onClick={props.onDecline}>
          Not now
        </Button>
        <Button color="inherit" size="small" onClick={props.onAccept}>
          Remember
        </Button>
      </>
    }
  />
);
