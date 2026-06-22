import { Typography } from "@mui/material";
import * as React from "react";
import { fetchPastRain24h } from "../utils/weather/openMeteoClient";
import { formatPrecipitation } from "../utils/weather/formatWeather";

export const WeatherPastRain: React.FunctionComponent<{
  lat: number;
  lng: number;
  enabled: boolean;
  compact: boolean;
}> = ({ lat, lng, enabled, compact }) => {
  const [rainMm, setRainMm] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!enabled) {
      setRainMm(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetchPastRain24h(lat, lng)
      .then((summary) => {
        if (!cancelled) {
          setRainMm(summary.precipitationMm);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRainMm(null);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, lat, lng]);

  if (!enabled) {
    return null;
  }

  if (loading) {
    return (
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: compact ? 0.5 : 1 }}
      >
        Rain (24 h): …
      </Typography>
    );
  }

  if (rainMm === null) {
    return null;
  }

  return (
    <Typography variant="body2" sx={{ mb: compact ? 0.5 : 1 }}>
      Rain last 24 h: {formatPrecipitation(rainMm)}
    </Typography>
  );
};
