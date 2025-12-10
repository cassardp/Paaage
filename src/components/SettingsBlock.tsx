import { useRef } from 'react';
import { Download, Upload, Cloud } from 'lucide-react';
import { exportConfig, importConfig } from '../lib/storage';
import type { Config } from '../types/config';

interface SettingsBlockProps {
  isDark: boolean;
  config: Config;
  syncing: boolean;
  dragLocked: boolean;
  notesHidden: boolean;
  onToggleTheme: () => void;
  onToggleLinkTarget: () => void;
  onToggleDragLock: () => void;
  onToggleNotesHidden: () => void;
  onToggleGridLines: () => void;
  onImport: (config: Config) => void;
  onShowQRModal: () => void;
}

// Toggle component
function Toggle({ enabled, onChange, isDark }: { enabled: boolean; onChange: () => void; isDark: boolean }) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
        enabled
          ? isDark ? 'bg-neutral-400' : 'bg-[var(--accent-color)]'
          : isDark ? 'bg-neutral-700' : 'bg-neutral-300'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full transition-transform ${
          enabled ? 'translate-x-[18px]' : 'translate-x-1'
        } ${isDark ? 'bg-neutral-300' : 'bg-white'}`}
      />
    </button>
  );
}

// Setting row component
function SettingRow({ 
  label, 
  description, 
  shortcut,
  enabled, 
  onChange, 
  isDark 
}: { 
  label: string; 
  description: string; 
  shortcut?: string;
  enabled: boolean; 
  onChange: () => void; 
  isDark: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="min-w-0">
        <p className={`text-sm font-medium ${isDark ? 'text-neutral-200' : 'text-neutral-700'}`}>
          {label}
        </p>
        <p className={`text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
          {description}
        </p>
        {shortcut && (
          <kbd className={`mt-1 inline-block px-1.5 py-0.5 text-[10px] font-mono rounded ${
            isDark 
              ? 'bg-neutral-700 text-neutral-400 border border-neutral-600' 
              : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
          }`}>
            {shortcut}
          </kbd>
        )}
      </div>
      <Toggle enabled={enabled} onChange={onChange} isDark={isDark} />
    </div>
  );
}

export function SettingsBlock({
  isDark,
  config,
  syncing,
  dragLocked,
  notesHidden,
  onToggleTheme,
  onToggleLinkTarget,
  onToggleDragLock,
  onToggleNotesHidden,
  onToggleGridLines,
  onImport,
  onShowQRModal,
}: SettingsBlockProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => exportConfig(config);
  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const imported = await importConfig(file);
        onImport(imported);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Import error');
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const buttonClass = `flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
    isDark
      ? 'bg-neutral-700 hover:bg-neutral-600 text-neutral-300'
      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
  }`;

  return (
    <div className="h-full flex flex-col overflow-auto">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Title */}
      <span className={`text-xs mb-2 uppercase ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
        Settings
      </span>

      {/* Toggles */}
      <div className="space-y-1">
        <SettingRow
          label="Dark mode"
          description="Switch between light and dark theme"
          enabled={isDark}
          onChange={onToggleTheme}
          isDark={isDark}
        />

        <SettingRow
          label="New tab"
          description="Open links in a new browser tab"
          enabled={config.settings.linkTarget === '_blank'}
          onChange={onToggleLinkTarget}
          isDark={isDark}
        />

        <SettingRow
          label="Hide grid"
          description="Hide background grid lines"
          shortcut="Shift + G"
          enabled={config.settings.hideGridLines ?? false}
          onChange={onToggleGridLines}
          isDark={isDark}
        />

        <SettingRow
          label="Lock blocks"
          description="Prevent moving and resizing"
          shortcut="Shift + L"
          enabled={dragLocked}
          onChange={onToggleDragLock}
          isDark={isDark}
        />

        <SettingRow
          label="Hide blocks"
          description="Hide all blocks except settings"
          shortcut="Shift + M"
          enabled={notesHidden}
          onChange={onToggleNotesHidden}
          isDark={isDark}
        />
      </div>

      {/* Separator */}
      <div className={`border-t my-3 ${isDark ? 'border-neutral-700' : 'border-neutral-200'}`} />

      {/* Actions */}
      <div className="grid grid-cols-3 gap-2">
        <button onClick={handleImportClick} className={buttonClass}>
          <Download className="w-3.5 h-3.5" />
          <span>Import</span>
        </button>

        <button onClick={handleExport} className={buttonClass}>
          <Upload className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>

        <button onClick={onShowQRModal} className={`${buttonClass} ${syncing ? 'animate-pulse' : ''}`}>
          <Cloud className="w-3.5 h-3.5" />
          <span>Sync</span>
        </button>
      </div>
    </div>
  );
}
