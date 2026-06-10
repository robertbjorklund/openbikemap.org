import { TILES_BASE_URL } from "./Config";

declare const BUILD_TIMESTAMP: string;

export enum MapStyle {
  Terrain = "terrain",
  Bright = "bright",
}

/**
 * Basemap styles. Trail overlay layers will be added via tiles.openbikemap.org
 * once the data pipeline is ready.
 */
export const MAP_STYLE_URLS: Record<MapStyle, string> = {
  // OpenFreeMap basemap until custom OpenBikeMap styles are hosted
  [MapStyle.Terrain]: `https://tiles.openfreemap.org/styles/liberty?v=${BUILD_TIMESTAMP}`,
  [MapStyle.Bright]: `https://tiles.openfreemap.org/styles/bright?v=${BUILD_TIMESTAMP}`,
};

/** Future: hosted style with bike trail MVT layers */
export const BIKE_STYLE_URL = `${TILES_BASE_URL}/styles/terrain.json?v=${BUILD_TIMESTAMP}`;
