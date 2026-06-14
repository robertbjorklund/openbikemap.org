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

  IMBA_SCALE_FILTER_LABELS,

  IMBA_SCALE_FILTERS,

  MTB_SCALE_FILTER_LABELS,

  MTB_SCALE_FILTERS,

} from "../types/BikeActivity";

import {

  ROUTE_NETWORK_FILTERS,

  ROUTE_NETWORK_LABELS,

  ROUTE_NETWORK_NOT_SET,

  type RouteNetworkFilter,

} from "../types/RouteNetwork";

import EventBus from "./EventBus";

import { MtbScaleLegendIcon } from "./MtbScaleLegendIcon";
import { MtbImbaLegendIcon } from "./MtbImbaLegendIcon";
import { RouteNetworkLegendIcon } from "./RouteNetworkLegendIcon";

import { PanelShell } from "./PanelShell";



function routeNetworkLabel(network: RouteNetworkFilter): string {

  if (network === ROUTE_NETWORK_NOT_SET) {

    return "No network tag";

  }

  return ROUTE_NETWORK_LABELS[network];

}



function routeNetworkForIcon(network: RouteNetworkFilter): string | null {

  return network === ROUTE_NETWORK_NOT_SET ? null : network;

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

      <Box

        sx={{

          display: "grid",

          gridTemplateColumns: "1fr 1fr",

          gap: 3,

          alignItems: "start",

        }}

      >

        <Box

          sx={{

            pr: 2,

            borderRight: 1,

            borderColor: "divider",

            minWidth: 0,

          }}

        >

          <Typography variant="subtitle1" sx={{ mb: 0.5, fontWeight: 600 }}>

            {BIKE_ACTIVITY_LABELS[BikeActivity.Mtb]}

          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>

            Off-road trails by difficulty (S0–S6 or IMBA 0–4).

          </Typography>

          <FormControlLabel

            control={

              <Checkbox

                checked={isMtbEnabled}

                onChange={() => props.eventBus.toggleActivity(BikeActivity.Mtb)}

              />

            }

            label="Show on map"

          />

          <Typography variant="body2" sx={{ pt: 1, pb: 0.25, fontWeight: 500 }}>

            STS — Single Track Scale

          </Typography>

          <FormGroup sx={{ pb: 0.5 }}>

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

          <Typography variant="body2" sx={{ pt: 0.5, pb: 0.25, fontWeight: 500 }}>

            IMBA — International Mountain Bicycling Association

          </Typography>

          <FormGroup>

            {IMBA_SCALE_FILTERS.map((scale) => (

              <FormControlLabel

                key={`imba-${scale}`}

                sx={{ display: "flex", ml: 0 }}

                control={

                  <Checkbox

                    size="small"

                    checked={

                      isMtbEnabled &&

                      !props.mapFilters.hiddenMtbImbaScales.includes(scale)

                    }

                    onChange={() => props.eventBus.toggleMtbImbaScale(scale)}

                  />

                }

                label={

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>

                    <MtbImbaLegendIcon scale={scale} />

                    <Typography variant="body2">

                      {IMBA_SCALE_FILTER_LABELS[scale]}

                    </Typography>

                  </Box>

                }

              />

            ))}

          </FormGroup>

        </Box>

        <Box sx={{ minWidth: 0 }}>

          <Typography variant="subtitle1" sx={{ mb: 0.5, fontWeight: 600 }}>

            {BIKE_ACTIVITY_LABELS[BikeActivity.Routes]}

          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>

            Signed long-distance cycling routes (asphalt and gravel).

          </Typography>

          <FormControlLabel

            control={

              <Checkbox

                checked={isRoutesEnabled}

                onChange={() =>

                  props.eventBus.toggleActivity(BikeActivity.Routes)

                }

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

                    onChange={() =>

                      props.eventBus.toggleRouteNetwork(network)

                    }

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

        </Box>

      </Box>

    </PanelShell>

  );

};


