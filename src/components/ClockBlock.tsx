import { useState, useEffect, useRef } from 'react';
import { FlipCard } from './FlipCard';

interface ClockBlockProps {
  city?: string;
  timezone?: string;
  isDark?: boolean;
  onUpdateCity?: (city: string, timezone: string) => void;
}

// Validation de la ville via l'API geocoding (retourne aussi le timezone)
async function validateAndGetTimezone(city: string): Promise<string | null> {
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
    const data = await res.json();
    if (data.results?.[0]?.timezone) {
      return data.results[0].timezone;
    }
    return null;
  } catch {
    return null;
  }
}

export function ClockBlock({ city, timezone, isDark = true, onUpdateCity }: ClockBlockProps) {
  const pendingTimezone = useRef<string | null>(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = () => {
    if (timezone) {
      return time.toLocaleTimeString('fr-FR', { 
        timeZone: timezone, 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleSave = (newCity: string) => {
    if (pendingTimezone.current) {
      onUpdateCity?.(newCity, pendingTimezone.current);
      pendingTimezone.current = null;
    }
  };

  const validateCity = async (value: string): Promise<boolean> => {
    const tz = await validateAndGetTimezone(value);
    if (tz) {
      pendingTimezone.current = tz;
      return true;
    }
    return false;
  };

  return (
    <FlipCard
      editValue={city || ''}
      onSave={handleSave}
      validate={validateCity}
      isDark={isDark}
      placeholder="Ville"
    >
      {(onFlip: () => void) => (
        <div className="h-full flex flex-col items-center justify-center">
          <span className={`text-4xl font-light tracking-wider ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
            {formatTime()}
          </span>
          {city && (
            <span 
              onClick={onFlip}
              className={`text-sm mt-1 cursor-pointer hover:underline ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}
            >
              {city}
            </span>
          )}
        </div>
      )}
    </FlipCard>
  );
}
