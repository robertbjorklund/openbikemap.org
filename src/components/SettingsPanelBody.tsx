import {
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import * as React from "react";
import EventBus from "./EventBus";
import { useUnitSystem } from "./UnitSystemManager";
import { type UnitSystem } from "./utils/UnitHelpers";

export const SettingsPanelBody: React.FunctionComponent<{
  eventBus: EventBus;
}> = (props) => {
  const unitSystem = useUnitSystem();

  return (
    <>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Unit style
      </Typography>
      <RadioGroup
        value={unitSystem}
        onChange={(event) => {
          const newUnitSystem = (event.target as HTMLInputElement)
            .value as UnitSystem;
          props.eventBus.setUnitSystem(newUnitSystem);
        }}
        sx={{ pl: 1 }}
      >
        <FormControlLabel value="metric" control={<Radio />} label="Metric" />
        <FormControlLabel
          value="imperial"
          control={<Radio />}
          label="Imperial"
        />
      </RadioGroup>
    </>
  );
};
