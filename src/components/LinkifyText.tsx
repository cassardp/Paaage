interface LinkifyTextProps {
  text: string;
  className?: string;
  isDark?: boolean;
}

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

export function LinkifyText({ text, className, isDark = true }: LinkifyTextProps) {
  const parts = text.split(URL_REGEX);
  
  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (URL_REGEX.test(part)) {
          // Reset regex lastIndex
          URL_REGEX.lastIndex = 0;
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={`underline cursor-pointer ${isDark ? 'text-neutral-400 hover:text-neutral-200' : 'text-neutral-500 hover:text-neutral-700'}`}
            >
              {part}
            </a>
          );
        }
        return part;
      })}
    </span>
  );
}
