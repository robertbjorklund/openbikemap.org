import queryString from "query-string";
import { AppConfig, type ObjectIDType } from "../AppConfig";

export function buildFeatureShareUrl(
  objectId: string,
  idType: ObjectIDType = AppConfig.defaultObjectIdType,
): string {
  const { origin, pathname } = window.location;
  const query = queryString.stringify({
    obj: objectId,
    obj_type:
      idType !== AppConfig.defaultObjectIdType ? idType : undefined,
  });
  return `${origin}${pathname}${query ? `?${query}` : ""}`;
}
