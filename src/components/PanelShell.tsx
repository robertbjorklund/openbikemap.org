import CloseIcon from "@mui/icons-material/Close";
import { Box, Divider, IconButton, Paper, Typography } from "@mui/material";
import * as React from "react";
import { AppConfig } from "../AppConfig";

export const PanelShell: React.FunctionComponent<
  React.PropsWithChildren<{
    title?: string;
    onClose: () => void;
    actions?: React.ReactNode;
    footer?: React.ReactNode;
  }>
> = (props) => {
  return (
    <Paper
      elevation={3}
      className="side-panel-inner"
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        borderRadius: 0,
      }}
    >
      <Box
        sx={{
          px: 2,
          pt: 2,
          pb: 1.5,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            flex: 1,
            fontWeight: 700,
            backgroundImage: `linear-gradient(to right, ${AppConfig.primaryColor}, ${AppConfig.accentColor})`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {AppConfig.appName}
        </Typography>
        <IconButton
          aria-label="Close panel"
          onClick={props.onClose}
          edge="end"
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider />

      {(props.title || props.actions) && (
        <Box sx={{ px: 2, pt: 1.5, pb: props.actions ? 1 : 0, flexShrink: 0 }}>
          {props.title && (
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
              {props.title}
            </Typography>
          )}
          {props.actions}
        </Box>
      )}

      <Box sx={{ px: 2, py: 2, overflowY: "auto", flex: 1 }}>{props.children}</Box>

      {props.footer && (
        <Box sx={{ flexShrink: 0, borderTop: 1, borderColor: "divider" }}>
          {props.footer}
        </Box>
      )}
    </Paper>
  );
};
