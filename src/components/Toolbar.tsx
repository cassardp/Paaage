import { useState, useRef, useEffect } from 'react';
import { Plus, Search, CloudSun, Bookmark, StickyNote, Music, TrendingUp, Lock, Unlock, Eye, EyeOff, ListTodo, Clock, Rss, Cloud, Sun, Moon, Download, Upload, Undo2, Settings2, Info, ToggleLeft, ToggleRight } from 'lucide-react';
import { getShareUrl } from '../hooks/useCloudStorage';
import { exportConfig, importConfig } from '../lib/storage';
import type { Config } from '../types/config';
import { Toast } from './Toast';
import { Tooltip } from './Tooltip';
import { FormModal } from './FormModal';

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
  onAddRss: () => void;
  onUndo: () => void;
  canUndo: boolean;
  isDark: boolean;
  dragLocked: boolean;
  onToggleDragLock: () => void;
  notesHidden: boolean;
  onToggleNotesHidden: () => void;
  showBookmarkForm?: boolean;
  onShowBookmarkForm?: (show: boolean) => void;
  onToggleLinkTarget: () => void;
  hasSearchBlock: boolean;
  hasNotesOrTodos: boolean;
}

export function Toolbar({ config, syncId, syncing, onImport, onToggleTheme, onAddBlock, onAddBookmark, onAddNote, onAddStation, onAddStock, onAddTodo, onAddClock, onAddRss, onUndo, canUndo, isDark, dragLocked, onToggleDragLock, notesHidden, onToggleNotesHidden, showBookmarkForm: externalShowBookmark, onShowBookmarkForm, onToggleLinkTarget, hasSearchBlock, hasNotesOrTodos }: ToolbarProps) {
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
  const [hoveredButton, setHoveredButton] = useState<{ label: string; x: number; y: number } | null>(null);
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
        alert(err instanceof Error ? err.message : 'Import error');
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const fabClass = isDark
    ? 'bg-neutral-900/80 backdrop-blur-sm border-neutral-700 text-neutral-400 hover:text-neutral-100'
    : 'bg-white/90 backdrop-blur-sm border-neutral-200 text-neutral-500 hover:text-neutral-900';

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
      setToastMessage('Link copied!');
    }
  };

  const handleToggleLinkTarget = () => {
    onToggleLinkTarget();
    const newTarget = config.settings.linkTarget === '_blank' ? '_self' : '_blank';
    setToastMessage(newTarget === '_blank' ? 'Links open in new tab' : 'Links open in same tab');
  };

  // Actions d'ajout (apparaissent au hover)
  const addActions = [
    ...(!hasSearchBlock ? [{ icon: Search, action: () => handleAddBlock('search'), label: 'Search' }] : []),
    { icon: CloudSun, action: () => handleAddBlock('weather'), label: 'Weather' },
    { icon: Bookmark, action: handleBookmarkClick, label: 'Link' },
    { icon: StickyNote, action: () => { onAddNote(''); setIsHovered(false); }, label: 'Note' },
    { icon: Music, action: () => { onAddStation(); setIsHovered(false); }, label: 'Radio' },
    { icon: TrendingUp, action: () => { onAddStock(); setIsHovered(false); }, label: 'Stock' },
    { icon: ListTodo, action: () => { onAddTodo(); setIsHovered(false); }, label: 'Todo' },
    { icon: Clock, action: () => { onAddClock(); setIsHovered(false); }, label: 'Clock' },
    { icon: Rss, action: () => { onAddRss(); setIsHovered(false); }, label: 'RSS' },
  ];

  // Actions utilitaires (apparaissent au clic)
  const utilActions = [
    ...(canUndo ? [{ icon: Undo2, action: onUndo, label: 'Undo', active: false }] : []),
    { icon: isDark ? Sun : Moon, action: onToggleTheme, label: isDark ? 'Light mode' : 'Dark mode', active: false },
    { icon: config.settings.linkTarget === '_blank' ? ToggleRight : ToggleLeft, action: handleToggleLinkTarget, label: config.settings.linkTarget === '_blank' ? 'Open in same tab' : 'Open in new tab', active: config.settings.linkTarget === '_blank' },
    { icon: Download, action: handleImportClick, label: 'Import', active: false },
    { icon: Upload, action: handleExport, label: 'Export', active: false },
    { icon: dragLocked ? Lock : Unlock, action: onToggleDragLock, label: dragLocked ? 'Unlock' : 'Lock', active: dragLocked },
    ...(hasNotesOrTodos ? [{ icon: notesHidden ? EyeOff : Eye, action: onToggleNotesHidden, label: notesHidden ? 'Show notes' : 'Hide notes', active: notesHidden }] : []),
    { icon: Cloud, action: () => setShowQRModal(true), label: 'QR Code sync', active: !!syncId, syncing },
    { icon: Info, action: () => setShowInfoModal(true), label: 'About', active: false },
  ];

  const radius = 90;
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
        className="fixed bottom-12 left-1/2 z-40 flex items-end justify-center"
        style={{ width: radius * 2 + 56, height: radius + 56, transform: 'translateX(-50%)' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setIsClicked(false); }}
      >
        {/* Actions utilitaires (hover) */}
        {utilActions.map((item, index) => {
          const { x, y } = getPosition(index, utilActions.length);
          const Icon = item.icon;

          return (
            <div
              key={`util-${index}`}
              className="absolute"
              style={{
                left: '50%',
                bottom: 0,
                transform: showUtil
                  ? `translate(calc(-50% + ${x}px), ${y}px)`
                  : 'translate(-50%, 0)',
                opacity: showUtil ? 1 : 0,
                transition: 'all 200ms',
                transitionDelay: showUtil ? `${index * 20}ms` : '0ms',
                pointerEvents: showUtil ? 'auto' : 'none',
                zIndex: hoveredButton?.label === item.label ? 100 : 'auto',
              }}
            >
              <button
                onClick={item.action}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredButton({
                    label: item.label,
                    x: rect.left + rect.width / 2,
                    y: rect.top,
                  });
                }}
                onMouseLeave={() => setHoveredButton(null)}
                className={`w-11 h-11 rounded-full border flex items-center justify-center transition-transform duration-150 cursor-pointer hover:scale-110 ${fabClass}
                  ${'active' in item && item.active ? 'text-[var(--accent-color)]' : ''}`}
              >
                <Icon className="w-4 h-4" />
              </button>
            </div>
          );
        })}

        {/* Actions d'ajout (clic) */}
        {addActions.map((item, index) => {
          const { x, y } = getPosition(index, addActions.length);
          const Icon = item.icon;

          return (
            <div
              key={`add-${index}`}
              className="absolute"
              style={{
                left: '50%',
                bottom: 0,
                transform: showAdd
                  ? `translate(calc(-50% + ${x}px), ${y}px)`
                  : 'translate(-50%, 0)',
                opacity: showAdd ? 1 : 0,
                transition: 'all 200ms',
                transitionDelay: showAdd ? `${index * 20}ms` : '0ms',
                pointerEvents: showAdd ? 'auto' : 'none',
                zIndex: hoveredButton?.label === item.label ? 100 : 'auto',
              }}
            >
              <button
                onClick={item.action}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredButton({
                    label: item.label,
                    x: rect.left + rect.width / 2,
                    y: rect.top,
                  });
                }}
                onMouseLeave={() => setHoveredButton(null)}
                className={`w-11 h-11 rounded-full border flex items-center justify-center transition-transform duration-150 cursor-pointer hover:scale-110 ${fabClass}`}
              >
                <Icon className="w-4 h-4" />
              </button>
            </div>
          );
        })}

        {/* FAB principal */}
        <button
          onClick={() => setIsClicked(!isClicked)}
          className={`relative w-14 h-14 rounded-full border flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 ${fabClass}`}
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

      <FormModal
        isOpen={showBookmarkForm}
        onClose={() => setShowBookmarkForm(false)}
        onSubmit={handleBookmarkSubmit}
        submitLabel="Add Bookmark"
        isDark={isDark}
        fields={[
          {
            label: 'URL',
            value: bookmarkUrl,
            onChange: setBookmarkUrl,
            placeholder: 'google.com',
            autoFocus: true,
          },
          {
            label: 'Name',
            value: bookmarkLabel,
            onChange: setBookmarkLabel,
            placeholder: 'My Bookmark',
            optional: true,
          },
        ]}
      />

      <Toast message={toastMessage} visible={!!toastMessage} onHide={() => setToastMessage('')} />

      {/* Modal QR Code */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowQRModal(false)}>
          <div className={`p-6 rounded-lg border shadow-xl w-80 ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'}`} onClick={(e) => e.stopPropagation()}>
            <h3 className={`text-lg font-semibold mb-4 text-center ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
              Sync
            </h3>
            <div className="flex justify-center mb-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`}
                alt="QR Code"
                className="w-48 h-48 rounded"
              />
            </div>
            <p className={`text-xs text-center mb-3 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Scan this QR code to sync on another device
            </p>
            <p className={`text-xs text-center font-mono mb-4 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
              ID: {syncId}
            </p>
            <button
              onClick={() => { handleCopyShareUrl(); setShowQRModal(false); }}
              className="w-full py-2 rounded text-sm cursor-pointer bg-[var(--accent-color)] text-white font-medium"
            >
              Copy link
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
              <p>A customizable homepage for your browser.</p>
              <div>
                <p className="font-medium mb-1">How it works</p>
                <p>Drag and drop blocks to organize your page. Type "/" to quickly add a block.</p>
              </div>
              <div>
                <p className="font-medium mb-1">Data</p>
                <p>Stored in the cloud as JSON on Val Town, without authentication. Share the link to sync between devices.</p>
              </div>
              <div>
                <p className="font-medium mb-1">Technologies</p>
                <p>React 19 • TypeScript • Tailwind CSS • Vite</p>
              </div>
              <a 
                href="https://github.com/CassardMusic/Paaage" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`block hover:underline ${isDark ? 'text-neutral-400 hover:text-neutral-300' : 'text-neutral-500 hover:text-neutral-700'}`}
              >
                GitHub
              </a>
              <p className="opacity-70">Alpha version</p>
            </div>
          </div>
        </div>
      )}

      {/* Custom Tooltip */}
      {hoveredButton && (
        <Tooltip
          text={hoveredButton.label}
          visible={true}
          x={hoveredButton.x}
          y={hoveredButton.y}
          isDark={isDark}
        />
      )}
    </>
  );
}
