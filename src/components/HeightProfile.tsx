import turfDistance from "@turf/distance";
import turfLineSliceAlong from "@turf/line-slice-along";
import turfNearestPointOnLine from "@turf/nearest-point-on-line";
import {
  CategoryScale,
  Chart,
  ChartData,
  ChartEvent,
  Filler,
  LinearScale,
  LineElement,
  Plugin,
  PointElement,
} from "chart.js";
import * as maplibregl from "maplibre-gl";
import memoize from "memoize-one";
import * as React from "react";
import { Line } from "react-chartjs-2";
import { AppConfig } from "../AppConfig";
import type { ElevationData } from "../utils/ElevationProfile";
import { withAlpha } from "../uiTheme";
import { useUnitSystem } from "./UnitSystemManager";
import * as UnitHelpers from "./utils/UnitHelpers";

Chart.register(LinearScale);
Chart.register(CategoryScale);
Chart.register(PointElement);
Chart.register(LineElement);
Chart.register(Filler);

const PROFILE_FILL = withAlpha(AppConfig.primaryColor, 0.35);
const PROFILE_BORDER = "rgba(0, 0, 0, 0.15)";
const HIGHLIGHT_MAX_DISTANCE_METERS = 200;

export interface HeightProfileProps {
  /** Geometry shown on the map (e.g. selected trail highlight). */
  displayGeometry: GeoJSON.LineString;
  profileGeometry: GeoJSON.LineString;
  elevationData: ElevationData;
  resolution: number;
  map?: maplibregl.Map;
}

interface ProfileSnap {
  alongProfile: number;
  mapPosition: maplibregl.LngLat;
}

interface OverlayData {
  elevation: number;
  slopeDegrees: number;
  slopePercent: number;
  pixelX: number;
  pixelY: number;
}

const calculateRawElevationsAndDistance = memoize(
  (profileGeometry: GeoJSON.LineString, resolution: number) => {
    const geometryPoints = profileGeometry.coordinates.reduce(
      (result, coord, index, coords) => {
        if (index === 0) {
          result.push({ x: 0, y: coord[2] });
        } else {
          const prevCoord = coords[index - 1];
          const segmentDistance = turfDistance(
            [prevCoord[0], prevCoord[1]],
            [coord[0], coord[1]],
            { units: "meters" },
          );
          const totalDistance = result[index - 1].x + segmentDistance;
          result.push({ x: totalDistance, y: coord[2] });
        }
        return result;
      },
      [] as { x: number; y: number }[],
    );

    if (geometryPoints.length === 0) {
      return [];
    }

    const totalDistance = geometryPoints[geometryPoints.length - 1].x;
    const numPoints = Math.round(totalDistance / resolution);
    if (numPoints <= 1) {
      return geometryPoints;
    }

    const resampled: { x: number; y: number }[] = [];
    for (let i = 0; i <= numPoints; i++) {
      const distance = (i / numPoints) * totalDistance;
      resampled.push({
        x: distance,
        y: getInterpolatedElevation(geometryPoints, distance),
      });
    }
    return resampled;
  },
);

const snapCursorToProfile = memoize(
  (
    chartHighlightPosition: maplibregl.LngLat | null,
    displayGeometry: GeoJSON.LineString,
    profileGeometry: GeoJSON.LineString,
  ): ProfileSnap | null => {
    if (chartHighlightPosition === null) {
      return null;
    }

    const onDisplay = turfNearestPointOnLine(
      displayGeometry,
      [chartHighlightPosition.lng, chartHighlightPosition.lat],
      { units: "meters" },
    );

    if (onDisplay.properties.dist > HIGHLIGHT_MAX_DISTANCE_METERS) {
      return null;
    }

    const [lng, lat] = onDisplay.geometry.coordinates;
    const onProfile = turfNearestPointOnLine(
      profileGeometry,
      [lng, lat],
      { units: "meters" },
    );

    return {
      alongProfile: onProfile.properties.location as number,
      mapPosition: new maplibregl.LngLat(lng, lat),
    };
  },
);

function lngLatAlongProfile(
  profileGeometry: GeoJSON.LineString,
  distanceAlongMeters: number,
): maplibregl.LngLat | null {
  const line = turfLineSliceAlong(
    profileGeometry,
    distanceAlongMeters,
    distanceAlongMeters,
    { units: "meters" },
  );
  const firstPoint = line.geometry?.coordinates[0];
  if (!firstPoint) {
    return null;
  }
  return new maplibregl.LngLat(firstPoint[0], firstPoint[1]);
}

