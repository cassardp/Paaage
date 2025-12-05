import { useState, useRef, useEffect } from 'react';
import { Plus, Search, CloudSun, Bookmark, FileText, Headphones, TrendingUp, Lock, Unlock, Eye, EyeOff, ListTodo, Clock, Newspaper, Cloud, Sun, Moon, Download, Upload, Undo2, Settings2, Info } from 'lucide-react';
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
  showBookmarkForm?: boolean;
  onShowBookmarkForm?: (show: boolean) => void;
}

export function Toolbar({ config, syncId, syncing, onImport, onToggleTheme, onAddBlock, onAddBookmark, onAddNote, onAddStation, onAddStock, onAddTodo, onAddClock, onAddNews, onUndo, canUndo, isDark, dragLocked, onToggleDragLock, notesHidden, onToggleNotesHidden, showBookmarkForm: externalShowBookmark, onShowBookmarkForm }: ToolbarProps) {
  const [isHovered, setIsHovered] = useState(false); // Hover = actions utilitaires
  const [isClicked, setIsClicked] = useState(false); // Clic = actions d'ajout
  const [internalShowBookmark, setInternalShowBookmark] = useState(false);
  
  // Synchroniser avec le state externe si fourni
  const showBookmarkForm = externalShowBookmark ?? internalShowBookmark;
  const setShowBookmarkForm = onShowBookmarkForm ?? setInternalShowBookmark;
  
  useEffect(() => {
    if (externalShowBookmark !== undefined) {
      setInternalShowBookmark(externalShowBookmark);
    }
  }, [externalShowBookmark]);
  const [bookmarkUrl, setBookmarkUrl] = useState('');
  const [bookmarkLabel, setBookmarkLabel] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
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

  // Actions d'ajout (apparaissent au hover)
  const addActions = [
    ...(!hasSearchBlock ? [{ icon: Search, action: () => handleAddBlock('search'), label: 'Recherche' }] : []),
    { icon: CloudSun, action: () => handleAddBlock('weather'), label: 'Météo' },
    { icon: Bookmark, action: handleBookmarkClick, label: 'Lien' },
    { icon: FileText, action: () => { onAddNote(''); setIsHovered(false); }, label: 'Note' },
    { icon: Headphones, action: () => { onAddStation(); setIsHovered(false); }, label: 'Radio' },
    { icon: TrendingUp, action: () => { onAddStock(); setIsHovered(false); }, label: 'Stock' },
    { icon: ListTodo, action: () => { onAddTodo(); setIsHovered(false); }, label: 'Todo' },
    { icon: Clock, action: () => { onAddClock(); setIsHovered(false); }, label: 'Horloge' },
    { icon: Newspaper, action: () => { onAddNews(); setIsHovered(false); }, label: 'News' },
  ];

  // Actions utilitaires (apparaissent au clic)
  const utilActions = [
    ...(canUndo ? [{ icon: Undo2, action: onUndo, label: 'Annuler', active: false }] : []),
    { icon: isDark ? Sun : Moon, action: onToggleTheme, label: isDark ? 'Mode clair' : 'Mode sombre', active: false },
    { icon: Download, action: handleImportClick, label: 'Importer', active: false },
    { icon: Upload, action: handleExport, label: 'Exporter', active: false },
    { icon: dragLocked ? Lock : Unlock, action: onToggleDragLock, label: dragLocked ? 'Déverrouiller' : 'Verrouiller', active: dragLocked },
    ...(hasNotesOrTodos ? [{ icon: notesHidden ? EyeOff : Eye, action: onToggleNotesHidden, label: notesHidden ? 'Afficher notes' : 'Masquer notes', active: notesHidden }] : []),
    { icon: Cloud, action: () => setShowQRModal(true), label: 'QR Code sync', active: !!syncId, syncing },
    { icon: Info, action: () => setShowInfoModal(true), label: 'À propos', active: false },
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

  // Afficher les actions d'ajout au hover, les actions utilitaires au clic
  const showAdd = isHovered && !isClicked;
  const showUtil = isClicked;

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
              <Icon className="w-4 h-4" />
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
          {syncing ? (
            <Cloud className="w-5 h-5 text-[var(--accent-color)] animate-pulse" />
          ) : isClicked ? (
            <Plus className="w-6 h-6" />
          ) : showAdd ? (
            <Settings2 className="w-5 h-5" />
          ) : dragLocked ? (
            <Lock className="w-5 h-5 text-[var(--accent-color)]" />
          ) : notesHidden ? (
            <EyeOff className="w-5 h-5 text-[var(--accent-color)]" />
          ) : (
            <Plus className="w-6 h-6" />
          )}
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
          <div className={`p-3 rounded-lg border shadow-xl w-72 ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'}`} onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={bookmarkUrl}
              onChange={(e) => setBookmarkUrl(e.target.value)}
              placeholder="URL (ex: google.com)"
              autoFocus
              className={`w-full px-3 py-2 mb-2 rounded border text-sm
                ${isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-300 placeholder-neutral-500' : 'bg-white border-neutral-300 text-neutral-700 placeholder-neutral-400'}
                focus:outline-none focus:border-[var(--accent-color)]`}
              onKeyDown={(e) => e.key === 'Enter' && handleBookmarkSubmit()}
            />
            <input
              type="text"
              value={bookmarkLabel}
              onChange={(e) => setBookmarkLabel(e.target.value)}
              placeholder="Nom (optionnel)"
              className={`w-full px-3 py-2 mb-2 rounded border text-sm
                ${isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-300 placeholder-neutral-500' : 'bg-white border-neutral-300 text-neutral-700 placeholder-neutral-400'}
                focus:outline-none focus:border-[var(--accent-color)]`}
              onKeyDown={(e) => e.key === 'Enter' && handleBookmarkSubmit()}
            />
            <button
              onClick={handleBookmarkSubmit}
              className="w-full py-2 rounded text-sm cursor-pointer bg-[var(--accent-color)] text-white font-medium"
            >
              Ajouter
            </button>
          </div>
        </div>
      )}

      <Toast message={toastMessage} visible={!!toastMessage} onHide={() => setToastMessage('')} />

      {/* Modal QR Code */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowQRModal(false)}>
          <div className={`p-6 rounded-lg border shadow-xl w-80 ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'}`} onClick={(e) => e.stopPropagation()}>
            <h3 className={`text-lg font-semibold mb-4 text-center ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
              Synchronisation
            </h3>
            <div className="flex justify-center mb-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`}
                alt="QR Code"
                className="w-48 h-48 rounded"
              />
            </div>
            <p className={`text-xs text-center mb-3 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Scannez ce QR code pour synchroniser sur un autre appareil
            </p>
            <p className={`text-xs text-center font-mono mb-4 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
              ID: {syncId}
            </p>
            <button
              onClick={() => { handleCopyShareUrl(); setShowQRModal(false); }}
              className="w-full py-2 rounded text-sm cursor-pointer bg-[var(--accent-color)] text-white font-medium"
            >
              Copier le lien
            </button>
          </div>
        </div>
      )}

      {/* Modal À propos */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowInfoModal(false)}>
          <div className={`p-6 rounded-lg border shadow-xl w-80 ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'}`} onClick={(e) => e.stopPropagation()}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
              Paaage
            </h3>
            <div className={`text-sm space-y-3 ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>
              <p>Une page d'accueil personnalisable pour votre navigateur.</p>
              <div>
                <p className="font-medium mb-1">Fonctionnement</p>
                <p>Glissez-déposez les blocs pour organiser votre page. Tapez "/" pour ajouter rapidement un bloc.</p>
              </div>
              <div>
                <p className="font-medium mb-1">Données</p>
                <p>Stockées dans le cloud en json sur Val Town, sans authentification. Partagez le lien pour synchroniser entre appareils.</p>
              </div>
              <div>
                <p className="font-medium mb-1">Technologies</p>
                <p>React 19 • TypeScript • Tailwind CSS • Vite</p>
              </div>
              <p className="opacity-70">Version alpha</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
