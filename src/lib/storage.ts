import type { Config } from '../types/config';
import { DEFAULT_CONFIG } from './defaultConfig';

const STORAGE_KEY = 'paaage-config';

// URL Val.town pour la synchronisation (à configurer)
const VALTOWN_URL = import.meta.env.VITE_VALTOWN_URL || '';

export function loadConfig(): Config {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as Config;
    }
  } catch (e) {
    console.warn('Erreur lecture localStorage:', e);
  }
  return { ...DEFAULT_CONFIG, updatedAt: new Date().toISOString() };
}

export function saveConfig(config: Config): void {
  const updated = { ...config, updatedAt: new Date().toISOString() };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Erreur sauvegarde localStorage:', e);
  }
  // Sync async avec Val.town (non bloquant)
  syncToValtown(updated);
}

async function syncToValtown(config: Config): Promise<void> {
  if (!VALTOWN_URL) return;
  try {
    await fetch(VALTOWN_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
  } catch {
    // Erreurs ignorées silencieusement
  }
}

export async function fetchRemoteConfig(): Promise<Config | null> {
  if (!VALTOWN_URL) return null;
  try {
    const res = await fetch(VALTOWN_URL);
    if (res.ok) {
      return (await res.json()) as Config;
    }
  } catch {
    // Erreurs ignorées
  }
  return null;
}

export function mergeWithRemote(local: Config, remote: Config | null): Config {
  if (!remote) return local;
  // Si la version distante est plus récente, on l'utilise
  if (new Date(remote.updatedAt) > new Date(local.updatedAt)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
    return remote;
  }
  return local;
}

export function exportConfig(config: Config): void {
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `paaage-config-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importConfig(file: File): Promise<Config> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string) as Config;
        if (config.version && config.blocks) {
          resolve(config);
        } else {
          reject(new Error('Format de configuration invalide'));
        }
      } catch {
        reject(new Error('Fichier JSON invalide'));
      }
    };
    reader.onerror = () => reject(new Error('Erreur lecture fichier'));
    reader.readAsText(file);
  });
}
