import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
} from "@mui/material";
import * as React from "react";
import MapFilters from "../MapFilters";
import {
  MTB_SCALE_FILTER_LABELS,
  MTB_SCALE_FILTERS,
} from "../types/BikeActivity";
import EventBus from "./EventBus";
import { dimmedFilterControlSx } from "./FilterControlStyles";
import { FilterBulkActions } from "./FilterBulkActions";
import { MtbScaleLegendIcon } from "./MtbScaleLegendIcon";

export const MtbFilterContent: React.FunctionComponent<{
  eventBus: EventBus;
  mapFilters: MapFilters;
}> = (props) => {
  const groupEnabled = props.mapFilters.showMtbSts;
  const { hiddenMtbScales } = props.mapFilters;

  return (
    <>
      <FilterBulkActions
        disabled={!groupEnabled}
        allSelected={hiddenMtbScales.length === 0}
        noneSelected={hiddenMtbScales.length === MTB_SCALE_FILTERS.length}
        onSelectAll={() => props.eventBus.showAllMtbScales()}
        onClearAll={() => props.eventBus.hideAllMtbScales()}
      />
      <FormGroup>
      {MTB_SCALE_FILTERS.map((scale) => (
        <FormControlLabel
          key={scale}
          sx={dimmedFilterControlSx(groupEnabled)}
          control={
            <Checkbox
              size="small"
              checked={!props.mapFilters.hiddenMtbScales.includes(scale)}
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
    </>
  );
};