export const HeightProfile: React.FunctionComponent<HeightProfileProps> = (
  props,
) => {
  const unitSystem = useUnitSystem();
  const markerRef = React.useRef<maplibregl.Marker | null>(null);
  const chartHoverPixelCoordsRef = React.useRef<{
    x: number;
    y: number;
  } | null>(null);
  const highlightPixelCoordsRef = React.useRef<{
    x: number;
    y: number;
  } | null>(null);

  const [chartHighlightPosition, setChartHighlightPosition] =
    React.useState<maplibregl.LngLat | null>(null);
  const [overlayData, setOverlayData] = React.useState<OverlayData | null>(
    null,
  );

  const profileGeometry = props.elevationData.profileGeometry;

  const rawElevationsAndDistance = calculateRawElevationsAndDistance(
    profileGeometry,
    props.resolution,
  );

  const totalDistance =
    rawElevationsAndDistance.length > 0
      ? rawElevationsAndDistance[rawElevationsAndDistance.length - 1].x
      : 0;

  const profileSnap = snapCursorToProfile(
    chartHighlightPosition,
    props.displayGeometry,
    profileGeometry,
  );
  const highlightPositionX = profileSnap?.alongProfile ?? null;

  const clearMarker = React.useCallback(() => {
    if (markerRef.current !== null) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    chartHoverPixelCoordsRef.current = null;
    setOverlayData(null);
  }, []);

  const markPositionOnMap = React.useCallback(
    (position: maplibregl.LngLat | null) => {
      if (!props.map || position === null) {
        if (markerRef.current !== null) {
          markerRef.current.remove();
          markerRef.current = null;
        }
        return;
      }

      if (markerRef.current === null) {
        const el = document.createElement("div");
        el.className = "chart-position-marker";
        markerRef.current = new maplibregl.Marker({
          element: el,
          anchor: "center",
        })
          .setLngLat(position)
          .addTo(props.map);
      } else {
        markerRef.current.setLngLat(position);
      }
    },
    [props.map],
  );

  React.useEffect(() => {
    if (!props.map) {
      return;
    }

    const onMapMouseMove = (e: maplibregl.MapMouseEvent) => {
      setChartHighlightPosition(e.lngLat);
    };
    const onMapMouseOut = () => {
      setChartHighlightPosition(null);
    };

    props.map.on("mousemove", onMapMouseMove);
    props.map.on("mouseout", onMapMouseOut);

    return () => {
      props.map?.off("mousemove", onMapMouseMove);
      props.map?.off("mouseout", onMapMouseOut);
      clearMarker();
    };
  }, [clearMarker, props.map]);

  React.useLayoutEffect(() => {
    if (!profileSnap) {
      highlightPixelCoordsRef.current = null;
      if (markerRef.current !== null) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      return;
    }

    markPositionOnMap(profileSnap.mapPosition);
  }, [markPositionOnMap, profileSnap]);

  const onHover = React.useCallback(
    (event: ChartEvent, chart: Chart) => {
      const x = event.x;
      const y = event.y;
      const area = chart.chartArea;

      if (x === null || y === null || !area) {
        clearMarker();
        return;
      }

      if (x < area.left || x > area.right || y > area.bottom || y < area.top) {
        clearMarker();
        return;
      }

      const position = ((x - area.left) / (area.right - area.left)) * totalDistance;
      const mapPosition = lngLatAlongProfile(profileGeometry, position);
      if (!mapPosition) {
        clearMarker();
        return;
      }

      markPositionOnMap(mapPosition);

      const elevation = getInterpolatedElevation(
        rawElevationsAndDistance,
        position,
      );
      const slope = getInterpolatedSlope(rawElevationsAndDistance, position);
      const pixelY = chart.scales.y.getPixelForValue(elevation);

      chartHoverPixelCoordsRef.current = { x, y: pixelY };
      setOverlayData({
        elevation,
        slopeDegrees: slope.degrees,
        slopePercent: slope.percent,
        pixelX: x,
        pixelY,
      });
    },
    [
      clearMarker,
      markPositionOnMap,
      profileGeometry,
      rawElevationsAndDistance,
      totalDistance,
    ],
  );

  const mapHoverOverlay: OverlayData | null =
    highlightPositionX !== null && highlightPixelCoordsRef.current
      ? {
          elevation: getInterpolatedElevation(
            rawElevationsAndDistance,
            highlightPositionX,
          ),
          slopeDegrees: getInterpolatedSlope(
            rawElevationsAndDistance,
            highlightPositionX,
          ).degrees,
          slopePercent: getInterpolatedSlope(
            rawElevationsAndDistance,
            highlightPositionX,
          ).percent,
          pixelX: highlightPixelCoordsRef.current.x,
          pixelY: highlightPixelCoordsRef.current.y,
        }
      : null;

  const activeOverlay = overlayData ?? mapHoverOverlay;

  const plugins = React.useMemo((): Plugin[] => {
    return [
      {
        id: "customPointStyle",
        afterDraw(chart) {
          const drawPointMarker = (px: number, py: number) => {
            const ctx = chart.ctx;
            ctx.save();
            ctx.beginPath();
            ctx.arc(px, py, 8, 0, Math.PI * 2);
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
          };

          if (chartHoverPixelCoordsRef.current) {
            drawPointMarker(
              chartHoverPixelCoordsRef.current.x,
              chartHoverPixelCoordsRef.current.y,
            );
          }

          const datasets = chart.data.datasets;
          if (datasets && datasets.length > 1) {
            const meta = chart.getDatasetMeta(1);
            if (meta.data && meta.data.length > 0) {
              const point = meta.data[0];
              drawPointMarker(point.x, point.y);
              highlightPixelCoordsRef.current = { x: point.x, y: point.y };
              point.options.radius = 0;
            }
          } else {
            highlightPixelCoordsRef.current = null;
          }
        },
      },
    ];
  }, []);

  const data: ChartData<"line", { x: number; y: number }[]> = {
    datasets: [
      {
        fill: true,
        borderWidth: 2,
        borderColor: PROFILE_BORDER,
        backgroundColor: PROFILE_FILL,
        tension: 0.3,
        pointRadius: 0,
        pointHitRadius: 5,
        pointHoverRadius: 0,
        order: 10,
        data: rawElevationsAndDistance,
      },
      ...(highlightPositionX !== null
        ? [
            {
              fill: false,
              borderWidth: 0,
              borderColor: "rgba(0, 0, 0, 0)",
              pointRadius: 0,
              pointHitRadius: 16,
              order: 1,
              data: [
                {
                  x: highlightPositionX,
                  y: getInterpolatedElevation(
                    rawElevationsAndDistance,
                    highlightPositionX,
                  ),
                },
              ],
            },
          ]
        : []),
    ],
  };

  return (
    <div className="height-profile" onMouseLeave={clearMarker}>
      <Line
        data={data}
        plugins={plugins}
        options={{
          animation: { duration: 0 },
          responsive: true,
          maintainAspectRatio: true,
          elements: {
            line: { tension: 0.3 },
            point: { radius: 0 },
          },
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
          },
          hover: {
            mode: "index",
            intersect: false,
            includeInvisible: true,
          },
          scales: {
            x: {
              type: "linear",
              min: 0,
              max: totalDistance,
              grid: { display: true, color: "rgba(0,0,0,0.05)" },
              ticks: {
                maxRotation: 0,
                autoSkipPadding: 20,
                callback: (value) =>
                  UnitHelpers.distanceText({
                    distanceInMeters: Number(value),
                    unitSystem,
                    forceLongestUnit: true,
                    withSpace: true,
                  }),
              },
            },
            y: {
              type: "linear",
              suggestedMax:
                Math.max(props.elevationData.verticalInMeters, 100) +
                props.elevationData.minElevationInMeters,
              grid: { display: true, color: "rgba(0,0,0,0.05)" },
              ticks: {
                callback: (elevation) =>
                  UnitHelpers.heightText(Number(elevation), unitSystem),
              },
            },
          },
          onHover: (event, _, chart) => {
            if (chart) {
              onHover(event, chart);
            }
          },
        }}
      />
      {activeOverlay && (
        <div
          className="height-profile-overlay"
          style={{
            left:
              activeOverlay.pixelX > 200
                ? activeOverlay.pixelX - 10
                : activeOverlay.pixelX + 10,
            top: activeOverlay.pixelY - 40,
            transform:
              activeOverlay.pixelX > 200
                ? "translateX(-100%)"
                : "translateX(0)",
          }}
        >
          <div>
            {UnitHelpers.heightText(activeOverlay.elevation, unitSystem, true)}
          </div>
          <div>
            {Math.round(activeOverlay.slopeDegrees)}° (
            {Math.round(activeOverlay.slopePercent)}%)
          </div>
        </div>
      )}
    </div>
  );
};

