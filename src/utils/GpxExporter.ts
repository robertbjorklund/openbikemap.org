import type { LineString, MultiLineString, Position } from "geojson";
import { AppConfig } from "../AppConfig";
import type { MapFeature } from "../types/FeatureTypes";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function sanitizeFilename(name: string): string {
  const sanitized = name.replace(/[^a-z0-9-_]+/gi, "_").replace(/_+/g, "_");
  return sanitized.length > 0 ? sanitized : "track";
}

function getFeatureTitle(feature: MapFeature): string {
  const { properties } = feature;
  return properties.name || properties.ref || properties.id;
}

function getLineStrings(geometry: LineString | MultiLineString): Position[][] {
  if (geometry.type === "LineString") {
    return geometry.coordinates.length >= 2 ? [geometry.coordinates] : [];
  }
  return geometry.coordinates.filter((line) => line.length >= 2);
}

export function canExportFeatureGpx(feature: MapFeature): boolean {
  if (!feature.geometry) {
    return false;
  }
  return getLineStrings(feature.geometry).length > 0;
}

export function featureToGpx(feature: MapFeature): string {
  const title = escapeXml(getFeatureTitle(feature));
  const lines = getLineStrings(feature.geometry);

  const segments = lines
    .map(
      (line) =>
        `    <trkseg>\n${line
          .map(
            ([lon, lat]) =>
              `      <trkpt lat="${lat}" lon="${lon}"></trkpt>`,
          )
          .join("\n")}\n    </trkseg>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="${escapeXml(AppConfig.appName)}" xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <trk>
    <name>${title}</name>
${segments}
  </trk>
</gpx>`;
}

export function downloadFeatureGpx(feature: MapFeature): void {
  if (!canExportFeatureGpx(feature)) {
    return;
  }

  const gpxContent = featureToGpx(feature);
  const filename = `${sanitizeFilename(getFeatureTitle(feature))}.gpx`;
  const blob = new Blob([gpxContent], { type: "application/gpx+xml" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
