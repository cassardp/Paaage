import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface UseDataCacheOptions<T> {
  key: string;
  ttl: number; // Time to live in milliseconds
  fetcher: () => Promise<T>;
  enabled?: boolean;
}

const CACHE_PREFIX = 'paaage_cache_';

function getCachedData<T>(key: string): CacheEntry<T> | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw) as CacheEntry<T>;
  } catch {
    return null;
  }
}

function setCachedData<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = { data, timestamp: Date.now() };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // localStorage full or unavailable
  }
}

export function useDataCache<T>({ key, ttl, fetcher, enabled = true }: UseDataCacheOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  const fetchData = useCallback(async (force = false) => {
    if (!enabled) return;

    // Check cache first (unless forced)
    if (!force) {
      const cached = getCachedData<T>(key);
      if (cached && Date.now() - cached.timestamp < ttl) {
        setData(cached.data);
        setLoading(false);
        return;
      }
    }

    try {
      const result = await fetcher();
      setData(result);
      setCachedData(key, result);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Loading error');
    } finally {
      setLoading(false);
    }
  }, [key, ttl, fetcher, enabled]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    // Initial load from cache or fetch
    const cached = getCachedData<T>(key);
    if (cached) {
      setData(cached.data);
      setLoading(false);
      
      // If cache is stale, fetch in background
      if (Date.now() - cached.timestamp >= ttl) {
        fetchData(true);
      }
    } else {
      fetchData(true);
    }

    // Set up periodic refresh
    intervalRef.current = window.setInterval(() => {
      fetchData(true);
    }, ttl);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [key, ttl, enabled, fetchData]);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchData(true);
  }, [fetchData]);

  return { data, loading, error, refresh };
}