function getInterpolatedSlope(
  elevationsAndDistance: { x: number; y: number }[],
  distance: number,
): { degrees: number; percent: number } {
  if (elevationsAndDistance.length < 2) {
    return { degrees: 0, percent: 0 };
  }

  let beforeIndex = 0;
  for (let i = 0; i < elevationsAndDistance.length; i++) {
    if (elevationsAndDistance[i].x > distance) {
      break;
    }
    beforeIndex = i;
  }

  if (beforeIndex >= elevationsAndDistance.length - 1) {
    beforeIndex = elevationsAndDistance.length - 2;
  }

  const before = elevationsAndDistance[beforeIndex];
  const after = elevationsAndDistance[beforeIndex + 1];
  const horizontalDistance = after.x - before.x;

  if (horizontalDistance === 0) {
    return { degrees: 0, percent: 0 };
  }

  const steepness = (before.y - after.y) / horizontalDistance;
  return {
    degrees: Math.atan(Math.abs(steepness)) * (180 / Math.PI),
    percent: Math.abs(steepness) * 100,
  };
}

function getInterpolatedElevation(
  elevationsAndDistance: { x: number; y: number }[],
  distance: number,
): number {
  let beforeIndex = 0;
  for (let i = 0; i < elevationsAndDistance.length; i++) {
    if (elevationsAndDistance[i].x > distance) {
      break;
    }
    beforeIndex = i;
  }

  if (beforeIndex === elevationsAndDistance.length - 1) {
    return elevationsAndDistance[beforeIndex].y;
  }

  const before = elevationsAndDistance[beforeIndex];
  const after = elevationsAndDistance[beforeIndex + 1];
  const ratio = (distance - before.x) / (after.x - before.x);
  return before.y + ratio * (after.y - before.y);
}
