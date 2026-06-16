import { Box, Button } from "@mui/material";
import * as React from "react";

export const FilterBulkActions: React.FunctionComponent<{
  disabled?: boolean;
  allSelected: boolean;
  noneSelected: boolean;
  onSelectAll: () => void;
  onClearAll: () => void;
}> = (props) => {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 0.5,
        mb: 1.5,
        alignItems: "center",
      }}
    >
      <Button
        size="small"
        variant="text"
        disabled={props.disabled || props.allSelected}
        onClick={props.onSelectAll}
        sx={{ minWidth: 0, px: 1, textTransform: "none" }}
      >
        Select all
      </Button>
      <Button
        size="small"
        variant="text"
        disabled={props.disabled || props.noneSelected}
        onClick={props.onClearAll}
        sx={{ minWidth: 0, px: 1, textTransform: "none" }}
      >
        Clear all
      </Button>
    </Box>
  );
};
