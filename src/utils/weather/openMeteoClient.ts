import type { DailyWeather, PastRainSummary, WeatherForecast } from "./weatherTypes";

const CACHE_TTL_MS = 45 * 60 * 1000;
const OPEN_METEO = "https://api.open-meteo.com/v1/forecast";

type CacheEntry<T> = { expiresAt: number; value: T };

const forecastCache = new Map<string, CacheEntry<WeatherForecast>>();
const rainCache = new Map<string, CacheEntry<PastRainSummary>>();

function cacheKey(lat: number, lng: number, suffix: string): string {
  return `${lat.toFixed(2)},${lng.toFixed(2)}:${suffix}`;
}

function readCache<T>(map: Map<string, CacheEntry<T>>, key: string): T | null {
  const entry = map.get(key);
  if (!entry) {
    return null;
  }
  if (Date.now() > entry.expiresAt) {
    map.delete(key);
    return null;
  }
  return entry.value;
}

function writeCache<T>(map: Map<string, CacheEntry<T>>, key: string, value: T): void {
  map.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

function dayLabel(dateIso: string, index: number): string {
  if (index === 0) {
    return "Today";
  }
  const date = new Date(`${dateIso}T12:00:00`);
  return date.toLocaleDateString(undefined, { weekday: "short" });
}

function parseForecast(json: {
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    wind_speed_10m_max: number[];
    wind_direction_10m_dominant: number[];
  };
}): DailyWeather[] {
  const { daily } = json;
  return daily.time.map((date, index) => ({
    date,
    label: dayLabel(date, index),
    tempMaxC: daily.temperature_2m_max[index],
    tempMinC: daily.temperature_2m_min[index],
    precipitationMm: daily.precipitation_sum[index] ?? 0,
    windSpeedMs: daily.wind_speed_10m_max[index] ?? 0,
    windDirectionDeg: daily.wind_direction_10m_dominant[index] ?? 0,
  }));
}

export async function fetchWeatherForecast(
  lat: number,
  lng: number,
): Promise<WeatherForecast> {
  const key = cacheKey(lat, lng, "forecast5");
  const cached = readCache(forecastCache, key);
  if (cached) {
    return cached;
  }

  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    timezone: "auto",
    forecast_days: "5",
    wind_speed_unit: "ms",
    daily: [
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_sum",
      "wind_speed_10m_max",
      "wind_direction_10m_dominant",
    ].join(","),
  });

  const response = await fetch(`${OPEN_METEO}?${params}`);
  if (!response.ok) {
    throw new Error(`Weather forecast failed (${response.status})`);
  }

  const json = await response.json();
  const forecast: WeatherForecast = {
    latitude: lat,
    longitude: lng,
    days: parseForecast(json),
  };
  writeCache(forecastCache, key, forecast);
  return forecast;
}

export async function fetchPastRain24h(
  lat: number,
  lng: number,
): Promise<PastRainSummary> {
  const key = cacheKey(lat, lng, "rain24");
  const cached = readCache(rainCache, key);
  if (cached) {
    return cached;
  }

  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    timezone: "auto",
    past_hours: "24",
    forecast_hours: "0",
    hourly: "precipitation",
  });

  const response = await fetch(`${OPEN_METEO}?${params}`);
  if (!response.ok) {
    throw new Error(`Past rain failed (${response.status})`);
  }

  const json = (await response.json()) as {
    hourly?: { precipitation?: number[] };
  };
  const values = json.hourly?.precipitation ?? [];
  const precipitationMm = values.reduce((sum, value) => sum + (value ?? 0), 0);

  const summary = { precipitationMm: Math.round(precipitationMm * 10) / 10 };
  writeCache(rainCache, key, summary);
  return summary;
}
