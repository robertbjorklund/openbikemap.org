import { MapStyle } from "../MapStyle";
import { MapMarker } from "../MapMarker";
import { TrailCategory } from "../types/TrailTypes";

export default interface EventBus {
  openSidebar(): void;
  closeSidebar(): void;
  openAboutInfo(): void;
  closeAboutInfo(): void;
  setMapStyle(style: MapStyle): void;
  toggleTrailCategory(category: TrailCategory): void;
  showInfo(id: string, idType?: import("../AppConfig").ObjectIDType): void;
  hideInfo(): void;
  addMarker(marker: MapMarker): void;
}
