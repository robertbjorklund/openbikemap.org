import * as React from "react";
import { fetchWeatherForecast } from "../utils/weather/openMeteoClient";
import type { WeatherForecast } from "../utils/weather/weatherTypes";

export function useWeatherForecast(
  lat: number | null,
  lng: number | null,
  enabled: boolean,
): {
  forecast: WeatherForecast | null;
  loading: boolean;
  error: boolean;
} {
  const [forecast, setForecast] = React.useState<WeatherForecast | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    if (!enabled || lat === null || lng === null) {
      setForecast(null);
      setLoading(false);
      setError(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);

    fetchWeatherForecast(lat, lng)
      .then((result) => {
        if (!cancelled) {
          setForecast(result);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setForecast(null);
          setLoading(false);
          setError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, lat, lng]);

  return { forecast, loading, error };
}
