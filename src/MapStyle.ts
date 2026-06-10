import { TILES_BASE_URL } from "./Config";

declare const BUILD_TIMESTAMP: string;

export enum MapStyle {
  Terrain = "terrain",
  Bright = "bright",
}

const TERRAIN_STYLE_PATH =
  import.meta.env.VITE_TILES_STYLE_PATH ?? "/styles/terrain/style.json";

/** OpenFreeMap basemap + bike trail/route MVT layers from tiles.openbikemap.org */
export const BIKE_STYLE_URL = `${TILES_BASE_URL}${TERRAIN_STYLE_PATH}?v=${BUILD_TIMESTAMP}`;

export const MAP_STYLE_URLS: Record<MapStyle, string> = {
  [MapStyle.Terrain]: BIKE_STYLE_URL,
  [MapStyle.Bright]: `https://tiles.openfreemap.org/styles/bright?v=${BUILD_TIMESTAMP}`,
};
