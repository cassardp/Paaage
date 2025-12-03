import { useRef, useState } from 'react';
import { Download, Upload, Sun, Moon, Plus, Search, Link, StickyNote, Radio, CloudSun } from 'lucide-react';
import type { Config } from '../types/config';
import { exportConfig, importConfig, saveConfig } from '../lib/storage';

interface ToolbarProps {
  config: Config;
  onImport: (config: Config) => void;
  onToggleTheme: () => void;
  onAddBlock: (type: 'search' | 'links' | 'notes' | 'radio' | 'weather') => void;
}

export function Toolbar({ config, onImport, onToggleTheme, onAddBlock }: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const isDark = config.settings.theme === 'dark';

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
    ? 'text-neutral-400 hover:text-neutral-100 bg-neutral-800/50 hover:bg-neutral-700'
    : 'text-neutral-600 hover:text-neutral-900 bg-neutral-200/50 hover:bg-neutral-300';

  const menuClass = isDark
    ? 'bg-neutral-800 border-neutral-700'
    : 'bg-white border-neutral-200';

  const menuItemClass = isDark
    ? 'hover:bg-neutral-700 text-neutral-200'
    : 'hover:bg-neutral-100 text-neutral-700';

  const handleAddBlock = (type: 'search' | 'links' | 'notes' | 'radio' | 'weather') => {
    onAddBlock(type);
    setShowAddMenu(false);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Bouton ajouter bloc */}
      <div className="relative">
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${btnClass}`}
          title="Ajouter un bloc"
        >
          <Plus className="w-4 h-4" />
        </button>

        {showAddMenu && (
          <div className={`absolute top-full right-0 mt-1 py-1 rounded-lg border shadow-lg min-w-[140px] ${menuClass}`}>
            <button
              onClick={() => handleAddBlock('search')}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${menuItemClass}`}
            >
              <Search className="w-4 h-4" />
              Recherche
            </button>
            <button
              onClick={() => handleAddBlock('links')}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${menuItemClass}`}
            >
              <Link className="w-4 h-4" />
              Liens
            </button>
            <button
              onClick={() => handleAddBlock('notes')}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${menuItemClass}`}
            >
              <StickyNote className="w-4 h-4" />
              Notes
            </button>
            <button
              onClick={() => handleAddBlock('radio')}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${menuItemClass}`}
            >
              <Radio className="w-4 h-4" />
              Radio
            </button>
            <button
              onClick={() => handleAddBlock('weather')}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${menuItemClass}`}
            >
              <CloudSun className="w-4 h-4" />
              Météo
            </button>
          </div>
        )}
      </div>

      <button
        onClick={onToggleTheme}
        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${btnClass}`}
        title={isDark ? 'Mode clair' : 'Mode sombre'}
      >
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      <button
        onClick={handleExport}
        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${btnClass}`}
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Exporter</span>
      </button>

      <button
        onClick={handleImportClick}
        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${btnClass}`}
      >
        <Upload className="w-4 h-4" />
        <span className="hidden sm:inline">Importer</span>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
