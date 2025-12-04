import { useState, useEffect, useRef } from 'react';
import { LinkifyText } from './LinkifyText';

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
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setValue(content);
  }, [content]);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
      setIsEditing(true);
      onFocused?.();
    }
  }, [autoFocus, onFocused]);

  const handleBlur = () => {
    setIsEditing(false);
    if (value !== content) {
      onUpdate(blockId, value);
    }
  };

  const handleClick = () => {
    setIsEditing(true);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const textClass = isDark ? 'text-neutral-300' : 'text-neutral-600';

  return (
    <div className="h-full">
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          className={`w-full h-full resize-none bg-transparent border-none outline-none text-sm
                     ${isDark ? 'text-neutral-300 placeholder-neutral-500' : 'text-neutral-600 placeholder-neutral-400'}`}
          placeholder="Écrivez votre note..."
        />
      ) : (
        <div 
          onClick={handleClick}
          className={`w-full h-full text-sm whitespace-pre-wrap cursor-text ${textClass}`}
        >
          {value ? (
            <LinkifyText text={value} isDark={isDark} />
          ) : (
            <span className={isDark ? 'text-neutral-500' : 'text-neutral-400'}>
              Écrivez votre note...
            </span>
          )}
        </div>
      )}
    </div>
  );
}
