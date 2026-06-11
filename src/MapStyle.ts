import { TILES_BASE_URL } from "./Config";

declare const BUILD_TIMESTAMP: string;

export enum MapStyle {
  Terrain = "terrain",
  Satellite = "satellite",
}

const TERRAIN_STYLE_PATH =
  import.meta.env.VITE_TILES_STYLE_PATH ?? "/styles/terrain/style.json";
const SATELLITE_STYLE_PATH =
  import.meta.env.VITE_TILES_SATELLITE_STYLE_PATH ??
  "/styles/satellite/style.json";

/** OpenFreeMap basemap + bike trail/route MVT layers from tiles.openbikemap.org */
export const BIKE_STYLE_URL = `${TILES_BASE_URL}${TERRAIN_STYLE_PATH}?v=${BUILD_TIMESTAMP}`;

/** Esri World Imagery + bike trail/route MVT layers from tiles.openbikemap.org */
export const SATELLITE_STYLE_URL = `${TILES_BASE_URL}${SATELLITE_STYLE_PATH}?v=${BUILD_TIMESTAMP}`;

export const MAP_STYLE_URLS: Record<MapStyle, string> = {
  [MapStyle.Terrain]: BIKE_STYLE_URL,
  [MapStyle.Satellite]: SATELLITE_STYLE_URL,
};
