import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
} from "@mui/material";
import * as React from "react";
import MapFilters from "../MapFilters";
import {
  IMBA_SCALE_FILTER_LABELS,
  IMBA_SCALE_FILTERS,
} from "../types/BikeActivity";
import EventBus from "./EventBus";
import { dimmedFilterControlSx } from "./FilterControlStyles";
import { MtbImbaLegendIcon } from "./MtbImbaLegendIcon";

export const ImbaFilterContent: React.FunctionComponent<{
  eventBus: EventBus;
  mapFilters: MapFilters;
}> = (props) => {
  const groupEnabled = props.mapFilters.showMtbImba;

  return (
    <FormGroup>
      {IMBA_SCALE_FILTERS.map((scale) => (
        <FormControlLabel
          key={`imba-${scale}`}
          sx={dimmedFilterControlSx(groupEnabled)}
          control={
            <Checkbox
              size="small"
              checked={!props.mapFilters.hiddenMtbImbaScales.includes(scale)}
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
  );
};
