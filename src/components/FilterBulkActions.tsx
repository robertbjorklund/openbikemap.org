import { Checkbox, FormControlLabel } from "@mui/material";
import * as React from "react";
import { dimmedFilterControlSx } from "./FilterControlStyles";

/**
 * Master checkbox for filter lists — checked = all, indeterminate = partial,
 * click toggles between all selected and none.
 */
export const FilterBulkActions: React.FunctionComponent<{
  disabled?: boolean;
  allSelected: boolean;
  noneSelected: boolean;
  onSelectAll: () => void;
  onClearAll: () => void;
  label?: string;
}> = (props) => {
  const label = props.label ?? "Select all";

  const handleChange = () => {
    if (props.allSelected) {
      props.onClearAll();
    } else {
      props.onSelectAll();
    }
  };

  return (
    <FormControlLabel
      sx={{
        ...dimmedFilterControlSx(!props.disabled),
        display: "flex",
        mb: 0.5,
        ml: 0,
        borderBottom: 1,
        borderColor: "divider",
        pb: 0.5,
        "& .MuiFormControlLabel-label": {
          fontWeight: 600,
          fontSize: "0.875rem",
        },
      }}
      control={
        <Checkbox
          size="small"
          checked={props.allSelected}
          indeterminate={!props.allSelected && !props.noneSelected}
          disabled={props.disabled}
          onChange={handleChange}
        />
      }
      label={label}
    />
  );
};
