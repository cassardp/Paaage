import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Spinner } from './Spinner';
import { FlipCard } from './FlipCard';

interface StockBlockProps {
  symbol: string;
  isDark?: boolean;
  width?: number;
  onUpdateSymbol?: (symbol: string) => void;
}

interface StockData {
  price: number;
  change: number;
  changePercent: number;
}

// Validation du symbole via Yahoo Finance
async function validateSymbol(symbol: string): Promise<boolean> {
  try {
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol.toUpperCase()}?interval=1d&range=1d`;
    const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(yahooUrl)}`);
    const data = await res.json();
    return !!data.chart?.result?.[0];
  } catch {
    return false;
  }
}

export function StockBlock({ symbol, isDark = true, width = 12, onUpdateSymbol }: StockBlockProps) {
  const [stock, setStock] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStock() {
      setLoading(true);
      setError(null);
      
      try {
        const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
        const res = await fetch(
          `https://api.allorigins.win/raw?url=${encodeURIComponent(yahooUrl)}`
        );
        
        if (!res.ok) {
          setError('Symbol not found');
          setLoading(false);
          return;
        }
        
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          setError('Symbol not found');
          setLoading(false);
          return;
        }
        
        const quote = data.chart?.result?.[0];
        if (!quote) {
          setError('Symbol not found');
          setLoading(false);
          return;
        }

        const meta = quote.meta;
        const price = meta?.regularMarketPrice;
        const previousClose = meta?.chartPreviousClose || meta?.previousClose;
        
        if (price == null || previousClose == null) {
          setError('Data not available');
          setLoading(false);
          return;
        }
        
        const change = price - previousClose;
        const changePercent = (change / previousClose) * 100;

        setStock({ price, change, changePercent });
        setLoading(false);
      } catch {
        setError('Loading error');
        setLoading(false);
      }
    }

    fetchStock();
    const interval = setInterval(fetchStock, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [symbol]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner size="sm" isDark={isDark} />
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
  const trendColor = isDark ? 'text-neutral-400' : 'text-neutral-500';

  return (
    <FlipCard
      editValue={symbol}
      onSave={(value) => onUpdateSymbol?.(value.toUpperCase())}
      validate={validateSymbol}
      isDark={isDark}
      placeholder="Symbol"
    >
      {(onFlip: () => void) => (
        <div className="h-full flex items-center justify-between">
          <div>
            <p 
              onClick={onFlip}
              className={`text-xs font-medium cursor-pointer hover:underline ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}
            >
              {symbol}
            </p>
            <p className={`text-xl font-medium ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
              ${stock.price.toFixed(2)}
            </p>
          </div>
          {width >= 12 && (
            <div className={`flex items-center gap-1 ${trendColor}`}>
              <TrendIcon className="w-4 h-4" />
              <span className="text-sm font-medium">
                {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
              </span>
            </div>
          )}
        </div>
      )}
    </FlipCard>
  );
}
