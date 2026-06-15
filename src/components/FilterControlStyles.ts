import type { SxProps, Theme } from "@mui/material";

export function dimmedFilterControlSx(groupEnabled: boolean): SxProps<Theme> {
  return {
    display: "flex",
    ml: 0,
    ...(!groupEnabled && {
      opacity: 0.55,
      color: "text.disabled",
      "& .MuiCheckbox-root": {
        color: "action.disabled",
      },
      "& .MuiCheckbox-root.Mui-checked": {
        color: "action.disabled",
      },
    }),
  };
}
