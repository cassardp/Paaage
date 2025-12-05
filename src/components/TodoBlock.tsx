import { useState, useRef } from 'react';
import { Plus, X } from 'lucide-react';
import type { TodoItem } from '../types/config';
import { generateId } from '../lib/utils';
import { LinkifyText } from './LinkifyText';

interface TodoBlockProps {
  blockId: string;
  items: TodoItem[];
  onUpdate: (blockId: string, items: TodoItem[]) => void;
  isDark?: boolean;
}

export function TodoBlock({ blockId, items, onUpdate, isDark = true }: TodoBlockProps) {
  const [newText, setNewText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleItem = (itemId: string) => {
    const updated = items.map(item => 
      item.id === itemId ? { ...item, done: !item.done } : item
    );
    onUpdate(blockId, updated);
  };

  const addItem = () => {
    if (!newText.trim()) return;
    const newItem: TodoItem = { id: generateId(), text: newText.trim(), done: false };
    onUpdate(blockId, [...items, newItem]);
    setNewText('');
  };

  const removeItem = (itemId: string) => {
    onUpdate(blockId, items.filter(item => item.id !== itemId));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  };

  const checkboxClass = isDark
    ? 'border-neutral-600 checked:bg-neutral-500 checked:border-neutral-500'
    : 'border-neutral-300 checked:bg-neutral-400 checked:border-neutral-400';

  const textClass = isDark ? 'text-neutral-200' : 'text-neutral-700';
  const mutedClass = isDark ? 'text-neutral-500' : 'text-neutral-400';

  return (
    <div className="h-full flex flex-col">
      {/* Liste des tâches */}
      <div className="flex-1 overflow-auto space-y-2">
        {items.map(item => (
          <div key={item.id} className="flex items-start gap-2 group/todo">
            <input
              type="checkbox"
              checked={item.done}
              onChange={() => toggleItem(item.id)}
              className={`w-4 h-4 mt-0.5 rounded cursor-pointer accent-neutral-700 flex-shrink-0 ${checkboxClass}`}
            />
            <span 
              onClick={() => toggleItem(item.id)}
              className={`flex-1 text-sm cursor-pointer ${item.done ? `line-through ${mutedClass}` : textClass}`}
            >
              <LinkifyText text={item.text} isDark={isDark} />
            </span>
            <button
              onClick={() => removeItem(item.id)}
              className={`opacity-0 group-hover/todo:opacity-100 p-0.5 cursor-pointer ${mutedClass} hover:text-neutral-600 transition-opacity`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Ajout nouvelle tâche */}
      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-neutral-400/30">
        <input
          ref={inputRef}
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nouvelle tâche..."
          className={`flex-1 bg-transparent border-none outline-none text-sm
            ${isDark ? 'text-neutral-100 placeholder-neutral-500' : 'text-neutral-900 placeholder-neutral-400'}`}
        />
        <button
          onClick={addItem}
          className={`p-1 cursor-pointer ${mutedClass} hover:text-[var(--accent-color)] transition-colors`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
