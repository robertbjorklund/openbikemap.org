import MenuIcon from "@mui/icons-material/Menu";
import { IconButton } from "@mui/material";
import * as maplibregl from "maplibre-gl";
import * as ReactDOM from "react-dom/client";
import EventBus from "./EventBus";

export class MenuControl implements maplibregl.IControl {
  private container: HTMLDivElement;
  private root: ReactDOM.Root | null = null;

  constructor(private eventBus: EventBus) {
    this.container = document.createElement("div");
    this.container.className = "menu-control maplibregl-ctrl";
  }

  onAdd = () => {
    this.root = ReactDOM.createRoot(this.container);
    this.root.render(
      <IconButton
        size="small"
        aria-label="Open menu"
        onClick={() => this.eventBus.openSidebar()}
        sx={{ bgcolor: "background.paper" }}
      >
        <MenuIcon />
      </IconButton>,
    );
    return this.container;
  };

  onRemove = () => {
    this.root?.unmount();
    this.root = null;
    this.container.remove();
  };

  getDefaultPosition = (): maplibregl.ControlPosition => {
    return "top-left";
  };
}
