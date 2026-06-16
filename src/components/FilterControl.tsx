import * as maplibregl from "maplibre-gl";
import * as ReactDOM from "react-dom/client";
import { MapStyle } from "../MapStyle";
import { getBasemapOption } from "./BasemapOptions";
import EventBus from "./EventBus";
import { MapFilterMenu } from "./MapFilterMenu";
import { Themed } from "./Themed";

export class FilterControl implements maplibregl.IControl {
  private container: HTMLDivElement;
  private menu: HTMLDivElement;
  private menuRoot: ReactDOM.Root | null = null;
  private toggleButton: HTMLButtonElement;
  private previewEl: HTMLSpanElement;
  private labelEl: HTMLSpanElement;
  private menuOpen = false;
  private mapStyle: MapStyle;
  private peerMenuClose: (() => void) | null = null;

  constructor(
    private eventBus: EventBus,
    mapStyle: MapStyle,
  ) {
    this.mapStyle = mapStyle;

    this.container = document.createElement("div");
    this.container.className =
      "maplibregl-ctrl openbikemap-map-corner-control openbikemap-layers-control";

    this.menu = document.createElement("div");
    this.menu.className = "openbikemap-layers-menu";
    this.menu.hidden = true;
    this.menu.setAttribute("role", "menu");
    this.menu.addEventListener("click", (event) => event.stopPropagation());

    this.menuRoot = ReactDOM.createRoot(this.menu);

    this.previewEl = document.createElement("span");
    this.previewEl.className =
      "openbikemap-map-menu-toggle-thumb openbikemap-layers-preview-thumb";
    this.previewEl.setAttribute("aria-hidden", "true");

    this.labelEl = document.createElement("span");
    this.labelEl.className = "openbikemap-map-menu-toggle-label";

    const chevronEl = document.createElement("span");
    chevronEl.className = "openbikemap-map-menu-toggle-chevron";
    chevronEl.setAttribute("aria-hidden", "true");
    chevronEl.textContent = "▾";

    this.toggleButton = document.createElement("button");
    this.toggleButton.type = "button";
    this.toggleButton.className =
      "openbikemap-map-menu-toggle openbikemap-layers-toggle";
    this.toggleButton.setAttribute("aria-label", "Map layers");
    this.toggleButton.setAttribute("aria-haspopup", "menu");
    this.toggleButton.setAttribute("aria-expanded", "false");
    this.toggleButton.title = "Map layers";
    this.toggleButton.append(this.previewEl, this.labelEl, chevronEl);
    this.toggleButton.addEventListener("click", this.onToggleClick);

    this.container.appendChild(this.menu);
    this.container.appendChild(this.toggleButton);

    document.addEventListener("click", this.onDocumentClick);
    this.updateToggleAppearance();
    this.renderMenu();
  }

  onAdd = (): HTMLElement => {
    return this.container;
  };

  onRemove = (): void => {
    document.removeEventListener("click", this.onDocumentClick);
    this.menuRoot?.unmount();
    this.menuRoot = null;
    this.container.remove();
  };

  getDefaultPosition = (): maplibregl.ControlPosition => {
    return "bottom-left";
  };

  setMapStyle = (mapStyle: MapStyle): void => {
    this.mapStyle = mapStyle;
    this.updateToggleAppearance();
    this.renderMenu();
  };

  openMenu = (): void => {
    if (!this.menuOpen) {
      this.openMenuInternal();
    }
  };

  closeMenu = (): void => {
    if (this.menuOpen) {
      this.closeMenuInternal();
    }
  };

  setPeerMenuClose = (close: () => void): void => {
    this.peerMenuClose = close;
  };

  private updateToggleAppearance = (): void => {
    const option = getBasemapOption(this.mapStyle);
    this.previewEl.style.background = option.preview;
    this.labelEl.textContent = option.label;
    this.toggleButton.setAttribute("aria-label", `Map layers: ${option.label}`);
    this.toggleButton.title = `Map layers: ${option.label}`;
  };

  private onToggleClick = (event: MouseEvent): void => {
    event.stopPropagation();
    if (this.menuOpen) {
      this.closeMenuInternal();
    } else {
      this.openMenuInternal();
    }
  };

  private onDocumentClick = (): void => {
    if (this.menuOpen) {
      this.closeMenuInternal();
    }
  };

  private openMenuInternal = (): void => {
    this.peerMenuClose?.();
    this.menuOpen = true;
    this.menu.hidden = false;
    this.toggleButton.setAttribute("aria-expanded", "true");
    this.container.classList.add("openbikemap-map-corner-control-open");
  };

  private closeMenuInternal = (): void => {
    this.menuOpen = false;
    this.menu.hidden = true;
    this.toggleButton.setAttribute("aria-expanded", "false");
    this.container.classList.remove("openbikemap-map-corner-control-open");
  };

  private renderMenu = (): void => {
    this.menuRoot?.render(
      <Themed>
        <MapFilterMenu
          eventBus={this.eventBus}
          mapStyle={this.mapStyle}
          onClose={() => this.closeMenuInternal()}
        />
      </Themed>,
    );
  };
}
