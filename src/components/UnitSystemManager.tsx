import * as React from "react";
import { SettingsEvent } from "./SettingsEvent";
import {
  type UnitSystem,
  unitSystemFromString,
} from "./utils/UnitHelpers";

const UNIT_SYSTEM_SETTING_LOCAL_STORAGE_KEY = "setting.unitSystem";

export function setUnitSystem(unitSystem: UnitSystem) {
  localStorage.setItem(UNIT_SYSTEM_SETTING_LOCAL_STORAGE_KEY, unitSystem);
  window.dispatchEvent(
    new SettingsEvent({
      settingsProperty: SettingsEvent.UNIT_SYSTEM_SETTINGS_PROPERTY,
    }),
  );
}

export function getUnitSystem(): UnitSystem {
  return unitSystemFromString(
    localStorage.getItem(UNIT_SYSTEM_SETTING_LOCAL_STORAGE_KEY),
  );
}

export function useUnitSystem(): UnitSystem {
  const [unitSystem, setUnitSystemState] = React.useState(getUnitSystem);

  React.useEffect(() => {
    return addUnitSystemChangeListener_NonReactive({
      onUnitSystemChange: setUnitSystemState,
      triggerWhenInitialized: false,
    });
  }, []);

  return unitSystem;
}

export function addUnitSystemChangeListener_NonReactive({
  onUnitSystemChange,
  triggerWhenInitialized,
}: {
  onUnitSystemChange: (unitSystem: UnitSystem) => void;
  triggerWhenInitialized: boolean;
}): () => void {
  const handleSettingsChange = (event: Event) => {
    if (
      (event as SettingsEvent).detail.settingsProperty ===
      SettingsEvent.UNIT_SYSTEM_SETTINGS_PROPERTY
    ) {
      onUnitSystemChange(getUnitSystem());
    }
  };

  window.addEventListener(SettingsEvent.EVENT_TYPE, handleSettingsChange);
  if (triggerWhenInitialized) {
    onUnitSystemChange(getUnitSystem());
  }

  return () => {
    window.removeEventListener(SettingsEvent.EVENT_TYPE, handleSettingsChange);
  };
}
