import { useState, useEffect } from 'react';
import { Spinner } from './Spinner';

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
          ids.slice(0, 20).map(async (id) => {
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
      <div className={`h-full flex items-center justify-center ${mutedClass} text-sm`}>
        Erreur de chargement
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto space-y-1">
        {news.map((item, i) => (
          <a
            key={i}
            href={item.url}
            target="_self"
            rel="noopener noreferrer"
            className={`block py-1.5 text-sm underline ${isDark ? 'text-neutral-300 hover:text-neutral-400' : 'text-neutral-700 hover:text-neutral-500'} transition-colors`}
          >
            <span className="line-clamp-2">{item.title}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
