import * as React from "react";
import { AboutInfo } from "./AboutInfo";
import EventBus from "./EventBus";
import { PanelShell } from "./PanelShell";

export const AboutPanel: React.FunctionComponent<{
  eventBus: EventBus;
}> = (props) => {
  return (
    <PanelShell title="About" showBack={false} onClose={() => props.eventBus.closeMenu()}>
      <AboutInfo eventBus={props.eventBus} />
    </PanelShell>
  );
};
