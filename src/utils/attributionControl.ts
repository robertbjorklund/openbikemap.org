import type * as maplibregl from "maplibre-gl";

/** OSM attribution guidelines allow auto-collapse after five seconds. */
export const ATTRIBUTION_AUTO_COLLAPSE_MS = 5000;

/** Collapse expanded compact attribution to the (i) toggle. */
export function minimizeAttributionControl(map: maplibregl.Map): void {
  const container = map
    .getContainer()
    .querySelector(".maplibregl-ctrl-attrib.maplibregl-compact");
  if (
    container instanceof HTMLElement &&
    container.classList.contains("maplibregl-compact-show")
  ) {
    container.classList.remove("maplibregl-compact-show");
  }
}

function attributionReady(map: maplibregl.Map): HTMLElement | null {
  const container = map
    .getContainer()
    .querySelector(".maplibregl-ctrl-attrib.maplibregl-compact");
  if (
    !(container instanceof HTMLElement) ||
    container.classList.contains("maplibregl-attrib-empty")
  ) {
    return null;
  }
  return container;
}

/**
 * Minimize attribution after five seconds once it is visible, or sooner if the
 * user pans (MapLibre compact mode). OSM-safe harbour behaviour.
 */
export function attachAttributionAutoCollapse(map: maplibregl.Map): () => void {
  let done = false;
  let timeoutId: number | undefined;

  const clearTimer = () => {
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
      timeoutId = undefined;
    }
  };

  const finish = () => {
    done = true;
    clearTimer();
  };

  const trySchedule = () => {
    if (done) {
      return;
    }

    const container = attributionReady(map);
    if (!container) {
      return;
    }

    if (!container.classList.contains("maplibregl-compact-show")) {
      finish();
      return;
    }

    if (timeoutId !== undefined) {
      return;
    }

    timeoutId = window.setTimeout(() => {
      minimizeAttributionControl(map);
      finish();
    }, ATTRIBUTION_AUTO_COLLAPSE_MS);
  };

  const onMapInteraction = () => {
    if (done) {
      return;
    }
    const container = attributionReady(map);
    if (container && !container.classList.contains("maplibregl-compact-show")) {
      finish();
    }
  };

  map.on("load", trySchedule);
  map.on("styledata", trySchedule);
  map.on("sourcedata", trySchedule);
  map.on("drag", onMapInteraction);
  map.on("zoom", onMapInteraction);

  return () => {
    finish();
    map.off("load", trySchedule);
    map.off("styledata", trySchedule);
    map.off("sourcedata", trySchedule);
    map.off("drag", onMapInteraction);
    map.off("zoom", onMapInteraction);
  };
}
