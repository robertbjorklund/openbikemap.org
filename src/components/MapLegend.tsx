import CloseIcon from "@mui/icons-material/Close";
import { Box, IconButton, Typography } from "@mui/material";
import * as React from "react";
import { AppConfig } from "../AppConfig";
import MapFilters from "../MapFilters";
import {
  BicycleRouteLineSwatch,
  ImbaLineSwatch,
  MtbRouteLineSwatch,
  StsLineSwatch,
} from "./MapLegendSwatch";

const LEGEND_ROWS = [
  {
    key: "bicycleRoutes",
    label: AppConfig.layerFilters.bicycleRoutes.panelTitle,
    isActive: (filters: MapFilters) => filters.showBicycleRoutes,
    Swatch: BicycleRouteLineSwatch,
  },
  {
    key: "mtbRoutes",
    label: AppConfig.layerFilters.mtbRoutes.panelTitle,
    isActive: (filters: MapFilters) => filters.showMtbRoutes,
    Swatch: MtbRouteLineSwatch,
  },
  {
    key: "mtbTrail",
    label: AppConfig.layerFilters.mtbTrail.railLabel,
    isActive: (filters: MapFilters) => filters.showMtbSts,
    Swatch: StsLineSwatch,
  },
  {
    key: "mtbBikePark",
    label: AppConfig.layerFilters.mtbBikePark.railLabel,
    isActive: (filters: MapFilters) => filters.showMtbImba,
    Swatch: ImbaLineSwatch,
  },
] as const;

export const MapLegend: React.FunctionComponent<{
  mapFilters: MapFilters;
  onClose: () => void;
}> = (props) => {
  return (
    <Box className="openbikemap-legend-panel-inner">
      <Box className="openbikemap-legend-panel-header">
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Map symbols
        </Typography>
        <IconButton
          size="small"
          aria-label="Close legend"
          onClick={props.onClose}
          sx={{ ml: "auto", mr: -0.5 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box component="ul" className="openbikemap-legend-rows" sx={{ m: 0, p: 0 }}>
        {LEGEND_ROWS.map(({ key, label, isActive, Swatch }) => {
          const active = isActive(props.mapFilters);
          return (
            <Box
              component="li"
              key={key}
              className="openbikemap-legend-row"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                opacity: active ? 1 : 0.45,
              }}
            >
              <Swatch muted={!active} />
              <Typography variant="body2" component="span" sx={{ minWidth: 0 }}>
                {label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
