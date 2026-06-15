import { Box, Typography } from "@mui/material";
import * as React from "react";

const TITLE_ICON_SIZE = 48;

export const InfoFeatureHeader: React.FunctionComponent<{
  title?: string;
  subtitle?: string;
  subtitleIcon?: React.ReactNode;
  icon?: React.ReactNode;
}> = (props) => {
  return (
    <>
      {(props.icon || props.title) && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mb: props.subtitle ? 0.5 : 1,
          }}
        >
          {props.icon}
          {props.title && (
            <Typography variant="h5" component="h2" sx={{ mb: 0, flex: 1 }}>
              {props.title}
            </Typography>
          )}
        </Box>
      )}
      {props.subtitle && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 1,
            color: "text.secondary",
          }}
        >
          {props.subtitleIcon}
          <Typography color="inherit" sx={{ mb: 0 }}>
            {props.subtitle}
          </Typography>
        </Box>
      )}
    </>
  );
};

export { TITLE_ICON_SIZE };
