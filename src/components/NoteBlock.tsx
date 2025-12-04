import { useState, useEffect, useRef } from 'react';

interface NoteBlockProps {
  blockId: string;
  content: string;
  onUpdate: (blockId: string, content: string) => void;
  isDark?: boolean;
  autoFocus?: boolean;
  onFocused?: () => void;
}

export function NoteBlock({ blockId, content, onUpdate, isDark = true, autoFocus, onFocused }: NoteBlockProps) {
  const [value, setValue] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setValue(content);
  }, [content]);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
      onFocused?.();
    }
  }, [autoFocus, onFocused]);

  const handleBlur = () => {
    if (value !== content) {
      onUpdate(blockId, value);
    }
  };

  return (
    <div className="h-full">
      <textarea
        ref={textareaRef}
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
