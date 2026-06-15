import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
} from "@mui/material";
import * as React from "react";
import MapFilters from "../MapFilters";
import {
  BikeActivity,
  IMBA_SCALE_FILTER_LABELS,
  IMBA_SCALE_FILTERS,
  MTB_SCALE_FILTER_LABELS,
  MTB_SCALE_FILTERS,
} from "../types/BikeActivity";
import EventBus from "./EventBus";
import { MtbImbaLegendIcon } from "./MtbImbaLegendIcon";
import { MtbScaleLegendIcon } from "./MtbScaleLegendIcon";

export const MtbFilterContent: React.FunctionComponent<{
  eventBus: EventBus;
  mapFilters: MapFilters;
}> = (props) => {
  const isMtbEnabled = !props.mapFilters.hiddenActivities.includes(
    BikeActivity.Mtb,
  );

  return (
    <>
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
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <MtbScaleLegendIcon scale={scale} />
                <Typography variant="body2" component="span">
                  {MTB_SCALE_FILTER_LABELS[scale]}
                </Typography>
              </span>
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
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <MtbImbaLegendIcon scale={scale} />
                <Typography variant="body2" component="span">
                  {IMBA_SCALE_FILTER_LABELS[scale]}
                </Typography>
              </span>
            }
          />
        ))}
      </FormGroup>
    </>
  );
};
