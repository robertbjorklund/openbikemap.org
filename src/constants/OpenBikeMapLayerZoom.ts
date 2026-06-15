/**
 * Minimum zoom for bike route/trail line layers.
 * Regional overview (~z8, e.g. central Sweden) — all line types unified.
 */
export const OPENBIKEMAP_LINE_MIN_ZOOM = 7.5;

export const OPENBIKEMAP_LINE_LAYER_IDS = [
  "routes-casing",
  "routes",
  "trails-casing",
  "trails",
  "trails-imba",
  "tappable-trail",
  "tappable-route",
] as const;

export function isOpenBikeMapLineLayerId(layerId: string): boolean {
  return (OPENBIKEMAP_LINE_LAYER_IDS as readonly string[]).includes(layerId);
}
