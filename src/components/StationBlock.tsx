import { useState, useRef, useEffect } from 'react';
import { Play } from 'lucide-react';
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

// Parser les fichiers de playlist (.pls, .m3u) pour extraire l'URL du stream
async function parsePlaylist(playlistUrl: string): Promise<string | null> {
  try {
    const res = await fetch(playlistUrl);
    const text = await res.text();

    // Parser .pls (format INI)
    if (playlistUrl.endsWith('.pls')) {
      // Chercher File1=, File2=, etc. et prendre le premier
      const match = text.match(/File\d+=(.+?)[\r\n]/);
      if (match) {
        const url = match[1].trim();
        console.log('Parsed PLS URL:', url);
        return url;
      }
    }

    // Parser .m3u (lignes de texte)
    if (playlistUrl.endsWith('.m3u') || playlistUrl.endsWith('.m3u8')) {
      const lines = text.split(/[\r\n]+/).filter(line =>
        line.trim() && !line.startsWith('#')
      );
      if (lines.length > 0) {
        console.log('Parsed M3U URL:', lines[0].trim());
        return lines[0].trim();
      }
    }

    console.error('Failed to parse playlist:', playlistUrl);
    return null;
  } catch (error) {
    console.error('Error parsing playlist:', error);
    return null;
  }
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

// Composant pour les barres d'égaliseur animées
function EqualizerBars() {
  return (
    <div className="flex items-end justify-center gap-[2px] w-4 h-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="w-[2px] rounded-full bg-[var(--accent-color)]"
          style={{
            animation: `equalizer 0.8s ease-in-out infinite`,
            animationDelay: `${i * 0.15}s`,
            height: '60%',
          }}
        />
      ))}
      <style>{`
        @keyframes equalizer {
          0%, 100% { height: 40%; }
          50% { height: 100%; }
        }
      `}</style>
    </div>
  );
}

export function StationBlock({ name, streamUrl, isDark = true, onUpdateStation }: StationBlockProps) {
  const [isPlaying, setIsPlaying] = useState(false);
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

  const handleSave = () => {
    if (pendingStation.current) {
      onUpdateStation?.(pendingStation.current.name, pendingStation.current.url);
      pendingStation.current = null;
    }
  };

  const validateStation = async (query: string): Promise<boolean> => {
    // Vérifier si l'entrée est une URL
    const isUrl = query.trim().startsWith('http://') || query.trim().startsWith('https://');

    if (isUrl) {
      // Si c'est une URL, extraire un nom de domaine comme nom par défaut
      try {
        const url = new URL(query.trim());
        const hostname = url.hostname.replace('www.', '');
        let streamUrl = query.trim();

        // Si c'est un fichier de playlist, extraire l'URL du stream
        if (query.endsWith('.pls') || query.endsWith('.m3u') || query.endsWith('.m3u8')) {
          const parsedUrl = await parsePlaylist(query.trim());
          if (parsedUrl) {
            // Ajouter un proxy CORS pour éviter les erreurs 403
            streamUrl = `https://corsproxy.io/?${encodeURIComponent(parsedUrl)}`;
            console.log('Using CORS proxy for:', parsedUrl);
          } else {
            // Impossible de parser la playlist
            return false;
          }
        }

        pendingStation.current = {
          name: hostname,
          url: streamUrl
        };
        return true;
      } catch {
        // Si l'URL est invalide, retourner false
        return false;
      }
    } else {
      // Sinon, rechercher via l'API Radio Browser
      const station = await searchStation(query);
      if (station) {
        pendingStation.current = station;
        return true;
      }
      return false;
    }
  };

  return (
    <FlipCard
      editValue={name}
      onSave={handleSave}
      validate={validateStation}
      isDark={isDark}
      placeholder="Station name"
    >
      {(onFlip: () => void) => (
        <div className="h-full flex items-center gap-2 group">
          {/* Play/Pause button - equalizer devient le bouton pause */}
          <button
            onClick={togglePlay}
            className="cursor-pointer"
          >
            {isPlaying ? (
              <EqualizerBars />
            ) : (
              <Play className={`w-4 h-4 shrink-0 transition-colors ${isDark ? 'text-neutral-500 group-hover:text-neutral-200' : 'text-neutral-700 group-hover:text-neutral-700'}`} fill="currentColor" />
            )}
          </button>

          {/* Nom de la station */}
          <span
            onClick={(e) => { e.stopPropagation(); onFlip(); }}
            className={`text-sm font-medium cursor-pointer hover:underline truncate transition-colors ${isPlaying
              ? isDark ? 'text-neutral-200' : 'text-neutral-700'
              : isDark ? 'text-neutral-500 group-hover:text-neutral-200' : 'text-neutral-500 group-hover:text-neutral-700'
              }`}
          >
            {name}
          </span>
        </div>
      )}
    </FlipCard>
  );
}
