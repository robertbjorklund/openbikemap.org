import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Switch,
  Typography,
} from "@mui/material";
import * as React from "react";
import { AppConfig } from "../AppConfig";
import MapFilters from "../MapFilters";
import {
  BICYCLE_ROUTE_NETWORK_FILTERS,
  ROUTE_NETWORK_LABELS,
} from "../types/RouteNetwork";
import EventBus from "./EventBus";
import { dimmedFilterControlSx } from "./FilterControlStyles";
import { FilterBulkActions } from "./FilterBulkActions";
import { RouteNetworkLegendIcon } from "./RouteNetworkLegendIcon";

export const RoutesFilterContent: React.FunctionComponent<{
  eventBus: EventBus;
  mapFilters: MapFilters;
}> = (props) => {
  const bicycleEnabled = props.mapFilters.showBicycleRoutes;
  const mtbRoutesEnabled = props.mapFilters.showMtbRoutes;
  const { hiddenRouteNetworks } = props.mapFilters;
  const { bicycleRoutes, mtbRoutes } = AppConfig.layerFilters;

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            mb: 0.5,
          }}
        >
          <Typography variant="subtitle2">{bicycleRoutes.panelTitle}</Typography>
          <Switch
            size="small"
            checked={bicycleEnabled}
            onChange={() => props.eventBus.toggleBicycleRoutesGroup()}
            inputProps={{ "aria-label": bicycleRoutes.showSwitchAriaLabel }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {bicycleRoutes.subtitle}
        </Typography>

        <FilterBulkActions
          disabled={!bicycleEnabled}
          allSelected={hiddenRouteNetworks.length === 0}
          noneSelected={
            hiddenRouteNetworks.length === BICYCLE_ROUTE_NETWORK_FILTERS.length
          }
          onSelectAll={() => props.eventBus.showAllRouteNetworks()}
          onClearAll={() => props.eventBus.hideAllRouteNetworks()}
        />

        <FormGroup>
          {BICYCLE_ROUTE_NETWORK_FILTERS.map((network) => (
            <FormControlLabel
              key={network}
              sx={dimmedFilterControlSx(bicycleEnabled)}
              control={
                <Checkbox
                  size="small"
                  checked={
                    !props.mapFilters.hiddenRouteNetworks.includes(network)
                  }
                  onChange={() => props.eventBus.toggleRouteNetwork(network)}
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <RouteNetworkLegendIcon network={network} />
                  <Typography variant="body2">
                    {ROUTE_NETWORK_LABELS[network]}
                  </Typography>
                </Box>
              }
            />
          ))}
        </FormGroup>
      </Box>

      <Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            mb: 0.5,
          }}
        >
          <Typography variant="subtitle2">{mtbRoutes.panelTitle}</Typography>
          <Switch
            size="small"
            checked={mtbRoutesEnabled}
            onChange={() => props.eventBus.toggleMtbRoutesGroup()}
            inputProps={{ "aria-label": mtbRoutes.showSwitchAriaLabel }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          {mtbRoutes.subtitle}
        </Typography>
      </Box>
    </>
  );
};
