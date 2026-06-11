import { createTheme } from "@mui/material/styles";
import { AppConfig } from "../AppConfig";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: AppConfig.primaryColor,
      dark: AppConfig.accentColor,
      light: "#0097A7",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#5F6368",
      dark: "#3C4043",
      light: "#80868B",
      contrastText: "#ffffff",
    },
    text: {
      primary: "#3C4043",
      secondary: "#5F6368",
    },
    divider: "#DADCE0",
  },
  components: {
    MuiCheckbox: {
      defaultProps: {
        color: "primary",
      },
    },
    MuiRadio: {
      defaultProps: {
        color: "primary",
      },
    },
    MuiSwitch: {
      defaultProps: {
        color: "primary",
      },
    },
    MuiSlider: {
      defaultProps: {
        color: "primary",
      },
    },
  },
});
