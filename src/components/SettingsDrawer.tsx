import { useRef, useEffect } from 'react';
import { X, Download, Upload, Sun, Moon } from 'lucide-react';
import type { Config } from '../types/config';
import { exportConfig, importConfig, saveConfig } from '../lib/storage';

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  config: Config;
  onImport: (config: Config) => void;
  onToggleTheme: () => void;
}

export function SettingsDrawer({ open, onClose, config, onImport, onToggleTheme }: SettingsDrawerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const isDark = config.settings.theme === 'dark';

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  // Fermer avec clic outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (open && drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose]);

  const handleExport = () => {
    exportConfig(config);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const imported = await importConfig(file);
        saveConfig(imported);
        onImport(imported);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erreur import');
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const btnClass = isDark
    ? 'text-neutral-200 bg-neutral-700 hover:bg-neutral-600'
    : 'text-neutral-700 bg-neutral-100 hover:bg-neutral-200';

  return (
    <>
      <div className="fixed inset-0 overflow-hidden z-50 pointer-events-none">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
            <div
              ref={drawerRef}
              className={`pointer-events-auto w-screen max-w-md transform transition-transform duration-500 ease-in-out sm:duration-700 ${open ? 'translate-x-0' : 'translate-x-full'}`}
            >
              <div className={`h-full flex flex-col shadow-xl ${isDark ? 'bg-neutral-800' : 'bg-white'}`}>
                {/* Header */}
                <div className={`px-4 py-4 border-b ${isDark ? 'border-neutral-700' : 'border-neutral-200'}`}>
                  <div className="flex items-center justify-between">
                    <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                      Paramètres
                    </h2>
                    <button
                      onClick={onClose}
                      className={`p-2 rounded-lg transition-colors cursor-pointer ${isDark ? 'text-neutral-400 hover:text-white hover:bg-neutral-700' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'}`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {/* Thème */}
                  <div>
                    <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>
                      Apparence
                    </h3>
                    <button
                      onClick={onToggleTheme}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${btnClass}`}
                    >
                      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                      <span>{isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}</span>
                    </button>
                  </div>

                  {/* Import/Export */}
                  <div>
                    <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>
                      Données
                    </h3>
                    <div className="space-y-2">
                      <button
                        onClick={handleExport}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${btnClass}`}
                      >
                        <Download className="w-5 h-5" />
                        <span>Exporter la configuration</span>
                      </button>
                      <button
                        onClick={handleImportClick}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${btnClass}`}
                      >
                        <Upload className="w-5 h-5" />
                        <span>Importer une configuration</span>
                      </button>
                    </div>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
