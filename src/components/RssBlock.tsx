import { useState, useEffect, useRef, useCallback } from 'react';
import { Spinner } from './Spinner';
import { getLinkTarget } from '../constants/links';
import type { Config } from '../types/config';
import { useDataCache } from '../hooks/useDataCache';

interface RssItem {
  title: string;
  link: string;
}

interface RssBlockProps {
  feedUrl?: string;
  isDark?: boolean;
  onUpdateFeedUrl?: (url: string) => void;
  config: Config;
}

export function RssBlock({ feedUrl = 'https://news.ycombinator.com/rss', isDark = true, onUpdateFeedUrl, config }: RssBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editUrl, setEditUrl] = useState(feedUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchRss = useCallback(async () => {
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(feedUrl)}`;
    const res = await fetch(proxyUrl);
    const text = await res.text();

    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'text/xml');

    const itemElements = xml.querySelectorAll('item');
    const parsedItems: RssItem[] = [];

    itemElements.forEach((item, index) => {
      if (index < 20) {
        const title = item.querySelector('title')?.textContent || '';
        const link = item.querySelector('link')?.textContent || '';
        if (title && link) {
          parsedItems.push({ title, link });
        }
      }
    });

    if (parsedItems.length === 0) {
      throw new Error('Loading error');
    }

    return parsedItems;
  }, [feedUrl]);

  const { data: items, loading, error } = useDataCache<RssItem[]>({
    cacheKey: `rss-${feedUrl}`,
    fetchFn: fetchRss,
    ttl: 15 * 60 * 1000, // 15 minutes
  });

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleEdit = () => {
    setEditUrl(feedUrl);
    setIsEditing(true);
  };

  const handleSave = () => {
    const trimmed = editUrl.trim();
    if (trimmed && trimmed !== feedUrl && onUpdateFeedUrl) {
      try {
        new URL(trimmed); // Validate URL before saving
        onUpdateFeedUrl(trimmed);
      } catch {
        // Invalid URL, don't save
      }
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') setIsEditing(false);
  };

  const mutedClass = isDark ? 'text-neutral-500' : 'text-neutral-400';

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner isDark={isDark} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2">
        <div className={`${mutedClass} text-sm`}>Loading error</div>
        <span
          onClick={handleEdit}
          className={`text-xs cursor-pointer hover:underline ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}
        >
          Edit URL
        </span>
        {isEditing && (
          <input
            ref={inputRef}
            type="text"
            value={editUrl}
            onChange={(e) => setEditUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            placeholder="RSS feed URL"
            className={`mt-2 bg-transparent border-none outline-none text-xs text-center w-full ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}
          />
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editUrl}
          onChange={(e) => setEditUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          placeholder="RSS feed URL"
          className={`mb-2 bg-transparent border-none outline-none text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}
        />
      ) : (
        <span
          onClick={handleEdit}
          className={`text-xs ${mutedClass} mb-2 truncate cursor-pointer hover:underline`}
          title="Click to edit URL"
        >
          {(() => { try { return new URL(feedUrl).hostname; } catch { return feedUrl; } })()}
        </span>
      )}
      <div className="flex-1 overflow-y-auto space-y-1 scrollbar-hide">
        {items?.map((item, i) => (
          <a
            key={i}
            href={item.link}
            target={getLinkTarget(config)}
            rel="noopener noreferrer"
            className={`block py-1.5 text-sm hover:underline ${isDark ? 'text-neutral-200 hover:text-neutral-400' : 'text-neutral-700 hover:text-neutral-500'} transition-colors`}
          >
            {item.title}
          </a>
        ))}
      </div>
    </div>
  );
}
