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
import { type MapFeature } from "../types/FeatureTypes";
import EventBus from "./EventBus";
import { trackMatomoEvent } from "../utils/matomo";
import {
  getSearchResultSubtitle,
  getSearchResultTitle,
  groupSearchFeatures,
  resolveSearchSelectionFeature,
  type GroupedSearchHit,
} from "../utils/searchResults";

type CommandResult = { type: "add_marker"; data: MapMarker };
type LocationResult = { type: "location"; data: GroupedSearchHit };
type SearchResult = CommandResult | LocationResult;

const SEARCH_RESULT_LIMIT = 100;
const SEARCH_DISPLAY_LIMIT = 12;

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

    const grouped = groupSearchFeatures(features).slice(0, SEARCH_DISPLAY_LIMIT);
    nextResults = nextResults.concat(
      grouped.map((hit) => ({ type: "location" as const, data: hit })),
    );

    setResults(nextResults);
    setSelectedIndex(0);
  };

  const runSearch = React.useMemo(
    () => (searchQuery: string) => {
      fetch(
        `${API_BASE_URL}/search?query=${encodeURIComponent(searchQuery)}&limit=${SEARCH_RESULT_LIMIT}`,
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

  const selectResult = async (result: SearchResult) => {
    setQuery("");
    setResults([]);
    setHideResults(true);
    inputRef.current?.blur();

    if (result.type === "add_marker") {
      trackMatomoEvent("Search", "Select", "coordinates");
      props.eventBus.addMarker(result.data);
      return;
    }

    const hit = result.data;
    trackMatomoEvent("Search", "Select", hit.feature.properties.type);

    const { primary, related, display } = await resolveSearchSelectionFeature(
      hit.feature,
    );

    props.eventBus.showInfo(primary.properties.id, {
      clickedFeature: display,
      relatedFeatures: related,
      fitToMap: true,
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
      void selectResult(results[selectedIndex]);
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
                  onClick={() => void selectResult(result)}
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
  const { feature, mergedHitCount } = result.data;
  const groupKey = feature.properties.groupId ?? feature.properties.id;
  return `location_${groupKey}_${mergedHitCount}_${index}`;
}

function primaryText(result: SearchResult): string {
  if (result.type === "add_marker") {
    return "Mark location";
  }
  const { feature, mergedHitCount } = result.data;
  return getSearchResultTitle(feature, mergedHitCount);
}

function secondaryText(result: SearchResult): string {
  if (result.type === "add_marker") {
    const [longitude, latitude] = result.data.coordinates;
    const latDirection = latitude >= 0 ? "N" : "S";
    const lonDirection = longitude >= 0 ? "E" : "W";
    return `Location: ${Math.abs(latitude)}°${latDirection}, ${Math.abs(longitude)}°${lonDirection}`;
  }

  const { feature, mergedHitCount } = result.data;
  return getSearchResultSubtitle(feature, mergedHitCount);
}
