import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, Loader } from 'lucide-react';
import { FlipCard } from './FlipCard';

interface WeatherBlockProps {
  city?: string;
  isDark?: boolean;
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

export function WeatherBlock({ city = 'Toulon', isDark = true, onUpdateCity }: WeatherBlockProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
        );
        const geoData = await geoRes.json();
        
        if (!geoData.results?.[0]) {
          setError('Ville non trouvée');
          setLoading(false);
          return;
        }

        const { latitude, longitude } = geoData.results[0];

        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m`
        );
        const weatherData = await weatherRes.json();

        setWeather({
          temperature: Math.round(weatherData.current.temperature_2m),
          weatherCode: weatherData.current.weather_code,
          windSpeed: Math.round(weatherData.current.wind_speed_10m),
        });
        setLoading(false);
      } catch {
        setError('Erreur de chargement');
        setLoading(false);
      }
    }

    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [city]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className={`w-6 h-6 animate-spin ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`} />
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
      placeholder="Ville"
    >
      {(onFlip: () => void) => (
        <div className="h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <WeatherIcon className="w-10 h-10 text-[var(--accent-color)]" />
            <div>
              <p className="text-2xl font-semibold">{weather.temperature}°C</p>
              <p 
                onClick={onFlip}
                className={`text-sm cursor-pointer hover:underline truncate max-w-[120px] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}
              >
                {city}
              </p>
            </div>
          </div>
          <div className={`flex items-center gap-1 text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
            <Wind className="w-4 h-4" />
            <span>{weather.windSpeed} km/h</span>
          </div>
        </div>
      )}
    </FlipCard>
  );
}
