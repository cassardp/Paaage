import { useState, useEffect, useRef } from 'react';
import { Search, CloudSun, Bookmark, FileText, Headphones, TrendingUp, ListTodo, Clock, Newspaper } from 'lucide-react';

interface SlashMenuItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  action: () => void;
}

interface SlashMenuProps {
  onAddSearch: () => void;
  onAddWeather: () => void;
  onAddBookmark: () => void;
  onAddNote: () => void;
  onAddStation: () => void;
  onAddStock: () => void;
  onAddTodo: () => void;
  onAddClock: () => void;
  onAddNews: () => void;
  hasSearchBlock: boolean;
  isDark: boolean;
}

export function SlashMenu({
  onAddSearch,
  onAddWeather,
  onAddBookmark,
  onAddNote,
  onAddStation,
  onAddStock,
  onAddTodo,
  onAddClock,
  onAddNews,
  hasSearchBlock,
  isDark,
}: SlashMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const allItems: SlashMenuItem[] = [
    ...(!hasSearchBlock ? [{ id: 'search', icon: Search, label: 'Recherche', description: 'Barre de recherche', action: onAddSearch }] : []),
    { id: 'weather', icon: CloudSun, label: 'Météo', description: 'Afficher la météo', action: onAddWeather },
    { id: 'bookmark', icon: Bookmark, label: 'Lien', description: 'Raccourci vers un site', action: onAddBookmark },
    { id: 'note', icon: FileText, label: 'Note', description: 'Bloc de texte', action: onAddNote },
    { id: 'radio', icon: Headphones, label: 'Radio', description: 'Station de radio', action: onAddStation },
    { id: 'stock', icon: TrendingUp, label: 'Stock', description: 'Cours de bourse', action: onAddStock },
    { id: 'todo', icon: ListTodo, label: 'Todo', description: 'Liste de tâches', action: onAddTodo },
    { id: 'clock', icon: Clock, label: 'Horloge', description: 'Heure d\'une ville', action: onAddClock },
    { id: 'news', icon: Newspaper, label: 'News', description: 'Actualités Hacker News', action: onAddNews },
  ];

  const filteredItems = allItems.filter(item =>
    item.label.toLowerCase().includes(filter.toLowerCase()) ||
    item.description.toLowerCase().includes(filter.toLowerCase())
  );

  // Écouter la touche /
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if (e.key === '/' && !isInput && !isOpen) {
        e.preventDefault();
        setIsOpen(true);
        setFilter('');
        setSelectedIndex(0);
      }

      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus l'input quand le menu s'ouvre
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Reset l'index quand le filtre change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filter]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filteredItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
      e.preventDefault();
      filteredItems[selectedIndex].action();
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={() => setIsOpen(false)}
    >
      <div 
        className={`w-80 rounded-lg border shadow-xl overflow-hidden ${
          isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-2 border-b border-neutral-700/30">
          <input
            ref={inputRef}
            type="text"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher un bloc..."
            className={`w-full px-3 py-2 rounded text-sm bg-transparent border-none outline-none ${
              isDark ? 'text-neutral-300 placeholder-neutral-500' : 'text-neutral-700 placeholder-neutral-400'
            }`}
          />
        </div>
        <div className="max-h-64 overflow-auto p-1">
          {filteredItems.length === 0 ? (
            <p className={`px-3 py-2 text-sm ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
              Aucun résultat
            </p>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => { item.action(); setIsOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded text-left cursor-pointer transition-colors ${
                    index === selectedIndex
                      ? isDark ? 'bg-neutral-700' : 'bg-neutral-100'
                      : ''
                  } ${isDark ? 'hover:bg-neutral-700' : 'hover:bg-neutral-100'}`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`} />
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                      {item.label}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
