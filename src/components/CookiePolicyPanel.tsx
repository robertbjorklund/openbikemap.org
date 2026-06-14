import * as React from "react";
import { CookiePolicy } from "./CookiePolicy";
import EventBus from "./EventBus";
import { PanelShell } from "./PanelShell";

export const CookiePolicyPanel: React.FunctionComponent<{
  eventBus: EventBus;
}> = (props) => {
  return (
    <PanelShell
      title="Cookie policy"
      onClose={() => props.eventBus.closeMenu()}
    >
      <CookiePolicy />
    </PanelShell>
  );
};
