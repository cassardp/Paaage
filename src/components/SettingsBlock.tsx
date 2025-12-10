import { useRef } from 'react';
import { Download, Upload, Cloud } from 'lucide-react';
import { exportConfig, importConfig } from '../lib/storage';
import type { Config } from '../types/config';

interface SettingsBlockProps {
  isDark: boolean;
  config: Config;
  syncId: string;
  syncing: boolean;
  canUndo: boolean;
  dragLocked: boolean;
  notesHidden: boolean;
  hasNotesOrTodos: boolean;
  onToggleTheme: () => void;
  onToggleLinkTarget: () => void;
  onToggleDragLock: () => void;
  onToggleNotesHidden: () => void;
  onUndo: () => void;
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
          ? 'bg-[var(--accent-color)]'
          : isDark ? 'bg-neutral-600' : 'bg-neutral-300'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-[18px]' : 'translate-x-1'
        }`}
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
          {description}{shortcut && ` · ${shortcut}`}
        </p>
      </div>
      <Toggle enabled={enabled} onChange={onChange} isDark={isDark} />
    </div>
  );
}

export function SettingsBlock({
  isDark,
  config,
  syncId,
  syncing,
  dragLocked,
  notesHidden,
  hasNotesOrTodos,
  onToggleTheme,
  onToggleLinkTarget,
  onToggleDragLock,
  onToggleNotesHidden,
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
          label="Lock blocks"
          description="Prevent moving and resizing"
          shortcut="Shift + L"
          enabled={dragLocked}
          onChange={onToggleDragLock}
          isDark={isDark}
        />

        {hasNotesOrTodos && (
          <SettingRow
            label="Hide notes"
            description="Show only bookmarks and search"
            shortcut="Shift + M"
            enabled={notesHidden}
            onChange={onToggleNotesHidden}
            isDark={isDark}
          />
        )}
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
          <span>{syncId ? 'Sync' : 'Sync'}</span>
        </button>
      </div>
    </div>
  );
}
