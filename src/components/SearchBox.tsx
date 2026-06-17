import SearchIcon from "@mui/icons-material/Search";
import {
  Divider,
  InputBase,
  List,
  ListItemButton,
  ListItemText,
  Paper,
} from "@mui/material";
import * as React from "react";
import { debounce, throttle } from "throttle-debounce";
import { API_BASE_URL } from "../Config";
import { MapMarker } from "../MapMarker";
import { AppConfig } from "../AppConfig";
import { FeatureType, type MapFeature } from "../types/FeatureTypes";
import { getDefaultFeatureTitle, getMapFeatureKind } from "../utils/MapFeatureKind";
import EventBus from "./EventBus";
import { trackMatomoEvent } from "../utils/matomo";

type CommandResult = { type: "add_marker"; data: MapMarker };
type LocationResult = { type: "location"; data: MapFeature };
type SearchResult = CommandResult | LocationResult;

export const SearchBox: React.FunctionComponent<{
  eventBus: EventBus;
}> = (props) => {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [hideResults, setHideResults] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const queryRef = React.useRef(query);
  queryRef.current = query;

  React.useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setHideResults(true);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const processSearchResults = (
    searchQuery: string,
    features: MapFeature[],
  ) => {
    let nextResults: SearchResult[] = [];

    const coordinates = searchQuery
      .split(",")
      .map((part) => parseFloat(part.trim()))
      .reverse();

    if (
      coordinates.length === 2 &&
      coordinates.every((value) => !Number.isNaN(value)) &&
      coordinates[1] >= -90 &&
      coordinates[1] <= 90 &&
      coordinates[0] >= -180 &&
      coordinates[0] <= 180
    ) {
      nextResults.push({
        type: "add_marker",
        data: { coordinates: coordinates as [number, number] },
      });
    }

    nextResults = nextResults.concat(
      features.map((feature) => ({ type: "location", data: feature })),
    );

    setResults(nextResults);
    setSelectedIndex(0);
  };

  const runSearch = React.useMemo(
    () => (searchQuery: string) => {
      fetch(
        `${API_BASE_URL}/search?query=${encodeURIComponent(searchQuery)}`,
      ).then((response) => {
        if (queryRef.current !== searchQuery) {
          return;
        }
        response.json().then((features: MapFeature[]) => {
          if (queryRef.current === searchQuery) {
            processSearchResults(searchQuery, features);
          }
        });
      });
    },
    [],
  );

  const searchDebounced = React.useMemo(() => debounce(500, runSearch), [runSearch]);
  const searchThrottled = React.useMemo(() => throttle(500, runSearch), [runSearch]);

  const updateQuery = (value: string) => {
    setQuery(value);
    setHideResults(false);
    if (value.length === 0) {
      setResults([]);
      return;
    }
    if (value.length < 5 || value.endsWith(" ")) {
      searchThrottled(value);
    } else {
      searchDebounced(value);
    }
  };

  const selectResult = (result: SearchResult) => {
    setQuery("");
    setResults([]);
    setHideResults(true);
    inputRef.current?.blur();

    if (result.type === "add_marker") {
      trackMatomoEvent("Search", "Select", "coordinates");
      props.eventBus.addMarker(result.data);
      return;
    }

    trackMatomoEvent("Search", "Select", result.data.properties.type);
    props.eventBus.showInfo(result.data.properties.id, {
      clickedFeature: result.data,
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((index) => Math.max(0, index - 1));
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((index) => Math.min(results.length - 1, index + 1));
    } else if (event.key === "Enter" && results.length > 0) {
      selectResult(results[selectedIndex]);
    } else if (event.key === "Escape") {
      setHideResults(true);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className="openbikemap-search-box">
      <Paper elevation={2} className="openbikemap-search-input">
        <SearchIcon color="action" sx={{ ml: 1.5, flexShrink: 0 }} />
        <InputBase
          inputRef={inputRef}
          value={query}
          onChange={(event) => updateQuery(event.target.value)}
          onFocus={() => setHideResults(false)}
          onKeyDown={handleKeyDown}
          placeholder="Search trails and routes"
          sx={{ ml: 1, flex: 1, minWidth: 0 }}
          inputProps={{ "aria-label": "Search trails and routes" }}
        />
      </Paper>

      {results.length > 0 && !hideResults && (
        <Paper elevation={3} className="openbikemap-search-results">
          <List disablePadding>
            {results.map((result, index) => (
              <React.Fragment key={resultKey(result, index)}>
                {index > 0 && <Divider />}
                <ListItemButton
                  selected={selectedIndex === index}
                  onClick={() => selectResult(result)}
                >
                  <ListItemText
                    primary={primaryText(result)}
                    secondary={secondaryText(result)}
                  />
                </ListItemButton>
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </div>
  );
};

function resultKey(result: SearchResult, index: number): string {
  if (result.type === "add_marker") {
    return "add_marker";
  }
  return `location_${result.data.properties.id}_${index}`;
}

function primaryText(result: SearchResult): string {
  if (result.type === "add_marker") {
    return "Mark location";
  }
  const { properties } = result.data;
  return properties.name || properties.ref || getDefaultFeatureTitle(result.data);
}

function secondaryText(result: SearchResult): string {
  if (result.type === "add_marker") {
    const [longitude, latitude] = result.data.coordinates;
    const latDirection = latitude >= 0 ? "N" : "S";
    const lonDirection = longitude >= 0 ? "E" : "W";
    return `Location: ${Math.abs(latitude)}°${latDirection}, ${Math.abs(longitude)}°${lonDirection}`;
  }

  const { properties } = result.data;
  if (properties.type === FeatureType.Route) {
    return AppConfig.layerFilters.routes.featureLabel;
  }
  return getMapFeatureKind(result.data).label;
}
