import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
} from "@mui/material";
import * as React from "react";
import MapFilters from "../MapFilters";
import {
  ROUTE_NETWORK_FILTERS,
  ROUTE_NETWORK_LABELS,
  ROUTE_NETWORK_NOT_SET,
  type RouteNetworkFilter,
} from "../types/RouteNetwork";
import EventBus from "./EventBus";
import { dimmedFilterControlSx } from "./FilterControlStyles";
import { FilterBulkActions } from "./FilterBulkActions";
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
  const groupEnabled = props.mapFilters.showRoutes;
  const { hiddenRouteNetworks } = props.mapFilters;

  return (
    <>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, pb: 0.5 }}>
        Route network
      </Typography>

      <FilterBulkActions
        disabled={!groupEnabled}
        allSelected={hiddenRouteNetworks.length === 0}
        noneSelected={
          hiddenRouteNetworks.length === ROUTE_NETWORK_FILTERS.length
        }
        onSelectAll={() => props.eventBus.showAllRouteNetworks()}
        onClearAll={() => props.eventBus.hideAllRouteNetworks()}
      />

      <FormGroup>
        {ROUTE_NETWORK_FILTERS.map((network) => (
          <FormControlLabel
            key={network}
            sx={dimmedFilterControlSx(groupEnabled)}
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
