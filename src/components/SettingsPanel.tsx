import * as React from "react";
import EventBus from "./EventBus";
import { PanelShell } from "./PanelShell";
import { SettingsPanelBody } from "./SettingsPanelBody";

export const SettingsPanel: React.FunctionComponent<{
  eventBus: EventBus;
}> = (props) => {
  return (
    <PanelShell
      title="Settings"
      showBack={false}
      onClose={() => props.eventBus.closeMenu()}
    >
      <SettingsPanelBody eventBus={props.eventBus} />
    </PanelShell>
  );
};
