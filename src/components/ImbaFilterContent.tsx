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
import { FilterBulkActions } from "./FilterBulkActions";
import { MtbImbaLegendIcon } from "./MtbImbaLegendIcon";

export const ImbaFilterContent: React.FunctionComponent<{
  eventBus: EventBus;
  mapFilters: MapFilters;
}> = (props) => {
  const groupEnabled = props.mapFilters.showMtbImba;
  const { hiddenMtbImbaScales } = props.mapFilters;

  return (
    <>
      <FilterBulkActions
        disabled={!groupEnabled}
        allSelected={hiddenMtbImbaScales.length === 0}
        noneSelected={hiddenMtbImbaScales.length === IMBA_SCALE_FILTERS.length}
        onSelectAll={() => props.eventBus.showAllMtbImbaScales()}
        onClearAll={() => props.eventBus.hideAllMtbImbaScales()}
      />
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
    </>
  );
};
