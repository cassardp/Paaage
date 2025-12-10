import { useState, useEffect } from 'react';
import { Plus, Search, CloudSun, Bookmark, StickyNote, Music, TrendingUp, ListTodo, Clock, Rss, Settings2, Lock, EyeOff } from 'lucide-react';
import { Tooltip } from './Tooltip';
import { FormModal } from './FormModal';

interface ToolbarProps {
  isDark: boolean;
  dragLocked: boolean;
  notesHidden: boolean;
  onAddBlock: (type: 'search' | 'weather') => void;
  onAddBookmark: (label: string, url: string) => void;
  onAddNote: (content: string) => void;
  onAddStation: () => void;
  onAddStock: () => void;
  onAddTodo: () => void;
  onAddClock: () => void;
  onAddRss: () => void;
  onAddSettings: () => void;
  showBookmarkForm?: boolean;
  onShowBookmarkForm?: (show: boolean) => void;
  hasSearchBlock: boolean;
  hasSettingsBlock: boolean;
}

export function Toolbar({
  isDark,
  dragLocked,
  notesHidden,
  onAddBlock,
  onAddBookmark,
  onAddNote,
  onAddStation,
  onAddStock,
  onAddTodo,
  onAddClock,
  onAddRss,
  onAddSettings,
  showBookmarkForm: externalShowBookmark,
  onShowBookmarkForm,
  hasSearchBlock,
  hasSettingsBlock: _hasSettingsBlock,
}: ToolbarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [internalShowBookmark, setInternalShowBookmark] = useState(false);
  const [bookmarkUrl, setBookmarkUrl] = useState('');
  const [bookmarkLabel, setBookmarkLabel] = useState('');
  const [hoveredButton, setHoveredButton] = useState<{ label: string; x: number; y: number } | null>(null);

  const showBookmarkForm = externalShowBookmark ?? internalShowBookmark;
  const setShowBookmarkForm = onShowBookmarkForm ?? setInternalShowBookmark;

  useEffect(() => {
    if (externalShowBookmark !== undefined) {
      setInternalShowBookmark(externalShowBookmark);
    }
  }, [externalShowBookmark]);

  const fabClass = isDark
    ? 'bg-neutral-900/80 backdrop-blur-sm border-neutral-700 text-neutral-400 hover:text-neutral-100'
    : 'bg-white/90 backdrop-blur-sm border-neutral-200 text-neutral-500 hover:text-neutral-700';

  const handleAddBlock = (type: 'search' | 'weather') => {
    onAddBlock(type);
    setIsHovered(false);
  };

  const handleBookmarkClick = () => {
    setIsHovered(false);
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

  const handleSettingsClick = () => {
    onAddSettings(); // Toggle: ajoute ou supprime le bloc settings
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

  const radius = 90;
  const startAngle = -180;
  const endAngle = 0;

  const getPosition = (index: number, total: number) => {
    const angle = startAngle + (index / (total - 1 || 1)) * (endAngle - startAngle);
    const radian = (angle * Math.PI) / 180;
    return { x: Math.cos(radian) * radius, y: Math.sin(radian) * radius };
  };

  return (
    <>
      {/* FAB Container */}
      <div
        className="fixed bottom-12 left-1/2 z-40 flex items-end justify-center"
        style={{ width: radius * 2 + 56, height: radius + 56, transform: 'translateX(-50%)' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Actions d'ajout */}
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
                transform: isHovered
                  ? `translate(calc(-50% + ${x}px), ${y}px)`
                  : 'translate(-50%, 0)',
                opacity: isHovered ? 1 : 0,
                transition: 'all 200ms',
                transitionDelay: isHovered ? `${index * 20}ms` : '0ms',
                pointerEvents: isHovered ? 'auto' : 'none',
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
          onClick={handleSettingsClick}
          className={`relative w-14 h-14 rounded-full border flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 ${fabClass}`}
        >
          {isHovered ? (
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
