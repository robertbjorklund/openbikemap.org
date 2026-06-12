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

  BikeActivity,

  MTB_SCALE_FILTERS,

  MTB_SCALE_NOT_SET,

  MTB_SCALES,

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

const TRAIL_LAYER_IDS = [

  "trails-casing",

  "trails",

  "trails-label",

  "tappable-trail",

] as const;

const ROUTE_LAYER_IDS = [

  "routes-casing",

  "routes",

  "routes-label",

  "tappable-route",

] as const;



function mtbScaleNumber(): maplibregl.ExpressionSpecification {

  return ["to-number", ["get", "mtbScale"]];

}



function isActivityEnabled(

  filters: MapFilters,

  activity: BikeActivity,

): boolean {

  return !filters.hiddenActivities.includes(activity);

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



  const mtbScaleConditions: maplibregl.ExpressionFilterSpecification[] = [];



  if (!hideNotSet) {

    mtbScaleConditions.push(["!", ["has", "mtbScale"]]);

  }

  if (visibleNumbers.length > 0) {

    mtbScaleConditions.push([

      "in",

      mtbScaleNumber(),

      ["literal", visibleNumbers],

    ]);

  }



  if (mtbScaleConditions.length === 0) {

    return ["!=", ["get", "category"], TrailCategory.MtbTrail];

  }



  return [

    "any",

    ["!=", ["get", "category"], TrailCategory.MtbTrail],

    ...mtbScaleConditions,

  ];

}



function getTrailsFilter(filters: MapFilters): ObjectFilterRules {

  if (!isActivityEnabled(filters, BikeActivity.Mtb)) {

    return "hidden";

  }



  const parts: maplibregl.ExpressionFilterSpecification[] = [

    ["==", ["get", "category"], TrailCategory.MtbTrail],

  ];



  const scaleFilter = mtbScaleFilter(filters);

  if (scaleFilter) {

    parts.push(scaleFilter);

  }



  return parts.length === 1 ? parts[0] : ["all", ...parts];

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

    return ["literal", false];

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

  if (!isActivityEnabled(filters, BikeActivity.Routes)) {

    return "hidden";

  }



  return getRouteNetworkFilter(filters.hiddenRouteNetworks);

}



export function getFilterRules(filters: MapFilters): MapFilterRules {

  return {

    trails: getTrailsFilter(filters),

    routes: getRoutesFilter(filters),

  };

}

/** True when any MTB trail may be drawn (parent on and at least one scale visible). */
export function isMtbActivityVisible(filters: MapFilters): boolean {
  if (!isActivityEnabled(filters, BikeActivity.Mtb)) {
    return false;
  }
  return !MTB_SCALE_FILTERS.every((scale) =>
    filters.hiddenMtbScales.includes(scale),
  );
}

/** True when any bicycle route may be drawn (parent on and some network visible). */
export function isRoutesActivityVisible(filters: MapFilters): boolean {
  if (!isActivityEnabled(filters, BikeActivity.Routes)) {
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

function isTrailVisibleUnderFilters(
  properties: TrailProperties,
  filters: MapFilters,
): boolean {
  if (getTrailsFilter(filters) === "hidden") {
    return false;
  }
  if (properties.category !== TrailCategory.MtbTrail) {
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
  if (!isActivityEnabled(filters, BikeActivity.Routes)) {
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
  const filterRules = getFilterRules(filters);
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
      return applySourceLayerFilters(layer, mtbVisible, filterRules.trails);
    }

    if (layer["source-layer"] === "routes") {
      return applySourceLayerFilters(layer, routesVisible, filterRules.routes);
    }

    return layer;
  });
}

function applyLayerGroupToMap(
  map: maplibregl.Map,
  layerIds: readonly string[],
  groupVisible: boolean,
  filterRule: ObjectFilterRules,
): void {
  const hideGroup = !groupVisible || filterRule === "hidden";
  const visibility: "visible" | "none" = hideGroup ? "none" : "visible";
  const filter: maplibregl.FilterSpecification | null =
    hideGroup || filterRule === null ? null : filterRule;

  for (const layerId of layerIds) {
    if (!map.getLayer(layerId)) {
      continue;
    }
    map.setLayoutProperty(layerId, "visibility", visibility);
    map.setFilter(layerId, filter);
  }
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

/** Apply filter rules to the live map (immediate checkbox response). */
export function applyFilterRulesToMap(
  map: maplibregl.Map,
  filters: MapFilters,
): void {
  if (!map.isStyleLoaded()) {
    return;
  }

  const rules = getFilterRules(filters);

  applyLayerGroupToMap(
    map,
    TRAIL_LAYER_IDS,
    isMtbActivityVisible(filters),
    rules.trails,
  );

  applyLayerGroupToMap(
    map,
    ROUTE_LAYER_IDS,
    isRoutesActivityVisible(filters),
    rules.routes,
  );

  hideBasemapPathLayers(map);
  map.triggerRepaint();
}


