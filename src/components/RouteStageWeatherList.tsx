import { Box, Typography } from "@mui/material";
import * as React from "react";
import type { RouteFeature } from "../types/FeatureTypes";
import { formatRouteStageLabel } from "../utils/RouteStage";
import { formatRouteDisplayTitle } from "../types/RouteNetwork";
import { getStageStartPoint } from "../utils/weather/weatherSamplePoints";
import { formatPrecipitation, formatTemperatureRange, weatherEmoji } from "../utils/weather/formatWeather";
import { fetchWeatherForecast } from "../utils/weather/openMeteoClient";
import type { DailyWeather } from "../utils/weather/weatherTypes";
import EventBus from "./EventBus";

/** Avoid dozens of parallel forecast requests on long multi-stage routes. */
const MAX_STAGE_WEATHER_ROWS = 10;

function stageTitle(feature: RouteFeature): string {
  return (
    formatRouteStageLabel(feature.properties) ??
    formatRouteDisplayTitle(feature.properties.name, feature.properties.ref) ??
    "Stage"
  );
}

function StageWeatherRow({
  feature,
  enabled,
  onSelect,
}: {
  feature: RouteFeature;
  enabled: boolean;
  onSelect: () => void;
}) {
  const point = getStageStartPoint(feature);
  const [today, setToday] = React.useState<DailyWeather | null>(null);

  React.useEffect(() => {
    if (!enabled || !point) {
      setToday(null);
      return;
    }

    let cancelled = false;
    fetchWeatherForecast(point.lat, point.lng)
      .then((forecast) => {
        if (!cancelled) {
          setToday(forecast.days[0] ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setToday(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, point]);

  return (
    <Box
      component="button"
      type="button"
      onClick={onSelect}
      className="route-stage-weather-row"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        width: "100%",
        textAlign: "left",
        border: 0,
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "transparent",
        cursor: "pointer",
        py: 0.75,
        px: 0,
        "&:last-child": { borderBottom: 0 },
      }}
    >
      <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }}>
        {stageTitle(feature)}
      </Typography>
      {today ? (
        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
          {weatherEmoji(today)} {formatTemperatureRange(today).split(" / ")[0]} ·{" "}
          {formatPrecipitation(today.precipitationMm)}
        </Typography>
      ) : (
        <Typography variant="body2" color="text.secondary">
          …
        </Typography>
      )}
    </Box>
  );
}

export const RouteStageWeatherList: React.FunctionComponent<{
  stages: RouteFeature[];
  enabled: boolean;
  compact: boolean;
  eventBus?: EventBus;
}> = ({ stages, enabled, compact, eventBus }) => {
  if (stages.length === 0) {
    return null;
  }

  const weatherStages = stages.slice(0, MAX_STAGE_WEATHER_ROWS);
  const hiddenWeatherCount = stages.length - weatherStages.length;

  return (
    <Box sx={{ mb: compact ? 1 : 1.5 }}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Weather by stage (today at start)
      </Typography>
      {weatherStages.map((stage) => (
        <StageWeatherRow
          key={stage.properties.stageId ?? stage.properties.id}
          feature={stage}
          enabled={enabled}
          onSelect={() => {
            if (stage.properties.stageId) {
              eventBus?.selectRouteStage(stage.properties.stageId);
            }
          }}
        />
      ))}
      {hiddenWeatherCount > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ pt: 0.5 }}>
          Weather shown for the first {MAX_STAGE_WEATHER_ROWS} stages. Select a
          stage for its forecast.
        </Typography>
      )}
    </Box>
  );
};
