import { useState, useEffect } from 'react';

interface ClockBlockProps {
  city?: string;
  timezone?: string;
  isDark?: boolean;
}

export function ClockBlock({ city, timezone, isDark = true }: ClockBlockProps) {
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

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <span className={`text-4xl font-light tracking-wider ${isDark ? 'text-neutral-100' : 'text-neutral-800'}`}>
        {formatTime()}
      </span>
      {city && (
        <span className={`text-sm mt-1 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
          {city}
        </span>
      )}
    </div>
  );
}
