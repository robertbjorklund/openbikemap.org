export interface WeatherSamplePoint {
  label: string;
  lat: number;
  lng: number;
}

export interface DailyWeather {
  date: string;
  label: string;
  tempMaxC: number;
  tempMinC: number;
  precipitationMm: number;
  windSpeedMs: number;
  windDirectionDeg: number;
}

export interface WeatherForecast {
  latitude: number;
  longitude: number;
  days: DailyWeather[];
}

export interface PastRainSummary {
  precipitationMm: number;
}
