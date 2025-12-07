import { useCallback } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Spinner } from './Spinner';
import { FlipCard } from './FlipCard';
import { useDataCache } from '../hooks/useDataCache';

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

// Cache TTL: 5 minutes for stock data
const STOCK_CACHE_TTL = 5 * 60 * 1000;

async function fetchStockData(symbol: string): Promise<StockData> {
  const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
  const res = await fetch(
    `https://api.allorigins.win/raw?url=${encodeURIComponent(yahooUrl)}`
  );
  
  if (!res.ok) {
    throw new Error('Symbol not found');
  }
  
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Symbol not found');
  }
  
  const quote = data.chart?.result?.[0];
  if (!quote) {
    throw new Error('Symbol not found');
  }

  const meta = quote.meta;
  const price = meta?.regularMarketPrice;
  const previousClose = meta?.chartPreviousClose || meta?.previousClose;
  
  if (price == null || previousClose == null) {
    throw new Error('Data not available');
  }
  
  const change = price - previousClose;
  const changePercent = (change / previousClose) * 100;

  return { price, change, changePercent };
}

export function StockBlock({ symbol, isDark = true, width = 12, onUpdateSymbol }: StockBlockProps) {
  const fetcher = useCallback(() => fetchStockData(symbol), [symbol]);
  
  const { data: stock, loading, error } = useDataCache<StockData>({
    key: `stock_${symbol}`,
    ttl: STOCK_CACHE_TTL,
    fetcher,
  });

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
