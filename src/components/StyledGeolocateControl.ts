import * as maplibregl from "maplibre-gl";

const ICON_GEOLOCATE = `
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
    <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
  </svg>
`;

/** Geolocate with Material-style icon instead of default MapLibre sprite. */
export class StyledGeolocateControl extends maplibregl.GeolocateControl {
  onAdd(map: maplibregl.Map): HTMLElement {
    const container = super.onAdd(map);
    container.classList.add(
      "openbikemap-geolocate-control",
      "openbikemap-map-controls",
    );

    const button = container.querySelector("button.maplibregl-ctrl-geolocate");
    if (button) {
      button.classList.add("openbikemap-map-ctrl-btn");
      button.innerHTML = ICON_GEOLOCATE;
    }

    return container;
  }
}
