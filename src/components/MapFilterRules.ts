import * as maplibregl from "maplibre-gl";

import MapFilters from "../MapFilters";

import {
  FeatureType,
  TrailCategory,
  type MapFeature,
  type RouteProperties,
  type TrailProperties,
} from "../types/FeatureTypes";
import {

  IMBA_SCALE_FILTERS,

  IMBA_SCALE_NOT_SET,

  IMBA_SCALES,

  MTB_SCALE_FILTERS,

  MTB_SCALE_NOT_SET,

  MTB_SCALES,

  type MtbImbaScaleFilter,

  type MtbScaleFilter,

} from "../types/BikeActivity";

import {

  ROUTE_NETWORK_FILTERS,

  ROUTE_NETWORK_NOT_SET,

  type RouteNetworkFilter,

} from "../types/RouteNetwork";



export type ObjectFilterRules =

  | maplibregl.ExpressionFilterSpecification

  | "hidden"

  | null;



export interface MapFilterRules {

  trails: ObjectFilterRules;

  routes: ObjectFilterRules;

}



/** OpenFreeMap path / cycle infrastructure — not part of OpenBikeMap product scope */

const BASEMAP_PATH_LAYER_IDS = [

  "road_path_pedestrian",

  "tunnel_path_pedestrian",

  "bridge_path_pedestrian",

  "bridge_path_pedestrian_casing",

  "highway-name-path",

] as const;

const TRAIL_CASING_LAYER_IDS = [

  "trails-casing",

] as const;

const TRAIL_STS_LAYER_IDS = [

  "trails",

] as const;

const TRAIL_IMBA_LAYER_IDS = [

  "trails-imba",

] as const;

const TRAIL_COMBINED_LAYER_IDS = [

  "trails-label-stripe",

  "trails-label",

  "tappable-trail",

] as const;

const TRAIL_LAYER_IDS = [

  ...TRAIL_CASING_LAYER_IDS,

  ...TRAIL_STS_LAYER_IDS,

  ...TRAIL_IMBA_LAYER_IDS,

  ...TRAIL_COMBINED_LAYER_IDS,

] as const;

const ROUTE_LAYER_IDS = [

  "routes-casing",

  "routes",

  "routes-label-stripe",

  "routes-label",

  "tappable-route",

] as const;



/** True when mtb:scale:imba is 0–4 (match avoids has/to-number MVT quirks). */
function isImbaTrailExpression(): maplibregl.ExpressionFilterSpecification {
  return [
    "match",
    ["get", "mtbScaleImba"],
    0,
    true,
    1,
    true,
    2,
    true,
    3,
    true,
    4,
    true,
    false,
  ];
}



function hasKnownScaleExpression(
  property: "mtbScale" | "mtbScaleImba",
  visibleNumbers: readonly number[],
): maplibregl.ExpressionFilterSpecification {
  return [
    "all",
    ["has", property],
    [
      "in",
      ["to-number", ["get", property]],
      ["literal", [...visibleNumbers]],
    ],
  ];
}

function scaleMatchExpression(
  property: "mtbScale" | "mtbScaleImba",
  _knownScales: readonly number[],
  visibleNumbers: readonly number[],
): maplibregl.ExpressionFilterSpecification {
  return hasKnownScaleExpression(property, visibleNumbers);
}



function mtbScaleFilter(

  filters: MapFilters,

): maplibregl.ExpressionFilterSpecification | null {

  if (filters.hiddenMtbScales.length === 0) {

    return null;

  }



  const hideNotSet = filters.hiddenMtbScales.includes(MTB_SCALE_NOT_SET);

  const hiddenNumbers = filters.hiddenMtbScales.filter(

    (value): value is (typeof MTB_SCALES)[number] => typeof value === "number",

  );

  const visibleNumbers = MTB_SCALES.filter(

    (scale) => !hiddenNumbers.includes(scale),

  );



  const conditions: maplibregl.ExpressionFilterSpecification[] = [];



  if (!hideNotSet) {
    conditions.push(["!", ["has", "mtbScale"]]);
  }

  if (visibleNumbers.length > 0) {
    conditions.push(
      scaleMatchExpression("mtbScale", MTB_SCALES, visibleNumbers),
    );
  }



  if (conditions.length === 0) {
    return ["==", ["get", "id"], ""];
  }



  return conditions.length === 1 ? conditions[0] : ["any", ...conditions];

}



