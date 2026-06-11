import { Box, Typography } from "@mui/material";
import * as React from "react";

const TITLE_ICON_SIZE = 48;

export const InfoFeatureHeader: React.FunctionComponent<{
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}> = (props) => {
  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          mb: props.subtitle ? 0.5 : 1,
        }}
      >
        {props.icon}
        <Typography variant="h5" component="h2" sx={{ mb: 0, flex: 1 }}>
          {props.title}
        </Typography>
      </Box>
      {props.subtitle && (
        <Typography color="text.secondary" gutterBottom>
          {props.subtitle}
        </Typography>
      )}
    </>
  );
};

export { TITLE_ICON_SIZE };
