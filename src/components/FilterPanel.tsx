import {

  Checkbox,

  FormControlLabel,

  FormGroup,

  Typography,

} from "@mui/material";

import { Box } from "@mui/system";

import * as React from "react";

import MapFilters from "../MapFilters";

import {

  BIKE_ACTIVITY_LABELS,

  BikeActivity,

  MTB_SCALE_FILTER_LABELS,

  MTB_SCALE_FILTERS,

} from "../types/BikeActivity";

import {

  ROUTE_NETWORK_FILTERS,

  ROUTE_NETWORK_LABELS,

  ROUTE_NETWORK_NOT_SET,

  routeNetworkColor,

  type RouteNetworkFilter,

} from "../types/RouteNetwork";

import EventBus from "./EventBus";

import { MtbScaleLegendIcon } from "./MtbScaleLegendIcon";

import { PanelShell } from "./PanelShell";



function routeNetworkLabel(network: RouteNetworkFilter): string {

  if (network === ROUTE_NETWORK_NOT_SET) {

    return "No network tag";

  }

  return ROUTE_NETWORK_LABELS[network];

}



function routeNetworkSwatchColor(network: RouteNetworkFilter): string {

  if (network === ROUTE_NETWORK_NOT_SET) {

    return routeNetworkColor(null);

  }

  return routeNetworkColor(network);

}



export const FilterPanel: React.FunctionComponent<{

  eventBus: EventBus;

  mapFilters: MapFilters;

}> = (props) => {

  const isMtbEnabled = !props.mapFilters.hiddenActivities.includes(

    BikeActivity.Mtb,

  );

  const isRoutesEnabled = !props.mapFilters.hiddenActivities.includes(

    BikeActivity.Routes,

  );



  return (

    <PanelShell

      title="Filter"

      onClose={() => props.eventBus.closeMenu()}

    >

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>

        <strong>MTB</strong> shows off-road trails by difficulty (S0–S6).{" "}

        <strong>Bicycle routes</strong> are signed long-distance cycling routes

        (asphalt and gravel). Urban cycle paths and footways are not included.

      </Typography>



      <Typography variant="subtitle1" sx={{ mb: 1 }}>

        Activities

      </Typography>

      <FormGroup sx={{ pl: 1 }}>

        <Box>

          <FormControlLabel

            control={

              <Checkbox

                checked={isMtbEnabled}

                onChange={() => props.eventBus.toggleActivity(BikeActivity.Mtb)}

              />

            }

            label={BIKE_ACTIVITY_LABELS[BikeActivity.Mtb]}

          />

          <FormGroup sx={{ pl: 3, pb: 0.5 }}>

            {MTB_SCALE_FILTERS.map((scale) => (

              <FormControlLabel

                key={scale}

                sx={{ display: "flex", ml: 0 }}

                control={

                  <Checkbox

                    size="small"

                    checked={

                      isMtbEnabled &&

                      !props.mapFilters.hiddenMtbScales.includes(scale)

                    }

                    onChange={() => props.eventBus.toggleMtbScale(scale)}

                  />

                }

                label={

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>

                    <MtbScaleLegendIcon scale={scale} />

                    <Typography variant="body2">

                      {MTB_SCALE_FILTER_LABELS[scale]}

                    </Typography>

                  </Box>

                }

              />

            ))}

          </FormGroup>

        </Box>



        <Box>

          <FormControlLabel

            control={

              <Checkbox

                checked={isRoutesEnabled}

                onChange={() =>

                  props.eventBus.toggleActivity(BikeActivity.Routes)

                }

              />

            }

            label={BIKE_ACTIVITY_LABELS[BikeActivity.Routes]}

          />

          <Box sx={{ pl: 3, pb: 0.5 }}>

            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>

              Route network

            </Typography>

            <FormGroup sx={{ pb: 1 }}>

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

                      onChange={() =>

                        props.eventBus.toggleRouteNetwork(network)

                      }

                    />

                  }

                  label={

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>

                      <Box

                        sx={{

                          width: 20,

                          height: 4,

                          borderRadius: 1,

                          bgcolor: routeNetworkSwatchColor(network),

                          flexShrink: 0,

                        }}

                      />

                      <Typography variant="body2">

                        {routeNetworkLabel(network)}

                      </Typography>

                    </Box>

                  }

                />

              ))}

            </FormGroup>

          </Box>

        </Box>

      </FormGroup>

    </PanelShell>

  );

};


