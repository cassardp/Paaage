import { useRef, useState } from 'react';
import { Download, Upload, Sun, Moon, Plus, Search, CloudSun, Bookmark, FileText, Headphones, TrendingUp } from 'lucide-react';
import type { Config } from '../types/config';
import { exportConfig, importConfig, saveConfig } from '../lib/storage';

interface ToolbarProps {
  config: Config;
  onImport: (config: Config) => void;
  onToggleTheme: () => void;
  onAddBlock: (type: 'search' | 'weather') => void;
  onAddBookmark: (label: string, url: string) => void;
  onAddNote: (content: string) => void;
  onAddStation: () => void;
  onAddStock: () => void;
}

export function Toolbar({ config, onImport, onToggleTheme, onAddBlock, onAddBookmark, onAddNote, onAddStation, onAddStock }: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showBookmarkForm, setShowBookmarkForm] = useState(false);
  const [bookmarkUrl, setBookmarkUrl] = useState('');
  const [bookmarkLabel, setBookmarkLabel] = useState('');
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

  const handleAddBlock = (type: 'search' | 'weather') => {
    onAddBlock(type);
    setShowAddMenu(false);
  };

  const handleBookmarkClick = () => {
    setShowAddMenu(false);
    setShowBookmarkForm(true);
  };

  const handleBookmarkSubmit = () => {
    if (bookmarkUrl.trim()) {
      let url = bookmarkUrl.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      const label = bookmarkLabel.trim() || new URL(url).hostname;
      onAddBookmark(label, url);
      setBookmarkUrl('');
      setBookmarkLabel('');
      setShowBookmarkForm(false);
    }
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
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowAddMenu(false)} />
            <div className={`absolute top-full right-0 mt-1 py-1 rounded-lg border shadow-lg min-w-[140px] z-50 ${menuClass}`}>
            <button
              onClick={() => handleAddBlock('search')}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${menuItemClass}`}
            >
              <Search className="w-4 h-4" />
              Recherche
            </button>
            <button
              onClick={() => handleAddBlock('weather')}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${menuItemClass}`}
            >
              <CloudSun className="w-4 h-4" />
              Météo
            </button>
            <button
              onClick={handleBookmarkClick}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${menuItemClass}`}
            >
              <Bookmark className="w-4 h-4" />
              Raccourci
            </button>
            <button
              onClick={() => { onAddNote(''); setShowAddMenu(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${menuItemClass}`}
            >
              <FileText className="w-4 h-4" />
              Note
            </button>
            <button
              onClick={() => { onAddStation(); setShowAddMenu(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${menuItemClass}`}
            >
              <Headphones className="w-4 h-4" />
              Station
            </button>
            <button
              onClick={() => { onAddStock(); setShowAddMenu(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${menuItemClass}`}
            >
              <TrendingUp className="w-4 h-4" />
              Stock
            </button>
          </div>
          </>
        )}

        {/* Modal formulaire bookmark */}
        {showBookmarkForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowBookmarkForm(false)}>
            <div 
              className={`p-4 rounded-lg border shadow-xl w-80 ${menuClass}`}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-neutral-200' : 'text-neutral-800'}`}>
                Nouveau raccourci
              </h3>
              <input
                type="text"
                value={bookmarkUrl}
                onChange={(e) => setBookmarkUrl(e.target.value)}
                placeholder="URL (ex: google.com)"
                autoFocus
                className={`w-full px-3 py-2 mb-2 rounded border text-sm
                           ${isDark 
                             ? 'bg-neutral-900 border-neutral-700 text-neutral-100 placeholder-neutral-500' 
                             : 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400'}
                           focus:outline-none focus:border-[var(--accent-color)]`}
                onKeyDown={(e) => e.key === 'Enter' && handleBookmarkSubmit()}
              />
              <input
                type="text"
                value={bookmarkLabel}
                onChange={(e) => setBookmarkLabel(e.target.value)}
                placeholder="Nom (optionnel)"
                className={`w-full px-3 py-2 mb-3 rounded border text-sm
                           ${isDark 
                             ? 'bg-neutral-900 border-neutral-700 text-neutral-100 placeholder-neutral-500' 
                             : 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400'}
                           focus:outline-none focus:border-[var(--accent-color)]`}
                onKeyDown={(e) => e.key === 'Enter' && handleBookmarkSubmit()}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowBookmarkForm(false)}
                  className={`flex-1 py-2 rounded text-sm ${isDark ? 'bg-neutral-700 text-neutral-300' : 'bg-neutral-200 text-neutral-600'}`}
                >
                  Annuler
                </button>
                <button
                  onClick={handleBookmarkSubmit}
                  className="flex-1 py-2 rounded text-sm bg-[var(--accent-color)] text-white font-medium"
                >
                  Ajouter
                </button>
              </div>
            </div>
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
