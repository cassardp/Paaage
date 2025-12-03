import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface StationBlockProps {
  name: string;
  streamUrl: string;
  isDark?: boolean;
}

export function StationBlock({ name, streamUrl, isDark = true }: StationBlockProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(streamUrl);
    audioRef.current.volume = 0.5;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [streamUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="h-full flex items-center justify-between">
      <button
        onClick={togglePlay}
        className="flex items-center gap-2 group"
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 text-[var(--accent-color)]" />
        ) : (
          <Play className={`w-5 h-5 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`} />
        )}
        <span className={`text-sm font-medium ${isDark ? 'text-neutral-200' : 'text-neutral-700'}`}>
          {name}
        </span>
      </button>
      
      {isPlaying && (
        <button onClick={toggleMute} className="p-1">
          {isMuted ? (
            <VolumeX className={`w-4 h-4 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`} />
          ) : (
            <Volume2 className="w-4 h-4 text-[var(--accent-color)]" />
          )}
        </button>
      )}
    </div>
  );
}
