import * as maplibregl from "maplibre-gl";
import * as ReactDOM from "react-dom/client";
import MapFilters, { defaultMapFilters } from "../MapFilters";
import { MapLegend } from "./MapLegend";
import { Themed } from "./Themed";

const LEGEND_TOGGLE_ICON = `
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <line x1="2" y1="4" x2="16" y2="4" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="2" y1="9" x2="16" y2="9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <line x1="2" y1="14" x2="16" y2="14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 2"/>
  </svg>
`;

export class LegendControl implements maplibregl.IControl {
  private container: HTMLDivElement;
  private panel: HTMLDivElement;
  private panelRoot: ReactDOM.Root | null = null;
  private toggleButton: HTMLButtonElement;
  private panelOpen = false;
  private mapFilters: MapFilters = defaultMapFilters;
  private peerMenuClose: (() => void) | null = null;

  constructor() {
    this.container = document.createElement("div");
    this.container.className =
      "maplibregl-ctrl openbikemap-map-corner-control openbikemap-legend-control";

    this.panel = document.createElement("div");
    this.panel.className = "openbikemap-legend-panel";
    this.panel.hidden = true;
    this.panel.setAttribute("role", "dialog");
    this.panel.setAttribute("aria-label", "Map symbols legend");
    this.panel.addEventListener("click", (event) => event.stopPropagation());

    this.panelRoot = ReactDOM.createRoot(this.panel);

    const iconEl = document.createElement("span");
    iconEl.className = "openbikemap-map-menu-toggle-icon";
    iconEl.innerHTML = LEGEND_TOGGLE_ICON;

    const labelEl = document.createElement("span");
    labelEl.className = "openbikemap-map-menu-toggle-label";
    labelEl.textContent = "Legend";

    const chevronEl = document.createElement("span");
    chevronEl.className = "openbikemap-map-menu-toggle-chevron";
    chevronEl.setAttribute("aria-hidden", "true");
    chevronEl.textContent = "▾";

    this.toggleButton = document.createElement("button");
    this.toggleButton.type = "button";
    this.toggleButton.className =
      "openbikemap-map-menu-toggle openbikemap-legend-toggle";
    this.toggleButton.setAttribute("aria-label", "Map symbols legend");
    this.toggleButton.setAttribute("aria-haspopup", "dialog");
    this.toggleButton.setAttribute("aria-expanded", "false");
    this.toggleButton.title = "Map symbols legend";
    this.toggleButton.append(iconEl, labelEl, chevronEl);
    this.toggleButton.addEventListener("click", this.onToggleClick);

    this.container.appendChild(this.panel);
    this.container.appendChild(this.toggleButton);

    document.addEventListener("click", this.onDocumentClick);
    this.renderPanel();
  }

  onAdd = (): HTMLElement => {
    return this.container;
  };

  onRemove = (): void => {
    document.removeEventListener("click", this.onDocumentClick);
    this.panelRoot?.unmount();
    this.panelRoot = null;
    this.container.remove();
  };

  getDefaultPosition = (): maplibregl.ControlPosition => {
    return "bottom-left";
  };

  setMapFilters = (mapFilters: MapFilters): void => {
    this.mapFilters = mapFilters;
    this.renderPanel();
  };

  setPeerMenuClose = (close: () => void): void => {
    this.peerMenuClose = close;
  };

  closePanel = (): void => {
    if (this.panelOpen) {
      this.closePanelInternal();
    }
  };

  private onToggleClick = (event: MouseEvent): void => {
    event.stopPropagation();
    if (this.panelOpen) {
      this.closePanelInternal();
    } else {
      this.openPanelInternal();
    }
  };

  private onDocumentClick = (): void => {
    if (this.panelOpen) {
      this.closePanelInternal();
    }
  };

  private openPanelInternal = (): void => {
    this.peerMenuClose?.();
    this.panelOpen = true;
    this.panel.hidden = false;
    this.toggleButton.setAttribute("aria-expanded", "true");
    this.container.classList.add("openbikemap-map-corner-control-open");
  };

  private closePanelInternal = (): void => {
    this.panelOpen = false;
    this.panel.hidden = true;
    this.toggleButton.setAttribute("aria-expanded", "false");
    this.container.classList.remove("openbikemap-map-corner-control-open");
  };

  private renderPanel = (): void => {
    this.panelRoot?.render(
      <Themed>
        <MapLegend
          mapFilters={this.mapFilters}
          onClose={() => this.closePanelInternal()}
        />
      </Themed>,
    );
  };
}
