import * as maplibregl from "maplibre-gl";

export interface CameraPosition {
  center: maplibregl.LngLatLike;
  zoom: number;
  bearing: number;
  pitch: number;
}

export class CameraPositionManager {
  private readonly defaultPosition: CameraPosition = {
    center: [10, 55],
    zoom: 4,
    bearing: 0,
    pitch: 0,
  };

  isPWAMode(): boolean {
    return window.matchMedia("(display-mode: standalone)").matches;
  }

  getInitialPosition(): CameraPosition {
    const fromLocalStorage = this.getCameraFromLocalStorage();
    const fromHash = this.parseLocationHash();

    if (this.isPWAMode()) {
      if (fromLocalStorage === null && fromHash !== null) {
        return fromHash;
      }
      return fromLocalStorage || this.defaultPosition;
    }

    return fromHash || fromLocalStorage || this.defaultPosition;
  }

  savePosition(
    center: maplibregl.LngLat,
    zoom: number,
    bearing: number,
    pitch: number,
  ): void {
    this.saveCameraToLocalStorage(center, zoom, bearing, pitch);

    if (!this.isPWAMode()) {
      this.updateLocationHash(center, zoom, bearing, pitch);
    }
  }

  private getCameraFromLocalStorage(): CameraPosition | null {
    const lat = localStorage.getItem("slippy.lat");
    const lng = localStorage.getItem("slippy.lng");
    const zoom = localStorage.getItem("slippy.zoom");
    const bearing = localStorage.getItem("slippy.bearing");
    const pitch = localStorage.getItem("slippy.pitch");

    if (lat === null || lng === null || zoom === null) {
      return null;
    }

    return {
      center: [Number(lng), Number(lat)],
      zoom: Number(zoom),
      bearing: bearing !== null ? Number(bearing) : 0,
      pitch: pitch !== null ? Number(pitch) : 0,
    };
  }

  private parseLocationHash(): CameraPosition | null {
    const hash = window.location.hash;
    if (!hash || hash === "#") {
      return null;
    }

    const parts = hash.slice(1).split("/");
    if (parts.length < 3) {
      return null;
    }

    const zoom = parseFloat(parts[0]);
    const lat = parseFloat(parts[1]);
    const lng = parseFloat(parts[2]);
    const bearing = parts[3] ? parseFloat(parts[3]) : 0;
    const pitch = parts[4] ? parseFloat(parts[4]) : 0;

    if (isNaN(zoom) || isNaN(lat) || isNaN(lng)) {
      return null;
    }

    return {
      center: [lng, lat],
      zoom,
      bearing,
      pitch,
    };
  }

  private generateLocationHash(
    center: maplibregl.LngLat,
    zoom: number,
    bearing: number,
    pitch: number,
  ): string {
    const precision = Math.max(0, Math.ceil(Math.log(zoom) / Math.LN2) + 2);
    const lat = center.lat.toFixed(precision);
    const lng = center.lng.toFixed(precision);
    const zoomStr = Math.round(zoom * 100) / 100;

    let hash = `#${zoomStr}/${lat}/${lng}`;
    if (bearing !== 0 || pitch !== 0) {
      hash += `/${Math.round(bearing * 10) / 10}/${Math.round(pitch)}`;
    }
    return hash;
  }

  private saveCameraToLocalStorage(
    center: maplibregl.LngLat,
    zoom: number,
    bearing: number,
    pitch: number,
  ): void {
    localStorage.setItem("slippy.lat", center.lat.toString());
    localStorage.setItem("slippy.lng", center.lng.toString());
    localStorage.setItem("slippy.zoom", zoom.toString());
    localStorage.setItem("slippy.bearing", bearing.toString());
    localStorage.setItem("slippy.pitch", pitch.toString());
  }

  private updateLocationHash(
    center: maplibregl.LngLat,
    zoom: number,
    bearing: number,
    pitch: number,
  ): void {
    const newHash = this.generateLocationHash(center, zoom, bearing, pitch);
    if (window.location.hash !== newHash) {
      const currentUrl =
        window.location.pathname + window.location.search + newHash;
      window.history.replaceState(window.history.state, "", currentUrl);
    }
  }
}
