import { useState, useEffect } from 'react';

interface NoteBlockProps {
  blockId: string;
  content: string;
  onUpdate: (blockId: string, content: string) => void;
  isDark?: boolean;
}

export function NoteBlock({ blockId, content, onUpdate, isDark = true }: NoteBlockProps) {
  const [value, setValue] = useState(content);

  useEffect(() => {
    setValue(content);
  }, [content]);

  const handleBlur = () => {
    if (value !== content) {
      onUpdate(blockId, value);
    }
  };

  return (
    <div className="h-full">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        className={`w-full h-full resize-none bg-transparent border-none outline-none text-sm
                   ${isDark ? 'text-neutral-300 placeholder-neutral-500' : 'text-neutral-600 placeholder-neutral-400'}`}
        placeholder="Écrivez votre note..."
      />
    </div>
  );
}
