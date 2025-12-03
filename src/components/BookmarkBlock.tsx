interface BookmarkBlockProps {
  label: string;
  url: string;
  isDark?: boolean;
}

export function BookmarkBlock({ label, url, isDark = true }: BookmarkBlockProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="h-full flex items-center group"
    >
      <span className={`text-base font-medium truncate group-hover:text-[var(--accent-color)] transition-colors
                       ${isDark ? 'text-neutral-200' : 'text-neutral-700'}`}>
        {label}
      </span>
    </a>
  );
}
