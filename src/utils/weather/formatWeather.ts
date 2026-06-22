import type { DailyWeather } from "./weatherTypes";

/** Meteorological degrees → CSS rotation so ↑ points where wind blows. */
export function windArrowRotationDeg(directionDeg: number): number {
  return directionDeg + 180;
}

export function formatWindSpeed(speedMs: number): string {
  return `${Math.round(speedMs)} m/s`;
}

export function formatPrecipitation(mm: number): string {
  if (mm < 0.1) {
    return "0 mm";
  }
  if (mm < 10) {
    return `${mm.toFixed(1)} mm`;
  }
  return `${Math.round(mm)} mm`;
}

export function weatherEmoji(day: DailyWeather): string {
  if (day.precipitationMm >= 2) {
    return "🌧";
  }
  if (day.precipitationMm >= 0.2) {
    return "🌦";
  }
  if (day.tempMaxC <= 0) {
    return "❄️";
  }
  if (day.tempMaxC >= 20) {
    return "☀️";
  }
  return "☁️";
}

export function formatTemperatureRange(day: DailyWeather): string {
  const max = Math.round(day.tempMaxC);
  const min = Math.round(day.tempMinC);
  if (max === min) {
    return `${max}°`;
  }
  return `${max}° / ${min}°`;
}