function mtbImbaScaleFilter(

  filters: MapFilters,

): maplibregl.ExpressionFilterSpecification | null {

  if (filters.hiddenMtbImbaScales.length === 0) {

    return null;

  }



  const hiddenNumbers = filters.hiddenMtbImbaScales.filter(

    (value): value is (typeof IMBA_SCALES)[number] => typeof value === "number",

  );

  const visibleNumbers = IMBA_SCALES.filter(

    (scale) => !hiddenNumbers.includes(scale),

  );



  if (visibleNumbers.length === 0) {
    return ["==", ["get", "id"], ""];
  }



  return scaleMatchExpression("mtbScaleImba", IMBA_SCALES, visibleNumbers);

}



function hasVisibleStsScales(filters: MapFilters): boolean {
  return !MTB_SCALE_FILTERS.every((scale) =>
    filters.hiddenMtbScales.includes(scale),
  );
}

function hasVisibleImbaScales(filters: MapFilters): boolean {
  return !IMBA_SCALE_FILTERS.every((scale) =>
    filters.hiddenMtbImbaScales.includes(scale),
  );
}

function buildTrailLayerFilter(
  filters: MapFilters,
  layerId: string,
): ObjectFilterRules {
  const stsScaleFilter = mtbScaleFilter(filters);
  const imbaScaleFilter = mtbImbaScaleFilter(filters);

  const stsBranch = (
    extra: maplibregl.ExpressionFilterSpecification[],
  ): maplibregl.ExpressionFilterSpecification => {
    const parts: maplibregl.ExpressionFilterSpecification[] = [
      ["!", isImbaTrailExpression()],
      ...extra,
    ];
    return parts.length === 1 ? parts[0] : ["all", ...parts];
  };

  const imbaBranch = (
    extra: maplibregl.ExpressionFilterSpecification[],
  ): maplibregl.ExpressionFilterSpecification => {
    const parts: maplibregl.ExpressionFilterSpecification[] = [
      isImbaTrailExpression(),
      ...extra,
    ];
    return parts.length === 1 ? parts[0] : ["all", ...parts];
  };

  if ((TRAIL_IMBA_LAYER_IDS as readonly string[]).includes(layerId)) {
    if (!filters.showMtbImba) {
      return "hidden";
    }
    return imbaScaleFilter
      ? imbaBranch([imbaScaleFilter])
      : imbaBranch([]);
  }

  if ((TRAIL_STS_LAYER_IDS as readonly string[]).includes(layerId)) {
    if (!filters.showMtbSts) {
      return "hidden";
    }
    return stsScaleFilter
      ? stsBranch([stsScaleFilter])
      : stsBranch([]);
  }

  if ((TRAIL_CASING_LAYER_IDS as readonly string[]).includes(layerId)) {
    const branches: maplibregl.ExpressionFilterSpecification[] = [];
    if (filters.showMtbSts) {
      branches.push(
        stsScaleFilter ? stsBranch([stsScaleFilter]) : stsBranch([]),
      );
    }
    if (filters.showMtbImba) {
      branches.push(
        imbaScaleFilter ? imbaBranch([imbaScaleFilter]) : imbaBranch([]),
      );
    }
    if (branches.length === 0) {
      return "hidden";
    }
    return branches.length === 1 ? branches[0] : ["any", ...branches];
  }

  if ((TRAIL_COMBINED_LAYER_IDS as readonly string[]).includes(layerId)) {
    const branches: maplibregl.ExpressionFilterSpecification[] = [];
    if (filters.showMtbSts) {
      branches.push(
        stsScaleFilter ? stsBranch([stsScaleFilter]) : stsBranch([]),
      );
    }
    if (filters.showMtbImba) {
      branches.push(
        imbaScaleFilter ? imbaBranch([imbaScaleFilter]) : imbaBranch([]),
      );
    }
    if (branches.length === 0) {
      return "hidden";
    }
    return branches.length === 1 ? branches[0] : ["any", ...branches];
  }

  return null;
}



