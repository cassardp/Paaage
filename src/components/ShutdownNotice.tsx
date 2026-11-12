import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { exportConfig } from '../lib/storage';
import type { Config } from '../types/config';

interface ShutdownNoticeProps {
  config: Config;
  isDark: boolean;
}

export function ShutdownNotice({ config, isDark }: ShutdownNoticeProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-40 w-72 p-4 rounded-lg border shadow-lg text-sm ${isDark ? 'bg-white border-neutral-200 text-neutral-900' : 'bg-neutral-900 border-neutral-800 text-neutral-100'}`}
    >
      <button
        onClick={() => setDismissed(true)}
        aria-label="Close"
        className={`absolute top-3 right-3 p-1 rounded cursor-pointer ${isDark ? 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
      >
        <X className="w-4 h-4" />
      </button>
      <p className="font-semibold mb-1 pr-6">Paaage is shutting down</p>
      <p className={`mb-3 ${isDark ? 'text-neutral-600' : 'text-neutral-400'}`}>
        The service will stop on December 10, 2026. After that date, your pages will no longer be saved or synced. Export your data to keep a copy.
      </p>
      <button
        onClick={() => exportConfig(config)}
        className="w-full py-2 rounded flex items-center justify-center gap-1.5 cursor-pointer bg-[var(--accent-color)] text-white font-medium"
      >
        <Upload className="w-3.5 h-3.5" />
        <span>Export my data</span>
      </button>
    </div>
  );
}
