import { Box } from "@mui/material";
import * as React from "react";
import {
  FeatureType,
  type MapFeature,
} from "../types/FeatureTypes";
import {
  getWeatherSamplePoints,
  shouldShowFeatureWeather,
} from "../utils/weather/weatherSamplePoints";
import type { WeatherSamplePoint } from "../utils/weather/weatherTypes";
import type { RouteGroupSelection } from "./SelectedObject";
import {
  WeatherError,
  WeatherForecastDays,
  WeatherLoading,
  WeatherSectionHeader,
} from "./WeatherForecastDays";
import { WeatherPastRain } from "./WeatherPastRain";
import { useWeatherForecast } from "./useWeatherForecast";

function isMtbWeatherFeature(feature: MapFeature): boolean {
  if (feature.properties.type === FeatureType.Trail) {
    return true;
  }
  return feature.properties.osmRouteType === "mtb";
}

function WeatherSampleForecast({
  point,
  enabled,
  compact,
}: {
  point: WeatherSamplePoint;
  enabled: boolean;
  compact: boolean;
}) {
  const { forecast, loading, error } = useWeatherForecast(
    point.lat,
    point.lng,
    enabled,
  );

  if (loading) {
    return <WeatherLoading compact={compact} />;
  }
  if (error || !forecast) {
    return <WeatherError compact={compact} />;
  }

  return (
    <WeatherForecastDays
      days={forecast.days}
      compact={compact}
      locationLabel={point.label}
    />
  );
}

export const FeatureWeather: React.FunctionComponent<{
  feature: MapFeature;
  routeGroup?: RouteGroupSelection;
  compact: boolean;
  enabled: boolean;
}> = ({ feature, routeGroup, compact, enabled }) => {
  const samplePoints = React.useMemo(
    () => getWeatherSamplePoints(feature),
    [feature],
  );
  const showWeather = shouldShowFeatureWeather(feature, routeGroup);
  const showPastRain = isMtbWeatherFeature(feature);
  const rainPoint = samplePoints[0];

  if (!showWeather || samplePoints.length === 0) {
    return null;
  }

  return (
    <Box className="feature-weather">
      <WeatherSectionHeader compact={compact} />
      {showPastRain && rainPoint && (
        <WeatherPastRain
          lat={rainPoint.lat}
          lng={rainPoint.lng}
          enabled={enabled}
          compact={compact}
        />
      )}
      {samplePoints.map((point) => (
        <WeatherSampleForecast
          key={`${point.label}-${point.lat}-${point.lng}`}
          point={point}
          enabled={enabled}
          compact={compact}
        />
      ))}
    </Box>
  );
};
