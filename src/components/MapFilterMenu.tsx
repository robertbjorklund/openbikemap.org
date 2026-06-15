import * as React from "react";
import { MapStyle } from "../MapStyle";
import { BasemapStylePicker } from "./BasemapStylePicker";
import EventBus from "./EventBus";

export const MapFilterMenu: React.FunctionComponent<{
  eventBus: EventBus;
  mapStyle: MapStyle;
  onClose?: () => void;
}> = (props) => {
  return (
    <div className="openbikemap-filter-menu-inner">
      <section className="openbikemap-filter-section">
        <BasemapStylePicker
          mapStyle={props.mapStyle}
          eventBus={props.eventBus}
          sectionTitle="Map type"
          showDescription={false}
          onStyleSelected={props.onClose}
        />
      </section>
    </div>
  );
};
