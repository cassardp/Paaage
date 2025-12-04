import { useState, useRef } from 'react';
import { Plus, Search, CloudSun, Bookmark, FileText, Headphones, TrendingUp, Lock, Unlock, Eye, EyeOff, ListTodo, Clock, Newspaper, Cloud, Sun, Moon, Download, Upload, Undo2 } from 'lucide-react';
import { getShareUrl } from '../hooks/useCloudStorage';
import { exportConfig, importConfig } from '../lib/storage';
import type { Config } from '../types/config';
import { Toast } from './Toast';

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
  onUndo: () => void;
  canUndo: boolean;
  isDark: boolean;
  dragLocked: boolean;
  onToggleDragLock: () => void;
  notesHidden: boolean;
  onToggleNotesHidden: () => void;
}

export function Toolbar({ config, syncId, syncing, onImport, onToggleTheme, onAddBlock, onAddBookmark, onAddNote, onAddStation, onAddStock, onAddTodo, onAddClock, onAddNews, onUndo, canUndo, isDark, dragLocked, onToggleDragLock, notesHidden, onToggleNotesHidden }: ToolbarProps) {
  const [isHovered, setIsHovered] = useState(false); // Hover = actions utilitaires
  const [isClicked, setIsClicked] = useState(false); // Clic = actions d'ajout
  const [showBookmarkForm, setShowBookmarkForm] = useState(false);
  const [bookmarkUrl, setBookmarkUrl] = useState('');
  const [bookmarkLabel, setBookmarkLabel] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const shareUrl = getShareUrl();

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
        onImport(imported);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erreur import');
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const fabClass = isDark
    ? 'bg-neutral-900/80 backdrop-blur-sm border-neutral-700 text-neutral-400 hover:text-neutral-100'
    : 'bg-white/90 backdrop-blur-sm border-neutral-200 text-neutral-500 hover:text-neutral-900';

  const hasSearchBlock = config.blocks.some((b) => b.type === 'search');
  const hasNotesOrTodos = config.blocks.some(b => b.type === 'note' || b.type === 'todo');

  const handleAddBlock = (type: 'search' | 'weather') => {
    onAddBlock(type);
    setIsClicked(false);
  };

  const handleBookmarkClick = () => {
    setIsClicked(false);
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

  const handleCopyShareUrl = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setToastMessage('Lien copié !');
    }
  };

  // Actions d'ajout (apparaissent au clic)
  const addActions = [
    ...(!hasSearchBlock ? [{ icon: Search, action: () => handleAddBlock('search'), label: 'Recherche' }] : []),
    { icon: CloudSun, action: () => handleAddBlock('weather'), label: 'Météo' },
    { icon: Bookmark, action: handleBookmarkClick, label: 'Lien' },
    { icon: FileText, action: () => { onAddNote(''); setIsClicked(false); }, label: 'Note' },
    { icon: Headphones, action: () => { onAddStation(); setIsClicked(false); }, label: 'Radio' },
    { icon: TrendingUp, action: () => { onAddStock(); setIsClicked(false); }, label: 'Stock' },
    { icon: ListTodo, action: () => { onAddTodo(); setIsClicked(false); }, label: 'Todo' },
    { icon: Clock, action: () => { onAddClock(); setIsClicked(false); }, label: 'Horloge' },
    { icon: Newspaper, action: () => { onAddNews(); setIsClicked(false); }, label: 'News' },
  ];

  // Actions utilitaires (apparaissent au hover)
  const utilActions = [
    ...(canUndo ? [{ icon: Undo2, action: onUndo, label: 'Annuler', active: false }] : []),
    { icon: isDark ? Sun : Moon, action: onToggleTheme, label: isDark ? 'Mode clair' : 'Mode sombre', active: false },
    { icon: Download, action: handleImportClick, label: 'Importer', active: false },
    { icon: Upload, action: handleExport, label: 'Exporter', active: false },
    { icon: dragLocked ? Lock : Unlock, action: onToggleDragLock, label: dragLocked ? 'Déverrouiller' : 'Verrouiller', active: dragLocked },
    ...(hasNotesOrTodos ? [{ icon: notesHidden ? EyeOff : Eye, action: onToggleNotesHidden, label: notesHidden ? 'Afficher notes' : 'Masquer notes', active: notesHidden }] : []),
    { icon: Cloud, action: handleCopyShareUrl, label: 'Copier le lien', active: !!syncId, syncing },
  ];

  const radius = 80;
  const startAngle = -180;
  const endAngle = 0;

  // Calcul des positions pour un groupe d'actions
  const getPosition = (index: number, total: number) => {
    const angle = startAngle + (index / (total - 1 || 1)) * (endAngle - startAngle);
    const radian = (angle * Math.PI) / 180;
    return { x: Math.cos(radian) * radius, y: Math.sin(radian) * radius };
  };

  // Afficher les actions utilitaires au hover, les actions d'ajout au clic
  const showUtil = isHovered && !isClicked;
  const showAdd = isClicked;

  return (
    <>
      {/* FAB Container - zone élargie pour maintenir le hover */}
      <div
        className="fixed bottom-6 left-1/2 z-40 flex items-end justify-center"
        style={{ width: radius * 2 + 56, height: radius + 56, transform: 'translateX(-50%)' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setIsClicked(false); }}
      >
        {/* Actions utilitaires (hover) */}
        {utilActions.map((item, index) => {
          const { x, y } = getPosition(index, utilActions.length);
          const Icon = item.icon;
          const isSyncing = 'syncing' in item && item.syncing;

          return (
            <button
              key={`util-${index}`}
              onClick={item.action}
              title={item.label}
              className={`absolute w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200 cursor-pointer ${fabClass}
                ${'active' in item && item.active ? 'text-[var(--accent-color)]' : ''}`}
              style={{
                left: '50%',
                bottom: 0,
                transform: showUtil
                  ? `translate(calc(-50% + ${x}px), ${y}px) scale(1)`
                  : 'translate(-50%, 0) scale(0)',
                opacity: showUtil ? 1 : 0,
                transitionDelay: showUtil ? `${index * 20}ms` : '0ms',
              }}
            >
              {isSyncing ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Icon className="w-4 h-4" />
              )}
            </button>
          );
        })}

        {/* Actions d'ajout (clic) */}
        {addActions.map((item, index) => {
          const { x, y } = getPosition(index, addActions.length);
          const Icon = item.icon;

          return (
            <button
              key={`add-${index}`}
              onClick={item.action}
              title={item.label}
              className={`absolute w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200 cursor-pointer ${fabClass}`}
              style={{
                left: '50%',
                bottom: 0,
                transform: showAdd
                  ? `translate(calc(-50% + ${x}px), ${y}px) scale(1)`
                  : 'translate(-50%, 0) scale(0)',
                opacity: showAdd ? 1 : 0,
                transitionDelay: showAdd ? `${index * 20}ms` : '0ms',
              }}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}

        {/* FAB principal */}
        <button
          onClick={() => setIsClicked(!isClicked)}
          className={`relative w-14 h-14 rounded-full border flex items-center justify-center transition-all duration-200 cursor-pointer ${fabClass}`}
        >
          <Plus className={`w-6 h-6 transition-transform duration-200 ${isClicked ? 'rotate-45' : ''}`} />
        </button>

      </div>

      {/* Input file caché pour import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Modal formulaire bookmark */}
      {showBookmarkForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowBookmarkForm(false)}>
          <div className={`p-4 rounded-lg border shadow-xl w-80 ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'}`} onClick={(e) => e.stopPropagation()}>
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

      <Toast message={toastMessage} visible={!!toastMessage} onHide={() => setToastMessage('')} />
    </>
  );
}
