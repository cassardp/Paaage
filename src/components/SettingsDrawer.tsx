import { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Config } from '../types/config';

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  config: Config;
}

export function SettingsDrawer({ open, onClose, config }: SettingsDrawerProps) {
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

                {/* Content - temporairement vide */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    Aucun paramètre disponible pour le moment.
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
