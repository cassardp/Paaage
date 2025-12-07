import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import type { RadioStation } from '../types/config';

interface RadioBlockProps {
  blockId: string;
  title: string;
  stations: RadioStation[];
  currentStationId?: string;
  onSelectStation: (blockId: string, stationId: string | null) => void;
  isDark?: boolean;
}

export function RadioBlock({ blockId, title, stations, currentStationId, onSelectStation, isDark = true }: RadioBlockProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);

  const currentStation = stations.find((s) => s.id === currentStationId);

  const btnClass = isDark
    ? 'bg-neutral-800/50 hover:bg-neutral-700/50 text-neutral-300'
    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700';

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handlePlay = (station: RadioStation) => {
    if (currentStationId === station.id && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      onSelectStation(blockId, station.id);
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    if (currentStation && audioRef.current) {
      audioRef.current.src = currentStation.streamUrl;
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [currentStationId, currentStation, isPlaying]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        {currentStation && isPlaying && (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button onClick={toggleMute} className={`p-1 rounded cursor-pointer ${isDark ? 'hover:bg-neutral-700' : 'hover:bg-neutral-200'}`}>
              {isMuted ? (
                <VolumeX className={`w-3.5 h-3.5 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`} />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-[var(--accent-color)]" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-12 h-1 accent-[var(--accent-color)]"
            />
          </div>
        )}
      </div>

      <audio ref={audioRef} />

      {/* Now playing */}
      {currentStation && isPlaying && (
        <div className="mb-2 px-2 py-1.5 bg-[var(--accent-color)]/20 border border-[var(--accent-color)]/30 rounded">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-[var(--accent-color)] rounded-full animate-pulse" />
            <span className="text-xs font-medium truncate">{currentStation.name}</span>
          </div>
        </div>
      )}

      {/* Stations list */}
      <div className="flex-1 overflow-auto grid grid-cols-2 gap-1 content-start">
        {stations.map((station) => {
          const isActive = currentStationId === station.id && isPlaying;
          return (
            <button
              key={station.id}
              onClick={(e) => { e.stopPropagation(); handlePlay(station); }}
              className={`
                flex items-center gap-1.5 px-2 py-1.5 rounded text-left transition-all cursor-pointer
                ${isActive
                  ? 'bg-[var(--accent-color)]/20 border border-[var(--accent-color)]/50'
                  : `${btnClass} border border-transparent`}
              `}
            >
              {isActive ? (
                <Pause className={`w-3 h-3 flex-shrink-0 ${isDark ? 'text-neutral-200' : 'text-neutral-700'}`} />
              ) : (
                <Play className={`w-3 h-3 flex-shrink-0 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`} />
              )}
              <span className="text-xs truncate">
                {station.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
