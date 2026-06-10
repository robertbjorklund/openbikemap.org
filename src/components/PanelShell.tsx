import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, IconButton, Paper, Typography } from "@mui/material";
import * as React from "react";

export const PanelShell: React.FunctionComponent<
  React.PropsWithChildren<{
    title: string;
    onBack: () => void;
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
          p: 2,
          pb: 1,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 0.5,
        }}
      >
        <IconButton aria-label="Back to menu" onClick={props.onBack} edge="start">
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="h6"
          sx={{ overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}
        >
          {props.title}
        </Typography>
      </Box>

      {props.actions && (
        <Box sx={{ px: 2, pb: 1.5, flexShrink: 0 }}>{props.actions}</Box>
      )}

      <Box sx={{ px: 2, pb: 2, overflowY: "auto", flex: 1 }}>{props.children}</Box>

      {props.footer && (
        <Box sx={{ flexShrink: 0, borderTop: 1, borderColor: "divider" }}>
          {props.footer}
        </Box>
      )}
    </Paper>
  );
};
