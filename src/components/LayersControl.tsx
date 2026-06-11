import * as maplibregl from "maplibre-gl";
import { MapStyle } from "../MapStyle";
import EventBus from "./EventBus";

const STYLE_LABELS: Record<MapStyle, string> = {
  [MapStyle.Terrain]: "Terrain",
  [MapStyle.Satellite]: "Satellite",
};

const STYLE_DESCRIPTIONS: Record<MapStyle, string> = {
  [MapStyle.Terrain]: "Topographic map with trails & routes",
  [MapStyle.Satellite]: "Aerial imagery with trails & routes",
};

export class LayersControl implements maplibregl.IControl {
  private container: HTMLDivElement;
  private menu: HTMLDivElement;
  private toggleButton: HTMLButtonElement;
  private styleButtons = new Map<MapStyle, HTMLButtonElement>();
  private menuOpen = false;

  constructor(private eventBus: EventBus) {
    this.container = document.createElement("div");
    this.container.className =
      "maplibregl-ctrl openbikemap-layers-control";

    this.menu = document.createElement("div");
    this.menu.className = "openbikemap-basemap-menu";
    this.menu.setAttribute("role", "menu");
    this.menu.hidden = true;

    const menuGroup = document.createElement("div");
    menuGroup.className = "maplibregl-ctrl-group openbikemap-basemap-menu-group";

    for (const style of Object.values(MapStyle)) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "openbikemap-basemap-option";
      button.setAttribute("role", "menuitemradio");
      button.setAttribute("aria-label", `${STYLE_LABELS[style]} basemap`);
      button.title = STYLE_DESCRIPTIONS[style];

      const label = document.createElement("span");
      label.className = "openbikemap-basemap-option-label";
      label.textContent = STYLE_LABELS[style];
      button.appendChild(label);

      button.addEventListener("click", (event) => {
        event.stopPropagation();
        this.eventBus.setMapStyle(style);
        this.closeMenu();
      });

      this.styleButtons.set(style, button);
      menuGroup.appendChild(button);
    }

    this.menu.appendChild(menuGroup);

    const toggleGroup = document.createElement("div");
    toggleGroup.className = "maplibregl-ctrl-group";

    this.toggleButton = document.createElement("button");
    this.toggleButton.className = "maplibregl-ctrl-icon";
    this.toggleButton.type = "button";
    this.toggleButton.setAttribute("aria-label", "Map layers");
    this.toggleButton.setAttribute("aria-haspopup", "menu");
    this.toggleButton.setAttribute("aria-expanded", "false");
    this.toggleButton.title = "Map layers";
    this.toggleButton.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#333" style="position: relative; top: 2px;">
        <path d="M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16zm0-11.47L17.74 9 12 13.47 6.26 9 12 4.53z"/>
      </svg>
    `;
    this.toggleButton.addEventListener("click", this.onToggleClick);

    toggleGroup.appendChild(this.toggleButton);
    this.container.appendChild(this.menu);
    this.container.appendChild(toggleGroup);

    this.container.addEventListener("contextmenu", (e) => e.preventDefault());
    document.addEventListener("click", this.onDocumentClick);
  }

  onAdd = () => {
    return this.container;
  };

  onRemove = () => {
    document.removeEventListener("click", this.onDocumentClick);
    this.container.remove();
  };

  getDefaultPosition = (): maplibregl.ControlPosition => {
    return "bottom-right";
  };

  setStyle(style: MapStyle): void {
    for (const [mapStyle, button] of this.styleButtons) {
      const selected = mapStyle === style;
      button.setAttribute("aria-checked", selected ? "true" : "false");
      button.classList.toggle("openbikemap-basemap-selected", selected);
    }
  }

  private onToggleClick = (event: MouseEvent) => {
    event.stopPropagation();
    if (this.menuOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  };

  private onDocumentClick = () => {
    if (this.menuOpen) {
      this.closeMenu();
    }
  };

  private openMenu = () => {
    this.menuOpen = true;
    this.menu.hidden = false;
    this.toggleButton.setAttribute("aria-expanded", "true");
  };

  private closeMenu = () => {
    this.menuOpen = false;
    this.menu.hidden = true;
    this.toggleButton.setAttribute("aria-expanded", "false");
  };
}
