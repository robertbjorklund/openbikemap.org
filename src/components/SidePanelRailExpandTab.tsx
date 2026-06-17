import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { IconButton } from "@mui/material";
import * as React from "react";

/** Fixed edge tab to expand the rail when collapsed on mobile. */
export const SidePanelRailExpandTab: React.FunctionComponent<{
  onExpand: () => void;
}> = (props) => (
  <IconButton
    className="side-panel-rail-expand-tab"
    aria-label="Show menu"
    title="Show menu"
    onClick={props.onExpand}
    size="small"
  >
    <ChevronRightIcon sx={{ fontSize: 22 }} />
  </IconButton>
);
