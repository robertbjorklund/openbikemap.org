import { MapStyle } from "../MapStyle";

export interface BasemapOption {
  style: MapStyle;
  label: string;
  description: string;
  preview: string;
}

export const BASEMAP_OPTIONS: readonly BasemapOption[] = [
  {
    style: MapStyle.Terrain,
    label: "Terrain",
    description: "Topographic map",
    preview:
      "linear-gradient(160deg, #f5f5f0 0%, #dce8d4 35%, #b8d4a8 65%, #8fbc8f 100%)",
  },
  {
    style: MapStyle.Satellite,
    label: "Satellite",
    description: "Aerial imagery",
    preview:
      "linear-gradient(160deg, #6b7b8c 0%, #5a6b52 40%, #4a5540 70%, #3a4038 100%)",
  },
] as const;

export function getBasemapOption(style: MapStyle): BasemapOption {
  return (
    BASEMAP_OPTIONS.find((option) => option.style === style) ?? BASEMAP_OPTIONS[0]
  );
}
