import * as React from "react";
import { About } from "./About";
import EventBus from "./EventBus";
import { PanelShell } from "./PanelShell";

export const AboutPanel: React.FunctionComponent<{
  eventBus: EventBus;
}> = (props) => {
  return (
    <PanelShell title="About" onBack={() => props.eventBus.backToMenu()}>
      <About eventBus={props.eventBus} />
    </PanelShell>
  );
};
