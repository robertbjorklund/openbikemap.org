import * as maplibregl from "maplibre-gl";
import { AppConfig } from "../AppConfig";

export class LogoControl implements maplibregl.IControl {
  _container: HTMLDivElement;
  _map: maplibregl.Map | undefined;

  constructor() {
    this._container = document.createElement("div");
    this._container.className = "logo-control maplibregl-ctrl";

    const link = document.createElement("a");
    link.className = "logo-control-link";
    link.target = "_blank";
    link.href = this.getHref();

    const prefix = document.createElement("span");
    prefix.className = "logo-control-prefix";
    prefix.textContent = "Map by ";
    link.appendChild(prefix);

    const text = document.createElement("span");
    text.className = "logo-control-text";
    text.textContent = AppConfig.appName;
    link.appendChild(text);

    link.addEventListener("click", () => {
      link.href = this.getHref();
    });

    this._container.appendChild(link);
  }

  private getHref(): string {
    return (
      `https://${AppConfig.appDomain}` +
      window.location.search +
      window.location.hash
    );
  }

  onAdd = () => {
    return this._container;
  };

  onRemove = () => {
    const parent = this._container.parentNode;
    parent && parent.removeChild(this._container);
    this._map = undefined;
  };

  getDefaultPosition = (): maplibregl.ControlPosition => {
    return "bottom-right";
  };
}
