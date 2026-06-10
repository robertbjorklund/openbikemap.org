import { API_BASE_URL } from "../Config";
import type { ObjectIDType } from "./SelectedObject";

export async function loadGeoJSON<T>(
  entityID: string,
  idType: ObjectIDType = "openbikemap",
): Promise<T> {
  const url =
    idType === "openbikemap"
      ? `${API_BASE_URL}/features/${entityID}.geojson`
      : `${API_BASE_URL}/features/${idType}/${entityID}.geojson`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load feature ${entityID}`);
  }
  return response.json() as Promise<T>;
}
