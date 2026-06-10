import queryString from "query-string";
import { shallowEqualObjects } from "shallow-equal";
import { AppConfig, ObjectIDType } from "../AppConfig";
import { MapMarker, parseMarkers, stringifyMarkers } from "../MapMarker";

const validIDTypes: ObjectIDType[] = [
  AppConfig.defaultObjectIdType,
  "openstreetmap",
];

export interface URLState {
  aboutInfoOpen: boolean;
  markers: MapMarker[];
  selectedObjectID: string | null;
  selectedObjectIDType: ObjectIDType;
  showInfo: boolean;
}

export function updateURL(state: URLState) {
  if (shallowEqualObjects(state, getURLState())) {
    return;
  }

  if (!window.history) {
    return;
  }

  const query = queryString.stringify({
    about: state.aboutInfoOpen ? null : undefined,
    obj: state.selectedObjectID !== null ? state.selectedObjectID : undefined,
    obj_type:
      state.selectedObjectID !== null &&
      state.selectedObjectIDType !== AppConfig.defaultObjectIdType
        ? state.selectedObjectIDType
        : undefined,
    show_info:
      state.selectedObjectID && !state.showInfo ? "false" : undefined,
    markers:
      state.markers.length > 0 ? stringifyMarkers(state.markers) : undefined,
  });

  window.history.replaceState(
    state,
    AppConfig.appName,
    "/" + (query.length > 0 ? "?" : "") + query + location.hash,
  );
}

export function getURLState(): URLState {
  const query = queryString.parseUrl(window.location.toString()).query;
  const rawType = query.obj_type;
  const selectedObjectIDType: ObjectIDType =
    typeof rawType === "string" && (validIDTypes as string[]).includes(rawType)
      ? (rawType as ObjectIDType)
      : AppConfig.defaultObjectIdType;

  return {
    aboutInfoOpen: query.about !== undefined,
    selectedObjectID:
      query.obj !== undefined && typeof query.obj === "string"
        ? query.obj
        : null,
    selectedObjectIDType,
    showInfo: query.show_info !== "false",
    markers:
      query.markers !== undefined && typeof query.markers === "string"
        ? parseMarkers(query.markers)
        : [],
  };
}
