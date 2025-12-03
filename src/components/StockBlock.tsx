import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Loader } from 'lucide-react';

interface StockBlockProps {
  symbol: string;
  isDark?: boolean;
}

interface StockData {
  price: number;
  change: number;
  changePercent: number;
}

export function StockBlock({ symbol, isDark = true }: StockBlockProps) {
  const [stock, setStock] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStock() {
      try {
        // Yahoo Finance via proxy CORS allorigins
        const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
        const res = await fetch(
          `https://api.allorigins.win/raw?url=${encodeURIComponent(yahooUrl)}`
        );
        const data = await res.json();
        
        const quote = data.chart?.result?.[0];
        if (!quote) {
          setError('Données non disponibles');
          setLoading(false);
          return;
        }

        const meta = quote.meta;
        const price = meta.regularMarketPrice;
        const previousClose = meta.chartPreviousClose || meta.previousClose;
        const change = price - previousClose;
        const changePercent = (change / previousClose) * 100;

        setStock({ price, change, changePercent });
        setLoading(false);
      } catch {
        setError('Erreur de chargement');
        setLoading(false);
      }
    }

    fetchStock();
    // Rafraîchir toutes les 5 minutes
    const interval = setInterval(fetchStock, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [symbol]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className={`w-5 h-5 animate-spin ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`} />
      </div>
    );
  }

  if (error || !stock) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>{error}</p>
      </div>
    );
  }

  const isPositive = stock.change >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const trendColor = isDark ? 'text-neutral-300' : 'text-neutral-600';

  return (
    <div className="h-full flex items-center justify-between">
      <div>
        <p className={`text-xs font-medium ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
          {symbol}
        </p>
        <p className={`text-xl font-semibold ${isDark ? 'text-neutral-100' : 'text-neutral-800'}`}>
          ${stock.price.toFixed(2)}
        </p>
      </div>
      <div className={`flex items-center gap-1 ${trendColor}`}>
        <TrendIcon className="w-4 h-4" />
        <span className="text-sm font-medium">
          {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}
