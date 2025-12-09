import { useState, useEffect, useRef, useCallback } from 'react';

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

interface UseDataCacheOptions<T> {
    cacheKey: string;
    fetchFn: () => Promise<T>;
    ttl: number; // Time to live in milliseconds
    enabled?: boolean;
}

// Global cache storage shared across all hook instances
const globalCache = new Map<string, CacheEntry<any>>();

export function useDataCache<T>({
    cacheKey,
    fetchFn,
    ttl,
    enabled = true,
}: UseDataCacheOptions<T>) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const fetchingRef = useRef(false);
    const intervalRef = useRef<number | null>(null);

    const isCacheValid = useCallback((entry: CacheEntry<T> | undefined): boolean => {
        if (!entry) return false;
        const now = Date.now();
        return now - entry.timestamp < entry.ttl;
    }, []);

    const fetchData = useCallback(async () => {
        // Prevent duplicate fetches
        if (fetchingRef.current) return;

        fetchingRef.current = true;
        setLoading(true);
        setError(null);

        try {
            const result = await fetchFn();

            // Update global cache
            globalCache.set(cacheKey, {
                data: result,
                timestamp: Date.now(),
                ttl,
            });

            setData(result);
            setLoading(false);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Loading error';
            setError(errorMessage);
            setLoading(false);
        } finally {
            fetchingRef.current = false;
        }
    }, [cacheKey, fetchFn, ttl]);

    const refetch = useCallback(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (!enabled) {
            setLoading(false);
            return;
        }

        // Check if we have valid cached data
        const cachedEntry = globalCache.get(cacheKey) as CacheEntry<T> | undefined;

        if (isCacheValid(cachedEntry)) {
            // Use cached data immediately
            setData(cachedEntry!.data);
            setLoading(false);

            // Set up interval to refresh when cache expires
            const timeUntilExpiry = cachedEntry!.ttl - (Date.now() - cachedEntry!.timestamp);

            intervalRef.current = setTimeout(() => {
                fetchData();
                // Set up recurring interval after first expiry
                intervalRef.current = setInterval(fetchData, ttl);
            }, timeUntilExpiry);
        } else {
            // No valid cache, fetch immediately
            fetchData();

            // Set up recurring interval
            intervalRef.current = setInterval(fetchData, ttl);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                clearTimeout(intervalRef.current);
            }
        };
    }, [cacheKey, enabled, fetchData, isCacheValid, ttl]);

    return { data, loading, error, refetch };
}
