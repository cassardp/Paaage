import { useState, useEffect, useCallback, useRef } from 'react';
import type { Config } from '../types/config';
import { DEFAULT_CONFIG } from '../lib/defaultConfig';

const API_URL = import.meta.env.VITE_SYNC_API_URL;
const SYNC_ID_KEY = 'paaage-sync-id';

// Récupérer ou créer l'ID de sync
function getSyncId(): string {
  // Priorité à l'URL (pour partage)
  const urlParams = new URLSearchParams(window.location.search);
  const urlId = urlParams.get('sync');
  if (urlId) {
    localStorage.setItem(SYNC_ID_KEY, urlId);
    return urlId;
  }

  // Sinon, récupérer ou créer un ID
  let id = localStorage.getItem(SYNC_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SYNC_ID_KEY, id);
  }
  return id;
}

export function getShareUrl(): string {
  const syncId = getSyncId();
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?sync=${syncId}`;
}

export function useCloudStorage(): [
  Config,
  (value: Config | ((prev: Config) => Config)) => void,
  { loading: boolean; syncing: boolean; syncId: string }
] {
  const syncId = getSyncId();
  const [config, setConfig] = useState<Config>({ ...DEFAULT_CONFIG, updatedAt: new Date().toISOString() });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Ref pour le debounce de sauvegarde
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingDataRef = useRef<Config | null>(null);

  // Charger depuis le cloud
  const loadFromCloud = useCallback(async () => {
    setSyncing(true);
    try {
      const res = await fetch(`${API_URL}?id=${syncId}`);
      if (!res.ok) throw new Error('Failed to load');
      const json = await res.json();
      // Accepter les deux formats: ancien (blocks) et nouveau (desktops)
      if (json && (json.blocks || json.desktops)) {
        setConfig(json as Config);
      }
    } catch (e) {
      console.warn('[Cloud] Load error:', e);
    } finally {
      setSyncing(false);
      setLoading(false);
    }
  }, [syncId]);

  // Charger au démarrage
  useEffect(() => {
    loadFromCloud();
  }, [loadFromCloud]);

  // Sauvegarder avec debounce
  const saveToCloud = useCallback(async (newConfig: Config) => {
    pendingDataRef.current = newConfig;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      const dataToSave = pendingDataRef.current;
      if (!dataToSave) return;

      setSyncing(true);
      try {
        const res = await fetch(`${API_URL}?id=${syncId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSave),
        });
        if (!res.ok) throw new Error('Failed to save');
        console.log('[Cloud] Saved');
      } catch (e) {
        console.error('[Cloud] Save error:', e);
      } finally {
        setSyncing(false);
        pendingDataRef.current = null;
      }
    }, 300);
  }, [syncId]);

  // Wrapper pour setConfig qui sauvegarde aussi
  const setConfigAndSync = useCallback((value: Config | ((prev: Config) => Config)) => {
    setConfig(prev => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      const updated = { ...newValue, updatedAt: new Date().toISOString() };
      saveToCloud(updated);
      return updated;
    });
  }, [saveToCloud]);

  return [config, setConfigAndSync, { loading, syncing, syncId }];
}
