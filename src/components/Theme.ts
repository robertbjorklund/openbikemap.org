import { createTheme } from "@mui/material/styles";
import { AppConfig } from "../AppConfig";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: AppConfig.primaryColor,
    },
    secondary: {
      main: AppConfig.accentColor,
    },
  },
});
