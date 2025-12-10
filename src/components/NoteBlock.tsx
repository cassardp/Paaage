import { useState, useEffect, useRef } from 'react';
import { LinkifyText } from './LinkifyText';
import type { Config } from '../types/config';

interface NoteBlockProps {
  blockId: string;
  content: string;
  title?: string;
  onUpdate: (blockId: string, content: string) => void;
  onUpdateTitle?: (title: string) => void;
  isDark?: boolean;
  autoFocus?: boolean;
  onFocused?: () => void;
  config: Config;
}

export function NoteBlock({ blockId, content, title = 'Note', onUpdate, onUpdateTitle, isDark = true, autoFocus, onFocused, config }: NoteBlockProps) {
  const [value, setValue] = useState(content);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef(value);
  const contentRef = useRef(content);

  // Garder les refs à jour
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

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

  // Sauvegarde automatique 1s après la dernière modification (debounce)
  useEffect(() => {
    if (value === content) return;

    const timeout = setTimeout(() => {
      onUpdate(blockId, value);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [value, blockId, onUpdate, content]);

  // Sauvegarde à la fermeture de la page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (valueRef.current !== contentRef.current) {
        onUpdate(blockId, valueRef.current);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [blockId, onUpdate]);

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

  const textClass = isDark ? 'text-neutral-200' : 'text-neutral-700';
  const mutedClass = isDark ? 'text-neutral-500' : 'text-neutral-400';

  const handleEditTitle = () => {
    setEditTitle(title);
    setIsEditingTitle(true);
    setTimeout(() => titleInputRef.current?.focus(), 0);
  };

  const handleSaveTitle = () => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== title && onUpdateTitle) {
      onUpdateTitle(trimmed);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveTitle();
    if (e.key === 'Escape') setIsEditingTitle(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Titre éditable */}
      {isEditingTitle ? (
        <input
          ref={titleInputRef}
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={handleTitleKeyDown}
          onBlur={handleSaveTitle}
          placeholder="Title"
          className={`mb-2 bg-transparent border-none outline-none text-xs uppercase tracking-wide ${mutedClass}`}
        />
      ) : (
        <span
          onClick={handleEditTitle}
          className={`text-xs ${mutedClass} mb-2 truncate cursor-pointer hover:underline uppercase tracking-wide`}
          title="Click to edit title"
        >
          {title}
        </span>
      )}
      {/* Contenu */}
      <div className="flex-1 overflow-hidden">
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleBlur}
            className={`w-full h-full resize-none bg-transparent border-none outline-none text-sm
                     ${isDark ? 'text-neutral-200 placeholder-neutral-500' : 'text-neutral-700 placeholder-neutral-400'}`}
            placeholder="Write your note..."
          />
        ) : (
          <div
            onClick={handleClick}
            className={`w-full h-full text-sm whitespace-pre-wrap cursor-text overflow-auto scrollbar-hide ${textClass}`}
          >
            {value ? (
              <LinkifyText text={value} isDark={isDark} config={config} />
            ) : (
              <span className={isDark ? 'text-neutral-500' : 'text-neutral-400'}>
                Write your note...
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
