import { Button } from "@mui/material";
import * as React from "react";
import { ctaButtonSx } from "../uiTheme";

export const PanelActionButton: React.FunctionComponent<{
  label: string;
  icon: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  href?: string;
  disabled?: boolean;
}> = (props) => {
  const { label, icon, onClick, href, disabled } = props;

  return (
    <Button
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      startIcon={icon}
      {...(href
        ? {
            component: "a" as const,
            href,
            target: "_blank",
            rel: "noopener noreferrer",
          }
        : {})}
      sx={ctaButtonSx}
    >
      {label}
    </Button>
  );
};
