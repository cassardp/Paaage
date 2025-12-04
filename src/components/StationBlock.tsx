import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { FlipCard } from './FlipCard';

// Cache global pour les instances audio (persiste entre les re-renders)
const audioCache = new Map<string, HTMLAudioElement>();

// Event pour arrêter les autres radios quand une nouvelle joue
const STOP_OTHER_RADIOS = 'stopOtherRadios';

interface StationBlockProps {
  name: string;
  streamUrl: string;
  isDark?: boolean;
  onUpdateStation?: (name: string, streamUrl: string) => void;
}

// Cache pour stocker la station trouvée lors de la validation
interface StationResult {
  name: string;
  url: string;
}

// Recherche de station via Radio Browser API
async function searchStation(query: string): Promise<StationResult | null> {
  try {
    // Recherche avec filtres : stations vérifiées, codec MP3/AAC, triées par votes
    const res = await fetch(
      `https://de1.api.radio-browser.info/json/stations/byname/${encodeURIComponent(query)}?limit=5&order=votes&reverse=true&hidebroken=true`
    );
    const data = await res.json();
    
    // Prendre la première station avec une URL valide
    const station = data?.find((s: { url_resolved?: string; name?: string }) => 
      s.url_resolved && s.name
    );
    
    if (station) {
      return { name: station.name, url: station.url_resolved };
    }
    return null;
  } catch {
    return null;
  }
}

export function StationBlock({ name, streamUrl, isDark = true, onUpdateStation }: StationBlockProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pendingStation = useRef<StationResult | null>(null);

  useEffect(() => {
    // Arrêter l'ancien audio si on change de station
    if (audioRef.current && audioRef.current.src !== streamUrl) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    let audio = audioCache.get(streamUrl);
    if (!audio) {
      audio = new Audio(streamUrl);
      audio.volume = 0.5;
      audioCache.set(streamUrl, audio);
    }
    audioRef.current = audio;
    
    setIsPlaying(!audio.paused);
    setIsMuted(audio.muted);
  }, [streamUrl]);

  // Écouter l'événement pour arrêter cette radio si une autre joue
  useEffect(() => {
    const handleStopOthers = (e: CustomEvent<string>) => {
      if (e.detail !== streamUrl && audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    };

    window.addEventListener(STOP_OTHER_RADIOS, handleStopOthers as EventListener);
    return () => window.removeEventListener(STOP_OTHER_RADIOS, handleStopOthers as EventListener);
  }, [streamUrl]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // Notifier les autres radios de s'arrêter
      window.dispatchEvent(new CustomEvent(STOP_OTHER_RADIOS, { detail: streamUrl }));
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSave = () => {
    if (pendingStation.current) {
      onUpdateStation?.(pendingStation.current.name, pendingStation.current.url);
      pendingStation.current = null;
    }
  };

  const validateStation = async (query: string): Promise<boolean> => {
    const station = await searchStation(query);
    if (station) {
      pendingStation.current = station;
      return true;
    }
    return false;
  };

  return (
    <FlipCard
      editValue={name}
      onSave={handleSave}
      validate={validateStation}
      isDark={isDark}
      placeholder="Nom de la station"
    >
      {(onFlip: () => void) => (
        <div className="h-full flex items-center justify-between">
          <button
            onClick={togglePlay}
            className="flex items-center gap-2 group cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 shrink-0 text-[var(--accent-color)]" />
            ) : (
              <Play className={`w-5 h-5 shrink-0 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`} />
            )}
            <span 
              onClick={(e) => { e.stopPropagation(); onFlip(); }}
              className={`text-sm font-medium cursor-pointer hover:underline line-clamp-1 ${isDark ? 'text-neutral-200' : 'text-neutral-700'}`}
            >
              {name}
            </span>
          </button>
          
          {isPlaying && (
            <button onClick={toggleMute} className="p-1 cursor-pointer">
              {isMuted ? (
                <VolumeX className={`w-4 h-4 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`} />
              ) : (
                <Volume2 className="w-4 h-4 text-[var(--accent-color)]" />
              )}
            </button>
          )}
        </div>
      )}
    </FlipCard>
  );
}