function getRouteNetworkFilter(

  hiddenRouteNetworks: RouteNetworkFilter[],

): maplibregl.ExpressionFilterSpecification | null {

  const visibleNetworks = ROUTE_NETWORK_FILTERS.filter(

    (network) => !hiddenRouteNetworks.includes(network),

  );



  if (visibleNetworks.length === ROUTE_NETWORK_FILTERS.length) {

    return null;

  }



  if (visibleNetworks.length === 0) {
    return ["==", ["get", "id"], ""];
  }



  const conditions: maplibregl.ExpressionFilterSpecification[] =

    visibleNetworks.map((network) => {

      if (network === ROUTE_NETWORK_NOT_SET) {

        return ["!", ["has", "network"]];

      }

      return ["==", ["get", "network"], network];

    });



  return ["any", ...conditions];

}



function getRoutesFilter(filters: MapFilters): ObjectFilterRules {
  if (!filters.showRoutes) {
    return "hidden";
  }

  return getRouteNetworkFilter(filters.hiddenRouteNetworks);
}



export function getFilterRules(filters: MapFilters): MapFilterRules {

  return {

    trails: buildTrailLayerFilter(filters, "trails"),

    routes: getRoutesFilter(filters),

  };

}

/** True when any MTB trail may be drawn (group on and at least one scale visible). */
export function isMtbActivityVisible(filters: MapFilters): boolean {
  const stsVisible = filters.showMtbSts && hasVisibleStsScales(filters);
  const imbaVisible = filters.showMtbImba && hasVisibleImbaScales(filters);
  return stsVisible || imbaVisible;
}

/** True when any bicycle route may be drawn (group on and some network visible). */
export function isRoutesActivityVisible(filters: MapFilters): boolean {
  if (!filters.showRoutes) {
    return false;
  }
  return !ROUTE_NETWORK_FILTERS.every((network) =>
    filters.hiddenRouteNetworks.includes(network),
  );
}

/** JS mirror of mtbScaleFilter() for a single feature's mtbScale. */
function isMtbScaleVisibleUnderFilter(
  mtbScale: number | null,
  hiddenMtbScales: MtbScaleFilter[],
): boolean {
  if (hiddenMtbScales.length === 0) {
    return true;
  }

  const hideNotSet = hiddenMtbScales.includes(MTB_SCALE_NOT_SET);
  const hiddenNumbers = hiddenMtbScales.filter(
    (value): value is (typeof MTB_SCALES)[number] => typeof value === "number",
  );
  const visibleNumbers = MTB_SCALES.filter(
    (scale) => !hiddenNumbers.includes(scale),
  );

  if (hideNotSet && visibleNumbers.length === 0) {
    return false;
  }

  if (!hideNotSet && mtbScale === null) {
    return true;
  }

  if (
    mtbScale !== null &&
    (MTB_SCALES as readonly number[]).includes(mtbScale) &&
    visibleNumbers.includes(mtbScale as (typeof MTB_SCALES)[number])
  ) {
    return true;
  }

  return false;
}

/** JS mirror of mtbImbaScaleFilter() for a single feature's mtbScaleImba. */
function isMtbImbaScaleVisibleUnderFilter(
  mtbScaleImba: number | null,
  hiddenMtbImbaScales: MtbImbaScaleFilter[],
): boolean {
  if (hiddenMtbImbaScales.length === 0) {
    return true;
  }

  const hideNotSet = hiddenMtbImbaScales.includes(IMBA_SCALE_NOT_SET);
  const hiddenNumbers = hiddenMtbImbaScales.filter(
    (value): value is (typeof IMBA_SCALES)[number] => typeof value === "number",
  );
  const visibleNumbers = IMBA_SCALES.filter(
    (scale) => !hiddenNumbers.includes(scale),
  );

  if (hideNotSet && visibleNumbers.length === 0) {
    return false;
  }

  if (!hideNotSet && mtbScaleImba === null) {
    return true;
  }

  if (
    mtbScaleImba !== null &&
    (IMBA_SCALES as readonly number[]).includes(mtbScaleImba) &&
    visibleNumbers.includes(mtbScaleImba as (typeof IMBA_SCALES)[number])
  ) {
    return true;
  }

  return false;
}

