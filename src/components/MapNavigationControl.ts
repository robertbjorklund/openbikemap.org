import * as maplibregl from "maplibre-gl";

const ICON_PLUS = `
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </svg>
`;

const ICON_MINUS = `
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
    <path d="M19 13H5v-2h14v2z"/>
  </svg>
`;

const ICON_COMPASS = `
  <svg class="openbikemap-compass-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
    <path d="M12 2 4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2zm0 3.99 5.09 9.51-5.09-2.68-5.09 2.68L12 5.99z"/>
  </svg>
`;

function createControlButton(
  className: string,
  label: string,
  iconHtml: string,
  onClick: () => void,
): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `openbikemap-map-ctrl-btn ${className}`;
  button.setAttribute("aria-label", label);
  button.title = label;
  button.innerHTML = iconHtml;
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    onClick();
  });
  return button;
}

export class MapNavigationControl implements maplibregl.IControl {
  private container: HTMLDivElement;
  private compassButton: HTMLButtonElement;
  private compassIcon: SVGSVGElement | null = null;
  private map: maplibregl.Map | null = null;

  constructor(
    private options: { showCompass?: boolean } = {},
  ) {
    this.container = document.createElement("div");
    this.container.className =
      "maplibregl-ctrl maplibregl-ctrl-group openbikemap-map-controls openbikemap-map-controls-nav";

    this.compassButton = createControlButton(
      "openbikemap-map-ctrl-compass",
      "Reset bearing to north",
      ICON_COMPASS,
      () => {
        this.map?.easeTo({ bearing: 0, pitch: 0, duration: 300 });
      },
    );
    this.compassIcon = this.compassButton.querySelector("svg");

    const zoomInButton = createControlButton(
      "openbikemap-map-ctrl-zoom-in",
      "Zoom in",
      ICON_PLUS,
      () => {
        this.map?.zoomIn({ duration: 200 });
      },
    );

    const zoomOutButton = createControlButton(
      "openbikemap-map-ctrl-zoom-out",
      "Zoom out",
      ICON_MINUS,
      () => {
        this.map?.zoomOut({ duration: 200 });
      },
    );

    if (this.options.showCompass !== false) {
      this.container.appendChild(this.compassButton);
    }
    this.container.appendChild(zoomInButton);
    this.container.appendChild(zoomOutButton);
  }

  onAdd = (map: maplibregl.Map): HTMLElement => {
    this.map = map;
    map.on("rotate", this.updateCompass);
    map.on("pitch", this.updateCompass);
    this.updateCompass();
    return this.container;
  };

  onRemove = (): void => {
    this.map?.off("rotate", this.updateCompass);
    this.map?.off("pitch", this.updateCompass);
    this.map = null;
    this.container.remove();
  };

  getDefaultPosition = (): maplibregl.ControlPosition => {
    return "bottom-right";
  };

  private updateCompass = (): void => {
    if (!this.map || this.options.showCompass === false) {
      return;
    }

    const bearing = this.map.getBearing();
    const pitch = this.map.getPitch();
    const showCompass = Math.abs(bearing) > 0.5 || Math.abs(pitch) > 0.5;
    this.compassButton.hidden = !showCompass;

    if (this.compassIcon) {
      this.compassIcon.style.transform = `rotate(${-bearing}deg)`;
    }
  };
}
