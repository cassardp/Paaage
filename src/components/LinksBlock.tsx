import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { Link } from '../types/config';
import { getFaviconUrl } from '../lib/utils';

interface LinksBlockProps {
  blockId: string;
  title: string;
  links: Link[];
  onAddLink: (blockId: string, link: Omit<Link, 'id'>) => void;
  onDeleteLink: (blockId: string, linkId: string) => void;
  isDark?: boolean;
}

export function LinksBlock({ blockId, title, links, onAddLink, onDeleteLink, isDark = true }: LinksBlockProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const handleAdd = () => {
    if (newLabel.trim() && newUrl.trim()) {
      let url = newUrl.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      onAddLink(blockId, { label: newLabel.trim(), url });
      setNewLabel('');
      setNewUrl('');
      setIsAdding(false);
    }
  };

  const inputClass = isDark
    ? 'bg-neutral-800/50 border-neutral-700 text-neutral-100 placeholder-neutral-500'
    : 'bg-neutral-100 border-neutral-200 text-neutral-900 placeholder-neutral-400';
  const itemClass = isDark
    ? 'bg-neutral-800/50 hover:bg-neutral-700/50 text-neutral-200'
    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700';

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        <button
          onClick={(e) => { e.stopPropagation(); setIsAdding(!isAdding); }}
          className={`p-1 rounded transition-colors ${isDark ? 'hover:bg-neutral-700' : 'hover:bg-neutral-200'}`}
        >
          <Plus className={`w-3.5 h-3.5 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`} />
        </button>
      </div>

      {isAdding && (
        <div className={`mb-2 p-2 rounded-lg space-y-1.5 ${isDark ? 'bg-neutral-800/50' : 'bg-neutral-100'}`} onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Nom"
            className={`w-full px-2 py-1.5 border rounded text-xs focus:outline-none focus:border-[var(--accent-color)] ${inputClass}`}
          />
          <input
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="URL"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className={`w-full px-2 py-1.5 border rounded text-xs focus:outline-none focus:border-[var(--accent-color)] ${inputClass}`}
          />
          <button
            onClick={handleAdd}
            className="w-full py-1.5 bg-[var(--accent-color)] text-white rounded text-xs font-medium"
          >
            Ajouter
          </button>
        </div>
      )}

      <div className="flex-1 overflow-auto grid grid-cols-2 gap-1.5 content-start">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={`group relative flex items-center gap-1.5 px-2 py-1.5 rounded transition-all ${itemClass}`}
          >
            <img
              src={getFaviconUrl(link.url)}
              alt=""
              className="w-3.5 h-3.5 rounded-sm"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <span className="text-xs truncate">{link.label}</span>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDeleteLink(blockId, link.id);
              }}
              className="absolute -top-1 -right-1 p-0.5 bg-red-500/80 rounded-full opacity-0 group-hover:opacity-100
                         transition-opacity hover:bg-red-500"
            >
              <X className="w-2.5 h-2.5 text-white" />
            </button>
          </a>
        ))}
      </div>
    </div>
  );
}
