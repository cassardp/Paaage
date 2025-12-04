import { useState, useEffect } from 'react';
import { Plus, Settings, Search, CloudSun, Bookmark, FileText, Headphones, TrendingUp, Lock, Unlock, Eye, EyeOff, ListTodo, Clock, Newspaper, Cloud, Check, Copy } from 'lucide-react';
import { getShareUrl } from '../hooks/useCloudStorage';
import { SettingsDrawer } from './SettingsDrawer';
import type { Config } from '../types/config';
import { CELL_SIZE } from '../lib/defaultConfig';
import { gridToPixel, gridSizeToPixel } from './Grid';

interface ToolbarProps {
  config: Config;
  syncId: string;
  syncing: boolean;
  onImport: (config: Config) => void;
  onToggleTheme: () => void;
  onAddBlock: (type: 'search' | 'weather') => void;
  onAddBookmark: (label: string, url: string) => void;
  onAddNote: (content: string) => void;
  onAddStation: () => void;
  onAddStock: () => void;
  onAddTodo: () => void;
  onAddClock: () => void;
  onAddNews: () => void;
  isDark: boolean;
  dragLocked: boolean;
  onToggleDragLock: () => void;
  notesHidden: boolean;
  onToggleNotesHidden: () => void;
}

export function Toolbar({ config, syncId, syncing, onImport, onToggleTheme, onAddBlock, onAddBookmark, onAddNote, onAddStation, onAddStock, onAddTodo, onAddClock, onAddNews, isDark, dragLocked, onToggleDragLock, notesHidden, onToggleNotesHidden }: ToolbarProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showBookmarkForm, setShowBookmarkForm] = useState(false);
  const [bookmarkUrl, setBookmarkUrl] = useState('');
  const [bookmarkLabel, setBookmarkLabel] = useState('');
  const [showCloudMenu, setShowCloudMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const shareUrl = getShareUrl();

  const menuClass = isDark
    ? 'bg-neutral-800 border-neutral-700'
    : 'bg-white border-neutral-200';

  const menuItemClass = isDark
    ? 'hover:bg-neutral-700 text-neutral-200'
    : 'hover:bg-neutral-100 text-neutral-700';

  const blockClass = isDark
    ? 'bg-neutral-900/50 backdrop-blur-sm border-neutral-700 hover:border-neutral-600 text-neutral-400 hover:text-neutral-100'
    : 'bg-white/90 backdrop-blur-sm border-neutral-200 hover:border-neutral-300 text-neutral-500 hover:text-neutral-900';

  const hasSearchBlock = config.blocks.some((b) => b.type === 'search');

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

  // Taille d'un bloc 2x2
  const size = gridSizeToPixel(2);
  
  // Calculer les positions X depuis la droite, alignées sur la grille
  const [gridCols, setGridCols] = useState(0);
  
  useEffect(() => {
    const updateCols = () => {
      setGridCols(Math.floor(window.innerWidth / CELL_SIZE));
    };
    updateCols();
    window.addEventListener('resize', updateCols);
    return () => window.removeEventListener('resize', updateCols);
  }, []);

  // Position X des boutons (depuis la gauche, alignée sur la grille)
  const settingsX = gridToPixel(gridCols - 3); // 2 cellules de large + 1 de marge
  const cloudX = gridToPixel(gridCols - 6); // entre add et settings
  const addX = gridToPixel(gridCols - 9); // décalé d'une position

  const handleCopyShareUrl = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      {/* Bouton Ajouter - calé sur la grille à droite */}
      <div
        className="absolute z-40"
        style={{ left: addX, top: gridToPixel(1), width: size }}
        onMouseEnter={() => setShowAddMenu(true)}
        onMouseLeave={() => setShowAddMenu(false)}
      >
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          style={{ width: size, height: size }}
          className={`rounded-[12px] border flex items-center justify-center transition-all cursor-pointer ${blockClass}`}
        >
          <Plus className="w-5 h-5" />
        </button>

        {showAddMenu && (
          <div className={`absolute right-0 mt-0 py-1 rounded-lg border shadow-lg min-w-[140px] z-50 ${menuClass}`}>
              {!hasSearchBlock && (
                <button onClick={() => handleAddBlock('search')} className={`w-full flex items-center gap-2 px-3 py-2 text-sm cursor-pointer ${menuItemClass}`}>
                  <Search className="w-4 h-4" /> Recherche
                </button>
              )}
              <button onClick={() => handleAddBlock('weather')} className={`w-full flex items-center gap-2 px-3 py-2 text-sm cursor-pointer ${menuItemClass}`}>
                <CloudSun className="w-4 h-4" /> Météo
              </button>
              <button onClick={handleBookmarkClick} className={`w-full flex items-center gap-2 px-3 py-2 text-sm cursor-pointer ${menuItemClass}`}>
                <Bookmark className="w-4 h-4" /> Lien
              </button>
              <button onClick={() => { onAddNote(''); setShowAddMenu(false); }} className={`w-full flex items-center gap-2 px-3 py-2 text-sm cursor-pointer ${menuItemClass}`}>
                <FileText className="w-4 h-4" /> Note
              </button>
              <button onClick={() => { onAddStation(); setShowAddMenu(false); }} className={`w-full flex items-center gap-2 px-3 py-2 text-sm cursor-pointer ${menuItemClass}`}>
                <Headphones className="w-4 h-4" /> Radio
              </button>
              <button onClick={() => { onAddStock(); setShowAddMenu(false); }} className={`w-full flex items-center gap-2 px-3 py-2 text-sm cursor-pointer ${menuItemClass}`}>
                <TrendingUp className="w-4 h-4" /> Stock
              </button>
              <button onClick={() => { onAddTodo(); setShowAddMenu(false); }} className={`w-full flex items-center gap-2 px-3 py-2 text-sm cursor-pointer ${menuItemClass}`}>
                <ListTodo className="w-4 h-4" /> Todo
              </button>
              <button onClick={() => { onAddClock(); setShowAddMenu(false); }} className={`w-full flex items-center gap-2 px-3 py-2 text-sm cursor-pointer ${menuItemClass}`}>
                <Clock className="w-4 h-4" /> Horloge
              </button>
              <button onClick={() => { onAddNews(); setShowAddMenu(false); }} className={`w-full flex items-center gap-2 px-3 py-2 text-sm cursor-pointer ${menuItemClass}`}>
                <Newspaper className="w-4 h-4" /> News
              </button>
            </div>
        )}
      </div>

      {/* Bouton Cloud - entre Add et Settings */}
      <div
        className="absolute z-40"
        style={{ left: cloudX, top: gridToPixel(1), width: size }}
        onMouseEnter={() => setShowCloudMenu(true)}
        onMouseLeave={() => setShowCloudMenu(false)}
      >
        <button
          onClick={() => setShowCloudMenu(!showCloudMenu)}
          style={{ width: size, height: size }}
          className={`rounded-[12px] border flex items-center justify-center transition-all cursor-pointer ${blockClass}
            ${syncId ? 'text-[var(--accent-color)]' : ''}`}
        >
          {syncing ? (
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Cloud className="w-5 h-5" />
          )}
        </button>

        {showCloudMenu && (
          <div className={`absolute right-0 mt-0 py-2 px-3 rounded-lg border shadow-lg min-w-[200px] z-50 ${menuClass}`}>
            {syncId ? (
              <>
                <div className={`text-xs mb-2 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  Sync activée
                </div>
                <div className={`text-xs font-mono mb-2 p-2 rounded truncate ${isDark ? 'bg-neutral-900 text-neutral-300' : 'bg-neutral-100 text-neutral-600'}`}>
                  ID: {syncId}
                </div>
                <button
                  onClick={handleCopyShareUrl}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded cursor-pointer ${menuItemClass}`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copié !' : 'Copier le lien'}
                </button>
              </>
            ) : (
              <div className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Sync désactivée.<br />Configurez VITE_VALTOWN_URL pour activer.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bouton Settings - calé sur la grille à droite */}
      <div
        className="absolute z-40"
        style={{ left: settingsX, top: gridToPixel(1), width: size, height: size }}
      >
        <button
          onClick={() => setShowSettings(true)}
          className={`w-full h-full rounded-[12px] border flex items-center justify-center transition-all cursor-pointer ${blockClass}`}
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Bouton Lock/Unlock - 1 case sous Settings */}
      <div
        className="absolute z-40"
        style={{ left: settingsX, top: gridToPixel(4), width: size, height: size }}
      >
        <button
          onClick={onToggleDragLock}
          className={`w-full h-full rounded-[12px] border flex items-center justify-center transition-all cursor-pointer ${blockClass}
            ${dragLocked ? 'text-[var(--accent-color)]' : ''}`}
        >
          {dragLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
        </button>
      </div>

      {/* Bouton Hide/Show Notes/Todos - sous Lock, visible seulement si des notes ou todos existent */}
      {config.blocks.some(b => b.type === 'note' || b.type === 'todo') && (
        <div
          className="absolute z-40"
          style={{ left: settingsX, top: gridToPixel(7), width: size, height: size }}
        >
          <button
            onClick={onToggleNotesHidden}
            className={`w-full h-full rounded-[12px] border flex items-center justify-center transition-all cursor-pointer ${blockClass}
              ${notesHidden ? 'text-[var(--accent-color)]' : ''}`}
          >
            {notesHidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      )}

      {/* Settings Drawer */}
      <SettingsDrawer
        open={showSettings}
        onClose={() => setShowSettings(false)}
        config={config}
        onImport={onImport}
        onToggleTheme={onToggleTheme}
      />

      {/* Modal formulaire bookmark */}
      {showBookmarkForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowBookmarkForm(false)}>
          <div className={`p-4 rounded-lg border shadow-xl w-80 ${menuClass}`} onClick={(e) => e.stopPropagation()}>
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
                ${isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-100 placeholder-neutral-500' : 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400'}
                focus:outline-none focus:border-[var(--accent-color)]`}
              onKeyDown={(e) => e.key === 'Enter' && handleBookmarkSubmit()}
            />
            <input
              type="text"
              value={bookmarkLabel}
              onChange={(e) => setBookmarkLabel(e.target.value)}
              placeholder="Nom (optionnel)"
              className={`w-full px-3 py-2 mb-3 rounded border text-sm
                ${isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-100 placeholder-neutral-500' : 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400'}
                focus:outline-none focus:border-[var(--accent-color)]`}
              onKeyDown={(e) => e.key === 'Enter' && handleBookmarkSubmit()}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowBookmarkForm(false)}
                className={`flex-1 py-2 rounded text-sm cursor-pointer ${isDark ? 'bg-neutral-700 text-neutral-300' : 'bg-neutral-200 text-neutral-600'}`}
              >
                Annuler
              </button>
              <button
                onClick={handleBookmarkSubmit}
                className="flex-1 py-2 rounded text-sm cursor-pointer bg-[var(--accent-color)] text-white font-medium"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
