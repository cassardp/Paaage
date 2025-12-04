import type { Config } from '../types/config';

// Export/Import de config (utilisé par SettingsDrawer)
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
