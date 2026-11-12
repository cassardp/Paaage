import { Upload } from 'lucide-react';
import { exportConfig } from '../lib/storage';
import type { Config } from '../types/config';

interface ShutdownNoticeProps {
  config: Config;
  isDark: boolean;
}

export function ShutdownNotice({ config, isDark }: ShutdownNoticeProps) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-40 w-72 p-4 rounded-lg border shadow-lg text-sm ${isDark ? 'bg-neutral-800 border-neutral-700 text-neutral-200' : 'bg-white border-neutral-200 text-neutral-700'}`}
    >
      <p className="font-semibold mb-1">Paaage is shutting down</p>
      <p className={`mb-3 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
        The service will stop on January 10, 2027. After that date, your pages will no longer be saved or synced. Export your data to keep a copy.
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
