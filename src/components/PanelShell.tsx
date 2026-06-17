import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import CloseIcon from "@mui/icons-material/Close";
import { Box, Divider, IconButton, Paper, Typography } from "@mui/material";
import * as React from "react";
import { AppConfig } from "../AppConfig";
import { OverflowScrollText } from "./OverflowScrollText";

export const PanelShell: React.FunctionComponent<
  React.PropsWithChildren<{
    title?: string;
    subtitle?: string;
    titleIcon?: React.ReactNode;
    /** Replaces the default brand label in the top bar (e.g. mobile route header). */
    headerCenter?: React.ReactNode;
    hideFeatureTitleSection?: boolean;
    onClose: () => void;
    onBack?: () => void;
    showBack?: boolean;
    /** Down/up arrow toggle for bottom-sheet panels on mobile. */
    useCollapseDownIcon?: boolean;
    sheetCollapsed?: boolean;
    actions?: React.ReactNode;
    footer?: React.ReactNode;
  }>
> = (props) => {
  const showBack = props.showBack ?? true;
  const onBack = props.onBack ?? props.onClose;

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
        className="panel-shell-top-bar"
        sx={{
          px: { xs: 1.5, sm: 2 },
          pt: props.headerCenter ? { xs: 1, sm: 2 } : 2,
          pb: props.headerCenter ? { xs: 1, sm: 1.5 } : 1.5,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 0.5,
        }}
      >
        {showBack && (
          <IconButton
            aria-label={
              props.useCollapseDownIcon && props.sheetCollapsed
                ? "Show details"
                : "Hide details"
            }
            title={
              props.useCollapseDownIcon && props.sheetCollapsed
                ? "Show details"
                : "Hide details"
            }
            onClick={onBack}
            size="small"
            edge="start"
            sx={{ ml: -0.5, flexShrink: 0 }}
          >
            {props.useCollapseDownIcon ? (
              props.sheetCollapsed ? (
                <KeyboardArrowUpIcon />
              ) : (
                <KeyboardArrowDownIcon />
              )
            ) : (
              <ArrowBackIcon />
            )}
          </IconButton>
        )}
        {props.headerCenter ? (
          <Box sx={{ flex: 1, minWidth: 0 }}>{props.headerCenter}</Box>
        ) : (
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
            {AppConfig.panelTitle}
          </Typography>
        )}
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

      {(props.title || props.titleIcon || props.actions || props.subtitle) &&
        !props.hideFeatureTitleSection && (
        <Box
          sx={{
            px: { xs: 1.5, sm: 2 },
            pt: 1.5,
            pb: 1,
            flexShrink: 0,
          }}
        >
          {(props.titleIcon || props.title || props.actions) && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: props.subtitle ? 0.5 : 0,
              }}
            >
              {(props.titleIcon || props.title) && (
                <Box
                  className="panel-context-title"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  {props.titleIcon}
                  {props.title && (
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, flex: 1, minWidth: 0, overflow: "hidden" }}
                    >
                      <OverflowScrollText>{props.title}</OverflowScrollText>
                    </Typography>
                  )}
                </Box>
              )}
              {props.actions && (
                <Box sx={{ flexShrink: 0 }}>{props.actions}</Box>
              )}
            </Box>
          )}
          {props.subtitle && (
            <Typography variant="body2" color="text.secondary">
              {props.subtitle}
            </Typography>
          )}
        </Box>
      )}

      <Box
        className="panel-shell-body"
        sx={{ px: { xs: 1.5, sm: 2 }, py: 2, overflowY: "auto", flex: 1 }}
      >
        {props.children}
      </Box>

      {props.footer && (
        <Box sx={{ flexShrink: 0, borderTop: 1, borderColor: "divider" }}>
          {props.footer}
        </Box>
      )}
    </Paper>
  );
};
