import { useState, type FormEvent } from 'react';
import { Search } from 'lucide-react';
import { getLinkTarget } from '../constants/links';
import type { Config } from '../types/config';

interface SearchBlockProps {
  searchEngine: string;
  isDark?: boolean;
  config: Config;
}

export function SearchBlock({ searchEngine, isDark = true, config }: SearchBlockProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.open(searchEngine + encodeURIComponent(query.trim()), getLinkTarget(config));
      setQuery('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="h-full flex items-center">
      <div className="relative w-full">
        <Search className={`absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder=""
          autoFocus
          className={`w-full pl-8 pr-4 py-2 bg-transparent border-none outline-none
                     text-lg ${isDark ? 'text-neutral-100 placeholder-neutral-500' : 'text-neutral-900 placeholder-neutral-400'}`}
        />
      </div>
    </form>
  );
}
