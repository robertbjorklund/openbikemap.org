import * as maplibregl from "maplibre-gl";
import * as ReactDOM from "react-dom/client";
import { MapStyle } from "../MapStyle";
import { getBasemapOption } from "./BasemapOptions";
import EventBus from "./EventBus";
import { MapFilterMenu } from "./MapFilterMenu";
import { Themed } from "./Themed";

const LAYERS_BADGE_ICON = `
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16zm0-11.47L17.74 9 12 13.47 6.26 9 12 4.53z"/>
  </svg>
`;

export class FilterControl implements maplibregl.IControl {
  private container: HTMLDivElement;
  private menu: HTMLDivElement;
  private menuRoot: ReactDOM.Root | null = null;
  private toggleButton: HTMLButtonElement;
  private previewEl: HTMLSpanElement;
  private labelEl: HTMLSpanElement;
  private menuOpen = false;
  private mapStyle: MapStyle;

  constructor(
    private eventBus: EventBus,
    mapStyle: MapStyle,
  ) {
    this.mapStyle = mapStyle;

    this.container = document.createElement("div");
    this.container.className =
      "maplibregl-ctrl openbikemap-layers-control";

    this.menu = document.createElement("div");
    this.menu.className = "openbikemap-layers-menu";
    this.menu.hidden = true;
    this.menu.setAttribute("role", "menu");
    this.menu.addEventListener("click", (event) => event.stopPropagation());

    this.menuRoot = ReactDOM.createRoot(this.menu);

    this.previewEl = document.createElement("span");
    this.previewEl.className = "openbikemap-layers-preview";
    this.previewEl.setAttribute("aria-hidden", "true");

    this.labelEl = document.createElement("span");
    this.labelEl.className = "openbikemap-layers-label";

    const badgeEl = document.createElement("span");
    badgeEl.className = "openbikemap-layers-badge";
    badgeEl.innerHTML = LAYERS_BADGE_ICON;
    badgeEl.setAttribute("aria-hidden", "true");

    this.toggleButton = document.createElement("button");
    this.toggleButton.type = "button";
    this.toggleButton.className = "openbikemap-layers-toggle";
    this.toggleButton.setAttribute("aria-label", "Map layers");
    this.toggleButton.setAttribute("aria-haspopup", "menu");
    this.toggleButton.setAttribute("aria-expanded", "false");
    this.toggleButton.title = "Map layers";
    this.toggleButton.append(this.previewEl, this.labelEl, badgeEl);
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
    this.menuOpen = true;
    this.menu.hidden = false;
    this.toggleButton.setAttribute("aria-expanded", "true");
    this.container.classList.add("openbikemap-layers-control-open");
  };

  private closeMenuInternal = (): void => {
    this.menuOpen = false;
    this.menu.hidden = true;
    this.toggleButton.setAttribute("aria-expanded", "false");
    this.container.classList.remove("openbikemap-layers-control-open");
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
