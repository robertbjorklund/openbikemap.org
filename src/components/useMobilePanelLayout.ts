import { useMediaQuery } from "@mui/material";
import { SIDE_PANEL_RAIL_MOBILE_BREAKPOINT_PX } from "./sidePanelRailLayout";

export function useMobilePanelLayout(): boolean {
  return useMediaQuery(
    `(max-width: ${SIDE_PANEL_RAIL_MOBILE_BREAKPOINT_PX}px)`,
  );
}