function isTrailVisibleUnderFilters(
  properties: TrailProperties,
  filters: MapFilters,
): boolean {
  if (properties.category !== TrailCategory.MtbTrail) {
    return false;
  }
  if (properties.mtbScaleImba !== null) {
    if (!filters.showMtbImba) {
      return false;
    }
    return isMtbImbaScaleVisibleUnderFilter(
      properties.mtbScaleImba,
      filters.hiddenMtbImbaScales,
    );
  }
  if (!filters.showMtbSts) {
    return false;
  }
  return isMtbScaleVisibleUnderFilter(
    properties.mtbScale,
    filters.hiddenMtbScales,
  );
}

function matchesRouteNetworkFilter(
  network: string | null,
  hiddenRouteNetworks: RouteNetworkFilter[],
): boolean {
  const visibleNetworks = ROUTE_NETWORK_FILTERS.filter(
    (value) => !hiddenRouteNetworks.includes(value),
  );
  if (visibleNetworks.length === ROUTE_NETWORK_FILTERS.length) {
    return true;
  }
  if (visibleNetworks.length === 0) {
    return false;
  }
  if (!network) {
    return visibleNetworks.includes(ROUTE_NETWORK_NOT_SET);
  }
  return visibleNetworks.includes(network as RouteNetworkFilter);
}

function isRouteVisibleUnderFilters(
  properties: RouteProperties,
  filters: MapFilters,
): boolean {
  if (!filters.showRoutes) {
    return false;
  }
  return matchesRouteNetworkFilter(
    properties.network,
    filters.hiddenRouteNetworks,
  );
}

export function isFeatureVisibleUnderFilters(
  feature: MapFeature,
  filters: MapFilters,
): boolean {
  if (feature.properties.type === FeatureType.Trail) {
    return isTrailVisibleUnderFilters(feature.properties, filters);
  }
  return isRouteVisibleUnderFilters(feature.properties, filters);
}

function isOpenMapTilesPathLayer(layer: {
  id: string;
  source?: string;
}): boolean {
  if (layer.source !== "openmaptiles") {
    return false;
  }

  return (
    layer.id.includes("path_pedestrian") || layer.id === "highway-name-path"
  );
}

function shouldHideBasemapPathLayer(layer: {
  id: string;
  source?: string;
}): boolean {
  const knownBasemapPathLayer = (
    BASEMAP_PATH_LAYER_IDS as readonly string[]
  ).includes(layer.id);
  return knownBasemapPathLayer || isOpenMapTilesPathLayer(layer);
}

type LayerWithSource = maplibregl.LayerSpecification & {
  source: string;
  "source-layer"?: string;
};

function hasSource(
  layer: maplibregl.LayerSpecification,
): layer is LayerWithSource {
  return "source" in layer && typeof layer.source === "string";
}

function withLayerVisibility(
  layer: maplibregl.LayerSpecification,
  visibility: "visible" | "none",
): maplibregl.LayerSpecification {
  return {
    ...layer,
    layout: {
      ...layer.layout,
      visibility,
    },
  };
}

type FilterableLayer = Extract<
  maplibregl.LayerSpecification,
  { filter?: maplibregl.FilterSpecification }
>;

function supportsFilter(
  layer: maplibregl.LayerSpecification,
): layer is FilterableLayer {
  return (
    layer.type !== "background" &&
    layer.type !== "raster" &&
    layer.type !== "hillshade" &&
    layer.type !== "color-relief"
  );
}

function withLayerFilter(
  layer: maplibregl.LayerSpecification,
  filter: maplibregl.ExpressionFilterSpecification | null,
): maplibregl.LayerSpecification {
  if (!supportsFilter(layer)) {
    return layer;
  }

  if (filter === null) {
    const { filter: _removed, ...withoutFilter } = layer;
    return withoutFilter;
  }
  return { ...layer, filter };
}

function applySourceLayerFilters(
  layer: maplibregl.LayerSpecification,
  activityVisible: boolean,
  filterRule: ObjectFilterRules,
): maplibregl.LayerSpecification {
  if (!activityVisible || filterRule === "hidden") {
    return withLayerVisibility(layer, "none");
  }

  const visible = withLayerVisibility(layer, "visible");
  if (filterRule === null) {
    return withLayerFilter(visible, null);
  }
  return withLayerFilter(visible, filterRule);
}

