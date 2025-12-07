import { useState, useRef } from 'react';
import { Plus, X } from 'lucide-react';
import type { TodoItem, Config } from '../types/config';
import { generateId } from '../lib/utils';
import { LinkifyText } from './LinkifyText';

interface TodoBlockProps {
  blockId: string;
  items: TodoItem[];
  onUpdate: (blockId: string, items: TodoItem[]) => void;
  isDark?: boolean;
  config: Config;
}

export function TodoBlock({ blockId, items, onUpdate, isDark = true, config }: TodoBlockProps) {
  const [newText, setNewText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

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

  const startEdit = (item: TodoItem) => {
    setEditingId(item.id);
    setEditText(item.text);
    setTimeout(() => editInputRef.current?.focus(), 0);
  };

  const saveEdit = () => {
    if (editingId && editText.trim()) {
      const updated = items.map(item =>
        item.id === editingId ? { ...item, text: editText.trim() } : item
      );
      onUpdate(blockId, updated);
    }
    setEditingId(null);
    setEditText('');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit();
    }
    if (e.key === 'Escape') {
      setEditingId(null);
      setEditText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  };

  const textClass = isDark ? 'text-neutral-300' : 'text-neutral-700';
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
              className={`w-4 h-4 mt-0.5 rounded cursor-pointer flex-shrink-0 border-[1.5px] ${isDark
                ? 'checkbox-dark border-neutral-500'
                : 'checkbox-light border-neutral-400'
                }`}
            />
            {editingId === item.id ? (
              <input
                ref={editInputRef}
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleEditKeyDown}
                onBlur={saveEdit}
                className={`flex-1 text-sm bg-transparent border-none outline-none ${textClass}`}
              />
            ) : (
              <span
                onClick={() => startEdit(item)}
                className={`flex-1 text-sm cursor-pointer ${item.done ? `line-through ${mutedClass}` : textClass}`}
              >
                <LinkifyText text={item.text} isDark={isDark} config={config} />
              </span>
            )}
            <button
              onClick={() => removeItem(item.id)}
              className={`opacity-0 group-hover/todo:opacity-100 p-0.5 cursor-pointer ${mutedClass} hover:text-neutral-600`}
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
          placeholder="New task..."
          className={`flex-1 bg-transparent border-none outline-none text-sm
            ${isDark ? 'text-neutral-300 placeholder-neutral-500' : 'text-neutral-700 placeholder-neutral-400'}`}
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
