import maplibregl from "maplibre-gl";

// SHA-256 hash of the empty placeholder tile that Esri returns for areas with no imagery
const EMPTY_TILE_HASH =
  "9eafd300d61393184a4abc1d458564cfd1cd9b6f9c4e9c74687045c0a0e5b858";
const EMPTY_TILE_SIZE = 2521;
const ESRI_TILE_URL_PATTERN =
  "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

async function sha256(data: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/// Filters out empty tiles from the Esri satellite tile service
export function registerSatelliteTileProtocol(): void {
  maplibregl.addProtocol(
    "satellite-filtered",
    async (
      params: maplibregl.RequestParameters,
      abortController: AbortController,
    ): Promise<{ data: ArrayBuffer | Uint8Array }> => {
      const urlParts = params.url
        .replace("satellite-filtered://", "")
        .split("/");
      if (urlParts.length !== 3) {
        throw new Error(`Invalid satellite-filtered URL: ${params.url}`);
      }

      const [z, y, x] = urlParts;
      const tileUrl = ESRI_TILE_URL_PATTERN.replace("{z}", z)
        .replace("{y}", y)
        .replace("{x}", x);

      const response = await fetch(tileUrl, {
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch tile: ${response.status} ${response.statusText}`,
        );
      }

      const arrayBuffer = await response.arrayBuffer();

      if (arrayBuffer.byteLength === EMPTY_TILE_SIZE) {
        const hash = await sha256(arrayBuffer);

        if (hash === EMPTY_TILE_HASH) {
          throw new Error("Discarding empty tile");
        }
      }

      return { data: arrayBuffer };
    },
  );
}
