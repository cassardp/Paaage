import { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Config } from '../types/config';

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  config: Config;
  onToggleLinkTarget: () => void;
}

export function SettingsDrawer({ open, onClose, config, onToggleLinkTarget }: SettingsDrawerProps) {
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
                      Settings
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
                  {/* Link Target Setting */}
                  <div className="space-y-2">
                    <h3 className={`text-sm font-medium ${isDark ? 'text-neutral-200' : 'text-neutral-800'}`}>
                      Links
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                        Open links in new tab
                      </span>
                      <button
                        onClick={onToggleLinkTarget}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${config.settings.linkTarget === '_blank'
                            ? 'bg-[var(--accent-color)]'
                            : isDark ? 'bg-neutral-600' : 'bg-neutral-300'
                          }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.settings.linkTarget === '_blank' ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
