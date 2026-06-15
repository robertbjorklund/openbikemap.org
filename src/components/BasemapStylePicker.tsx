import { Box, Typography } from "@mui/material";
import * as React from "react";
import { MapStyle } from "../MapStyle";
import { BASEMAP_OPTIONS } from "./BasemapOptions";
import EventBus from "./EventBus";

export const BasemapStylePicker: React.FunctionComponent<{
  mapStyle: MapStyle;
  eventBus: EventBus;
  sectionTitle?: string;
  showDescription?: boolean;
  onStyleSelected?: () => void;
}> = (props) => {
  const sectionTitle = props.sectionTitle ?? "Base map";
  const showDescription = props.showDescription ?? true;

  return (
    <>
      <Typography variant="subtitle1" sx={{ mb: showDescription ? 0.5 : 1 }}>
        {sectionTitle}
      </Typography>
      {showDescription && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Trails and routes are shown on top of the base map.
        </Typography>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 1.5,
        }}
        role="radiogroup"
        aria-label="Base map"
      >
        {BASEMAP_OPTIONS.map((option) => {
          const selected = props.mapStyle === option.style;
          return (
            <Box
              key={option.style}
              component="button"
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${option.label}: ${option.description}`}
              onClick={() => {
                props.eventBus.setMapStyle(option.style);
                props.onStyleSelected?.();
              }}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                p: 0,
                m: 0,
                border: 2,
                borderColor: selected ? "primary.main" : "divider",
                borderRadius: 2,
                bgcolor: "background.paper",
                cursor: "pointer",
                overflow: "hidden",
                textAlign: "left",
                transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                boxShadow: selected ? 1 : 0,
                "&:hover": {
                  borderColor: selected ? "primary.main" : "text.disabled",
                },
              }}
            >
              <Box
                sx={{
                  height: 52,
                  background: option.preview,
                }}
                aria-hidden
              />
              <Box sx={{ px: 1.25, py: 1 }}>
                <Typography variant="body2" fontWeight={600} lineHeight={1.3}>
                  {option.label}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  lineHeight={1.3}
                >
                  {option.description}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </>
  );
};
