import { useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import type { NoteItem } from '../types/config';

interface NotesBlockProps {
  blockId: string;
  title: string;
  items: NoteItem[];
  onAddNote: (blockId: string, content: string) => void;
  onDeleteNote: (blockId: string, noteId: string) => void;
  isDark?: boolean;
}

export function NotesBlock({ blockId, title, items, onAddNote, onDeleteNote, isDark = true }: NotesBlockProps) {
  const [newNote, setNewNote] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newNote.trim()) {
      e.stopPropagation();
      onAddNote(blockId, newNote.trim());
      setNewNote('');
    }
  };

  const inputClass = isDark
    ? 'bg-neutral-800/50 border-neutral-700 text-neutral-100 placeholder-neutral-500'
    : 'bg-neutral-100 border-neutral-200 text-neutral-900 placeholder-neutral-400';
  const itemClass = isDark
    ? 'bg-neutral-800/50 hover:bg-neutral-700/50'
    : 'bg-neutral-100 hover:bg-neutral-200';

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-sm font-semibold mb-2">{title}</h3>

      <input
        type="text"
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        placeholder="Nouvelle note..."
        className={`w-full px-2 py-1.5 mb-2 border rounded text-xs focus:outline-none focus:border-[var(--accent-color)] ${inputClass}`}
      />

      <div className="flex-1 overflow-auto space-y-1">
        {items.map((note) => (
          <div
            key={note.id}
            className={`group flex items-start gap-1.5 p-2 rounded transition-colors ${itemClass}`}
          >
            <p className="flex-1 text-xs break-words">{note.content}</p>
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteNote(blockId, note.id); }}
              className="p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className={`w-3 h-3 hover:text-red-400 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`} />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-xs text-neutral-500 text-center py-2">Aucune note</p>
        )}
      </div>
    </div>
  );
}