/** Bake filter rules into the style (initial load and basemap switches). */
export function applyFiltersToStyleLayers(
  layers: maplibregl.LayerSpecification[],
  filters: MapFilters,
): maplibregl.LayerSpecification[] {
  const routesFilter = getRoutesFilter(filters);
  const mtbVisible = isMtbActivityVisible(filters);
  const routesVisible = isRoutesActivityVisible(filters);

  return layers.map((layer) => {
    if (shouldHideBasemapPathLayer(layer)) {
      return withLayerVisibility(layer, "none");
    }

    if (!hasSource(layer) || layer.source !== "openbikemap") {
      return layer;
    }

    if (layer["source-layer"] === "trails") {
      return applySourceLayerFilters(
        layer,
        mtbVisible,
        buildTrailLayerFilter(filters, layer.id),
      );
    }

    if (layer["source-layer"] === "routes") {
      return applySourceLayerFilters(layer, routesVisible, routesFilter);
    }

    return layer;
  });
}

function hideBasemapPathLayers(map: maplibregl.Map): void {
  const style = map.getStyle();
  for (const layer of style.layers) {
    if (!shouldHideBasemapPathLayer(layer) || !map.getLayer(layer.id)) {
      continue;
    }
    map.setLayoutProperty(layer.id, "visibility", "none");
  }
}

const FILTER_SET_OPTIONS = { validate: false } as const;

function applyTrailLayerToMap(
  map: maplibregl.Map,
  layerId: string,
  mtbVisible: boolean,
  filters: MapFilters,
): void {
  if (!map.getLayer(layerId)) {
    if (import.meta.env.DEV) {
      console.warn(`[filters] layer not found: ${layerId}`);
    }
    return;
  }

  const filterRule = buildTrailLayerFilter(filters, layerId);
  const hideGroup = !mtbVisible || filterRule === "hidden";
  map.setLayoutProperty(layerId, "visibility", hideGroup ? "none" : "visible");
  map.setFilter(
    layerId,
    hideGroup || filterRule === null ? null : filterRule,
    FILTER_SET_OPTIONS,
  );
}

function applyRouteLayerToMap(
  map: maplibregl.Map,
  layerId: string,
  routesVisible: boolean,
  routesFilter: ObjectFilterRules,
): void {
  if (!map.getLayer(layerId)) {
    if (import.meta.env.DEV) {
      console.warn(`[filters] layer not found: ${layerId}`);
    }
    return;
  }

  const hideGroup = !routesVisible || routesFilter === "hidden";
  map.setLayoutProperty(layerId, "visibility", hideGroup ? "none" : "visible");
  map.setFilter(
    layerId,
    hideGroup || routesFilter === null ? null : routesFilter,
    FILTER_SET_OPTIONS,
  );
}

/** Apply filter rules to the live map (immediate checkbox response). */
export function applyFilterRulesToMap(
  map: maplibregl.Map,
  filters: MapFilters,
): void {
  const style = map.getStyle();
  if (!style?.layers?.length) {
    return;
  }

  const routesFilter = getRoutesFilter(filters);
  const mtbVisible = isMtbActivityVisible(filters);
  const routesVisible = isRoutesActivityVisible(filters);

  for (const layerId of TRAIL_LAYER_IDS) {
    if (!map.getLayer(layerId)) {
      continue;
    }
    applyTrailLayerToMap(map, layerId, mtbVisible, filters);
  }

  for (const layerId of ROUTE_LAYER_IDS) {
    if (!map.getLayer(layerId)) {
      continue;
    }
    applyRouteLayerToMap(map, layerId, routesVisible, routesFilter);
  }

  // Any openbikemap trail/route layers added in newer styles.
  for (const layer of map.getStyle().layers) {
    if (!hasSource(layer) || layer.source !== "openbikemap") {
      continue;
    }
    if ((TRAIL_LAYER_IDS as readonly string[]).includes(layer.id)) {
      continue;
    }
    if ((ROUTE_LAYER_IDS as readonly string[]).includes(layer.id)) {
      continue;
    }
    if (layer["source-layer"] === "trails") {
      applyTrailLayerToMap(map, layer.id, mtbVisible, filters);
    } else if (layer["source-layer"] === "routes") {
      applyRouteLayerToMap(map, layer.id, routesVisible, routesFilter);
    }
  }

  hideBasemapPathLayers(map);
  map.triggerRepaint();
}


