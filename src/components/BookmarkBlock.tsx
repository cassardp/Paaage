import { getLinkTarget } from '../constants/links';
import type { Config } from '../types/config';

interface BookmarkBlockProps {
  label: string;
  url: string;
  height: number;
  isDark?: boolean;
  config: Config;
}

export function BookmarkBlock({ label, url, height, isDark = true, config }: BookmarkBlockProps) {
  // Taille du texte selon la hauteur (2, 3 ou 4 cellules)
  const textSize = height <= 2 ? 'text-sm' : height === 3 ? 'text-lg' : 'text-2xl';

  return (
    <a
      href={url}
      target={getLinkTarget(config)}
      rel="noopener noreferrer"
      className="w-full h-full flex items-center justify-center group"
    >
      <span className={`font-medium truncate transition-colors ${textSize}
                       ${isDark ? 'text-neutral-200 group-hover:text-[var(--accent-color)]' : 'text-neutral-700 group-hover:text-neutral-500'}`}>
        {label}
      </span>
    </a>
  );
}
