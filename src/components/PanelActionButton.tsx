import { Box, IconButton, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import * as React from "react";

export const PanelActionButton: React.FunctionComponent<{
  label: string;
  icon: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  href?: string;
  disabled?: boolean;
  color?: string;
}> = (props) => {
  const { label, icon, onClick, href, disabled, color } = props;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0.5,
        width: 80,
        flexShrink: 0,
      }}
    >
      <IconButton
        aria-label={label}
        disabled={disabled}
        onClick={onClick}
        {...(href
          ? {
              component: "a" as const,
              href,
              target: "_blank",
              rel: "noopener noreferrer",
            }
          : {})}
        sx={{
          width: 44,
          height: 44,
          border: "1px solid",
          borderColor: disabled ? "action.disabled" : (color ?? "divider"),
          color: disabled ? "action.disabled" : (color ?? "text.primary"),
          "&:hover": {
            borderColor: disabled ? "action.disabled" : (color ?? "text.primary"),
            backgroundColor: disabled
              ? undefined
              : color
                ? alpha(color, 0.08)
                : "action.hover",
          },
        }}
      >
        {icon}
      </IconButton>
      <Typography
        variant="caption"
        color="text.secondary"
        textAlign="center"
        sx={{ lineHeight: 1.2 }}
      >
        {label}
      </Typography>
    </Box>
  );
};
