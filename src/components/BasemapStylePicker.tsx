import { Box, Typography } from "@mui/material";
import * as React from "react";
import { MapStyle } from "../MapStyle";
import { BASEMAP_OPTIONS } from "./BasemapOptions";
import EventBus from "./EventBus";

export const BasemapStylePicker: React.FunctionComponent<{
  mapStyle: MapStyle;
  eventBus: EventBus;
  sectionTitle?: string;
  showSectionTitle?: boolean;
  showDescription?: boolean;
  layout?: "grid" | "row";
  onStyleSelected?: () => void;
}> = (props) => {
  const showSectionTitle = props.showSectionTitle ?? props.sectionTitle !== undefined;
  const showDescription = props.showDescription ?? true;
  const layout = props.layout ?? "grid";

  return (
    <>
      {showSectionTitle && props.sectionTitle && (
        <Typography variant="subtitle1" sx={{ mb: showDescription ? 0.5 : 1 }}>
          {props.sectionTitle}
        </Typography>
      )}
      {showDescription && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Trails and routes are shown on top of the base map.
        </Typography>
      )}

      <Box
        sx={{
          display: layout === "row" ? "flex" : "grid",
          flexDirection: layout === "row" ? "column" : undefined,
          gridTemplateColumns:
            layout === "grid" ? "repeat(2, minmax(0, 1fr))" : undefined,
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
                flexDirection: layout === "row" ? "row" : "column",
                alignItems: layout === "row" ? "center" : "stretch",
                gap: layout === "row" ? 1.5 : 0,
                p: layout === "row" ? 1 : 0,
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
                  width: layout === "row" ? 56 : "100%",
                  height: layout === "row" ? 56 : 52,
                  flexShrink: 0,
                  borderRadius: layout === "row" ? 1 : 0,
                  background: option.preview,
                }}
                aria-hidden
              />
              <Box
                sx={{
                  px: layout === "row" ? 0 : 1.25,
                  py: layout === "row" ? 0 : 1,
                  pr: layout === "row" ? 0.5 : undefined,
                  flex: layout === "row" ? 1 : undefined,
                  minWidth: 0,
                }}
              >
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
