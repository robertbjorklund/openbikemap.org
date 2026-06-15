import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import * as React from "react";
import MapFilters from "../MapFilters";
import { BikeActivity } from "../types/BikeActivity";
import {
  ROUTE_NETWORK_FILTERS,
  ROUTE_NETWORK_LABELS,
  ROUTE_NETWORK_NOT_SET,
  type RouteNetworkFilter,
} from "../types/RouteNetwork";
import EventBus from "./EventBus";
import { RouteNetworkLegendIcon } from "./RouteNetworkLegendIcon";

function routeNetworkLabel(network: RouteNetworkFilter): string {
  if (network === ROUTE_NETWORK_NOT_SET) {
    return "No network tag";
  }
  return ROUTE_NETWORK_LABELS[network];
}

function routeNetworkForIcon(network: RouteNetworkFilter): string | null {
  return network === ROUTE_NETWORK_NOT_SET ? null : network;
}

export const RoutesFilterContent: React.FunctionComponent<{
  eventBus: EventBus;
  mapFilters: MapFilters;
}> = (props) => {
  const isRoutesEnabled = !props.mapFilters.hiddenActivities.includes(
    BikeActivity.Routes,
  );

  return (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Signed long-distance cycling routes (asphalt and gravel).
      </Typography>

      <FormControlLabel
        control={
          <Checkbox
            checked={isRoutesEnabled}
            onChange={() => props.eventBus.toggleActivity(BikeActivity.Routes)}
          />
        }
        label="Show on map"
      />

      <Typography variant="body2" sx={{ pt: 1, mb: 0.5, fontWeight: 500 }}>
        Route network
      </Typography>

      <FormGroup>
        {ROUTE_NETWORK_FILTERS.map((network) => (
          <FormControlLabel
            key={network}
            sx={{ display: "flex", ml: 0 }}
            control={
              <Checkbox
                size="small"
                checked={
                  isRoutesEnabled &&
                  !props.mapFilters.hiddenRouteNetworks.includes(network)
                }
                onChange={() => props.eventBus.toggleRouteNetwork(network)}
              />
            }
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <RouteNetworkLegendIcon
                  network={routeNetworkForIcon(network)}
                />
                <Typography variant="body2">
                  {routeNetworkLabel(network)}
                </Typography>
              </Box>
            }
          />
        ))}
      </FormGroup>
    </>
  );
};
