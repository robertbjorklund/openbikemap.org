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
import {
  FeatureType,
  type MapFeature,
  type TrailFeature,
} from "../types/FeatureTypes";
import { getFeatureDisplayTitle } from "../utils/featureDisplayTitle";
import { getMapFeatureKind } from "../utils/MapFeatureKind";
import { MapFeatureKindRailIcon } from "./MapFeatureKindRailIcon";

export const TrailDisambiguationDialog: React.FunctionComponent<{
  open: boolean;
  candidates: MapFeature[];
  onSelect: (feature: MapFeature) => void;
  onClose: () => void;
}> = (props) => {
  const trails = props.candidates.filter(
    (feature): feature is TrailFeature =>
      feature.properties.type === FeatureType.Trail,
  );

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="trail-disambiguation-title"
    >
      <DialogTitle
        id="trail-disambiguation-title"
        sx={{ display: "flex", alignItems: "center", pr: 1 }}
      >
        Several trails here
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
          Choose which trail you want to open.
        </Typography>
        <List disablePadding>
          {trails.map((feature) => {
            const kind = getMapFeatureKind(feature);
            return (
              <ListItemButton
                key={feature.properties.id}
                onClick={() => props.onSelect(feature)}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <MapFeatureKindRailIcon kind={kind.kind} size={28} />
                </ListItemIcon>
                <ListItemText
                  primary={getFeatureDisplayTitle(feature)}
                  secondary={kind.label}
                />
              </ListItemButton>
            );
          })}
        </List>
      </DialogContent>
    </Dialog>
  );
};
