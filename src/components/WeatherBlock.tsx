import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind } from 'lucide-react';
import { Spinner } from './Spinner';
import { FlipCard } from './FlipCard';
import { useDataCache } from '../hooks/useDataCache';

interface WeatherBlockProps {
  city?: string;
  isDark?: boolean;
  width?: number;
  onUpdateCity?: (city: string) => void;
}

interface WeatherData {
  temperature: number;
  weatherCode: number;
  windSpeed: number;
}

const WEATHER_ICONS: Record<number, typeof Sun> = {
  0: Sun,           // Clear sky
  1: Sun,           // Mainly clear
  2: Cloud,         // Partly cloudy
  3: Cloud,         // Overcast
  45: Cloud,        // Fog
  48: Cloud,        // Depositing rime fog
  51: CloudRain,    // Light drizzle
  53: CloudRain,    // Moderate drizzle
  55: CloudRain,    // Dense drizzle
  61: CloudRain,    // Slight rain
  63: CloudRain,    // Moderate rain
  65: CloudRain,    // Heavy rain
  71: CloudSnow,    // Slight snow
  73: CloudSnow,    // Moderate snow
  75: CloudSnow,    // Heavy snow
  80: CloudRain,    // Slight rain showers
  81: CloudRain,    // Moderate rain showers
  82: CloudRain,    // Violent rain showers
  95: CloudLightning, // Thunderstorm
  96: CloudLightning, // Thunderstorm with hail
  99: CloudLightning, // Thunderstorm with heavy hail
};

// Validation de la ville via l'API geocoding
async function validateCity(city: string): Promise<boolean> {
  const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
  const data = await res.json();
  return !!data.results?.[0];
}

export function WeatherBlock({ city = 'Toulon', isDark = true, width = 2, onUpdateCity }: WeatherBlockProps) {
  const { data: weather, loading, error } = useDataCache<WeatherData>({
    cacheKey: `weather-${city}`,
    fetchFn: async () => {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
      );
      const geoData = await geoRes.json();

      if (!geoData.results?.[0]) {
        throw new Error('City not found');
      }

      const { latitude, longitude } = geoData.results[0];

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m`
      );
      const weatherData = await weatherRes.json();

      return {
        temperature: Math.round(weatherData.current.temperature_2m),
        weatherCode: weatherData.current.weather_code,
        windSpeed: Math.round(weatherData.current.wind_speed_10m),
      };
    },
    ttl: 30 * 60 * 1000, // 30 minutes
  });

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner isDark={isDark} />
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>{error}</p>
      </div>
    );
  }

  const WeatherIcon = WEATHER_ICONS[weather.weatherCode] || Cloud;

  return (
    <FlipCard
      editValue={city}
      onSave={(value) => onUpdateCity?.(value)}
      validate={validateCity}
      isDark={isDark}
      placeholder="City"
    >
      {(onFlip: () => void) => (
        <div className="h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <WeatherIcon className={`w-10 h-10 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`} strokeWidth={1.5} />
            <div>
              <p className={`text-2xl font-medium ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>{weather.temperature}°C</p>
              <p
                onClick={onFlip}
                className={`text-sm cursor-pointer hover:underline truncate max-w-[120px] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}
              >
                {city}
              </p>
            </div>
          </div>
          {width >= 14 && (
            <div className={`flex items-center gap-1 text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              <Wind className="w-4 h-4" />
              <span>{weather.windSpeed} km/h</span>
            </div>
          )}
        </div>
      )}
    </FlipCard>
  );
}
