import { useState, useEffect } from 'react';
import { Newspaper, ExternalLink } from 'lucide-react';

interface NewsItem {
  title: string;
  url: string;
}

interface NewsBlockProps {
  isDark?: boolean;
}

export function NewsBlock({ isDark = true }: NewsBlockProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Hacker News API (gratuite, pas de clé)
        const res = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
        const ids: number[] = await res.json();
        
        const items = await Promise.all(
          ids.slice(0, 8).map(async (id) => {
            const item = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json());
            return { title: item.title, url: item.url || `https://news.ycombinator.com/item?id=${id}` };
          })
        );
        setNews(items);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const textClass = isDark ? 'text-neutral-200' : 'text-neutral-800';
  const mutedClass = isDark ? 'text-neutral-500' : 'text-neutral-400';
  const hoverClass = isDark ? 'hover:bg-neutral-800/50' : 'hover:bg-neutral-100';

  if (loading) {
    return (
      <div className={`h-full flex items-center justify-center ${mutedClass}`}>
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`h-full flex items-center justify-center ${mutedClass} text-sm`}>
        Erreur de chargement
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-3 overflow-hidden">
      <div className={`flex items-center gap-2 mb-2 ${mutedClass}`}>
        <Newspaper className="w-4 h-4" />
        <span className="text-xs font-medium uppercase tracking-wide">Hacker News</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1">
        {news.map((item, i) => (
          <a
            key={i}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex items-start gap-2 py-1.5 px-2 -mx-2 rounded text-sm ${textClass} ${hoverClass} transition-colors`}
          >
            <span className="flex-1 line-clamp-2">{item.title}</span>
            <ExternalLink className={`w-3 h-3 mt-1 opacity-0 group-hover:opacity-50 transition-opacity flex-shrink-0`} />
          </a>
        ))}
      </div>
    </div>
  );
}
