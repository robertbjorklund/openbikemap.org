import CloseIcon from "@mui/icons-material/Close";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import * as React from "react";
import { AppConfig } from "../AppConfig";
import { formatOsmColourLabel } from "../types/MtbRouteColors";
import {
  ROUTE_NETWORK_LABELS,
  RouteNetwork,
  formatRouteDisplayTitle,
} from "../types/RouteNetwork";
import {
  FeatureType,
  type MapFeature,
  type RouteFeature,
} from "../types/FeatureTypes";
import { MtbRouteLegendIcon } from "./MtbRouteLegendIcon";
import { RouteNetworkLegendIcon } from "./RouteNetworkLegendIcon";

function routeCandidateSubtitle(feature: RouteFeature): string {
  if (feature.properties.osmRouteType === "mtb") {
    const colour = formatOsmColourLabel(feature.properties.osmColour);
    return colour
      ? `${AppConfig.layerFilters.mtbRoutes.panelTitle} · ${colour}`
      : AppConfig.layerFilters.mtbRoutes.panelTitle;
  }

  const network = feature.properties.network?.trim().toLowerCase();
  if (network && network in ROUTE_NETWORK_LABELS) {
    return ROUTE_NETWORK_LABELS[network as RouteNetwork];
  }

  return AppConfig.layerFilters.bicycleRoutes.panelTitle;
}

function routeCandidateIcon(feature: RouteFeature): React.ReactNode {
  if (feature.properties.osmRouteType === "mtb") {
    return (
      <MtbRouteLegendIcon
        osmColour={feature.properties.osmColour}
        size={28}
      />
    );
  }

  return (
    <RouteNetworkLegendIcon
      network={feature.properties.network}
      name={feature.properties.name}
      label={feature.properties.ref}
      size={28}
    />
  );
}

export const RouteDisambiguationDialog: React.FunctionComponent<{
  open: boolean;
  candidates: MapFeature[];
  onSelect: (feature: MapFeature) => void;
  onClose: () => void;
}> = (props) => {
  const routes = props.candidates.filter(
    (feature): feature is RouteFeature =>
      feature.properties.type === FeatureType.Route,
  );

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="route-disambiguation-title"
    >
      <DialogTitle
        id="route-disambiguation-title"
        sx={{ display: "flex", alignItems: "center", pr: 1 }}
      >
        Several routes here
        <IconButton
          aria-label="Close"
          onClick={props.onClose}
          sx={{ ml: "auto" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ px: 2, pt: 1.5, pb: 1 }}
        >
          Choose which signed route you want to open.
        </Typography>
        <List disablePadding>
          {routes.map((feature) => {
            const title = formatRouteDisplayTitle(
              feature.properties.name,
              feature.properties.ref,
            );
            return (
              <ListItemButton
                key={routeDisambiguationListKey(feature)}
                onClick={() => props.onSelect(feature)}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {routeCandidateIcon(feature)}
                </ListItemIcon>
                <ListItemText
                  primary={title}
                  secondary={routeCandidateSubtitle(feature)}
                />
              </ListItemButton>
            );
          })}
        </List>
      </DialogContent>
    </Dialog>
  );
};

function routeDisambiguationListKey(feature: RouteFeature): string {
  return feature.properties.groupId ?? feature.properties.id;
}
