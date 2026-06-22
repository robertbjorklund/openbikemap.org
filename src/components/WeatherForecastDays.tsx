import { Box, Link, Skeleton, Typography } from "@mui/material";
import * as React from "react";
import type { DailyWeather } from "../utils/weather/weatherTypes";
import {
  formatPrecipitation,
  formatTemperatureRange,
  weatherEmoji,
} from "../utils/weather/formatWeather";
import { WeatherWindLine } from "./WeatherWindLine";

function WeatherDayCard({
  day,
  compact,
  highlighted,
}: {
  day: DailyWeather;
  compact: boolean;
  highlighted: boolean;
}) {
  return (
    <Box
      className={
        compact ? "weather-day-card weather-day-card-compact" : "weather-day-card"
      }
      sx={{
        border: 1,
        borderColor: highlighted ? "primary.main" : "divider",
        borderRadius: 1,
        px: compact ? 1.25 : 1.5,
        py: compact ? 1 : 1.25,
        bgcolor: highlighted ? "action.hover" : "background.paper",
        minWidth: compact ? 108 : undefined,
        flex: compact ? "0 0 auto" : 1,
      }}
    >
      <Typography variant="caption" color="text.secondary" display="block">
        {day.label}
      </Typography>
      <Typography
        variant="body2"
        sx={{ fontSize: compact ? "1.1rem" : "1.25rem", lineHeight: 1.2 }}
      >
        {weatherEmoji(day)}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {formatTemperatureRange(day)}
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block">
        {formatPrecipitation(day.precipitationMm)}
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block">
        <WeatherWindLine
          speedMs={day.windSpeedMs}
          directionDeg={day.windDirectionDeg}
          compact={compact}
        />
      </Typography>
    </Box>
  );
}

export const WeatherForecastDays: React.FunctionComponent<{
  days: DailyWeather[];
  compact: boolean;
  locationLabel?: string;
}> = ({ days, compact, locationLabel }) => {
  if (days.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: compact ? 1 : 1.5 }}>
      {locationLabel && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {locationLabel}
        </Typography>
      )}
      <Box
        className={compact ? "weather-days-scroll" : "weather-days-row"}
        sx={
          compact
            ? {
                display: "flex",
                gap: 1,
                overflowX: "auto",
                pb: 0.5,
                mx: -0.5,
                px: 0.5,
                WebkitOverflowScrolling: "touch",
              }
            : {
                display: "grid",
                gridTemplateColumns: `repeat(${Math.min(days.length, 5)}, minmax(0, 1fr))`,
                gap: 1,
              }
        }
      >
        {days.map((day, index) => (
          <WeatherDayCard
            key={day.date}
            day={day}
            compact={compact}
            highlighted={index === 0}
          />
        ))}
      </Box>
    </Box>
  );
};

export const WeatherSectionHeader: React.FunctionComponent<{
  compact: boolean;
}> = ({ compact }) => (
  <Typography
    variant="body2"
    fontWeight={600}
    sx={{ mb: compact ? 0.5 : 1, mt: compact ? 0.5 : 0 }}
  >
    Weather{" "}
    <Typography component="span" variant="caption" color="text.secondary">
      (
      <Link href="https://open-meteo.com/" target="_blank" rel="noreferrer">
        Open-Meteo
      </Link>
      )
    </Typography>
  </Typography>
);

export function WeatherLoading({ compact }: { compact: boolean }) {
  return (
    <Box sx={{ mb: compact ? 1 : 1.5 }}>
      <Skeleton variant="text" width="40%" />
      <Skeleton
        variant="rounded"
        height={compact ? 96 : 88}
        sx={{ mt: 0.5, borderRadius: 1 }}
      />
    </Box>
  );
}

export function WeatherError({ compact }: { compact: boolean }) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ mb: compact ? 1 : 1.5 }}
    >
      Weather unavailable
    </Typography>
  );
}
