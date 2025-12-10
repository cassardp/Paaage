import { useState, useEffect, useCallback } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import { useConfig } from './hooks/useConfig';
import { getShareUrl } from './hooks/useCloudStorage';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { DraggableGrid } from './components/DraggableGrid';
import { BlockWrapper } from './components/BlockWrapper';
import { BlockContent } from './components/BlockContent';
import { Spinner } from './components/Spinner';
import { Toolbar } from './components/Toolbar';
import { SlashMenu } from './components/SlashMenu';
import { DesktopNavigator } from './components/DesktopNavigator';
import { DesktopCarousel } from './components/DesktopCarousel';
import { DragOverlay } from './components/DragOverlay';
import { CrossDesktopDragProvider, useCrossDesktopDrag } from './contexts/CrossDesktopDragContext';
import { CELL_SIZE } from './lib/defaultConfig';
import { pixelToGrid } from './components/Grid';
import type { Block } from './types/config';

function AppContent() {
  const [dragLocked, setDragLocked] = useState(false);
  const [focusedNoteId, setFocusedNoteId] = useState<string | null>(null);
  const [notesHidden, setNotesHidden] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);

  const { dragState: crossDragState, endCrossDrag } = useCrossDesktopDrag();

  // Détecter le redimensionnement
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const {
    config,
    isLoading,
    syncing,
    syncId,
    setConfig,
    getCurrentDesktop,
    addDesktop,
    switchDesktop,
    moveBlock,
    moveBlockToDesktop,
    deleteBlock,
    addBlock,
    addBookmark,
    addSingleNote,
    updateNote,
    updateNoteTitle,
    addTodo,
    updateTodo,
    updateTodoTitle,
    updateWeatherCity,
    updateClockCity,
    updateStockSymbol,
    updateStationUrl,
    addStation,
    addStock,
    addClock,
    addRss,
    updateRssFeedUrl,
    addLinks,
    updateLinks,
    addSettings,
    toggleTheme,
    toggleLinkTarget,
    toggleGridLines,
    undo,
  } = useConfig();

  const [showQRModal, setShowQRModal] = useState(false);

  // Mettre à jour theme-color et background pour Safari
  useEffect(() => {
    const isDarkTheme = config.settings.theme === 'dark';
    const themeColor = isDarkTheme ? '#0a0a0a' : '#ffffff';
    
    // Mettre à jour la balise meta theme-color
    let meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.content = themeColor;
    
    // Mettre à jour le background du body (Safari utilise ça pour la barre d'adresse)
    document.body.style.backgroundColor = themeColor;
  }, [config.settings.theme]);

  // Raccourcis clavier
  const toggleLock = useCallback(() => setDragLocked(prev => !prev), []);
  const toggleHidden = useCallback(() => setNotesHidden(prev => !prev), []);

  // Navigation entre desktops avec les flèches (sans boucle)
  const navigateLeft = useCallback(() => {
    const currentIndex = config.desktops.findIndex(d => d.id === config.currentDesktopId);
    if (currentIndex > 0) {
      switchDesktop(config.desktops[currentIndex - 1].id);
    }
  }, [config.desktops, config.currentDesktopId, switchDesktop]);

  const lastDesktop = config.desktops[config.desktops.length - 1];
  const lastDesktopEmpty = lastDesktop?.blocks.length === 0;

  const navigateRight = useCallback(() => {
    const currentIndex = config.desktops.findIndex(d => d.id === config.currentDesktopId);
    if (currentIndex < config.desktops.length - 1) {
      switchDesktop(config.desktops[currentIndex + 1].id);
    } else if (!lastDesktopEmpty) {
      // On est sur le dernier desktop et il n'est pas vide, créer un nouveau
      addDesktop();
    }
  }, [config.desktops, config.currentDesktopId, switchDesktop, addDesktop, lastDesktopEmpty]);

  useKeyboardShortcuts({
    onToggleLock: toggleLock,
    onToggleHidden: toggleHidden,
    onToggleGrid: toggleGridLines,
    onUndo: undo,
    onNavigateLeft: navigateLeft,
    onNavigateRight: navigateRight
  });

  // Callback pour le carrousel
  const handleCarouselIndexChange = useCallback((index: number) => {
    if (index >= 0 && index < config.desktops.length) {
      switchDesktop(config.desktops[index].id);
    } else if (index === config.desktops.length && !lastDesktopEmpty) {
      // On scroll vers un nouveau desktop (seulement si le dernier n'est pas vide)
      addDesktop();
    }
  }, [config.desktops, switchDesktop, addDesktop, lastDesktopEmpty]);

  // Gestion du drop cross-desktop
  const currentDesktopIndex = config.desktops.findIndex(d => d.id === config.currentDesktopId);
  
  useEffect(() => {
    if (!crossDragState) return;

    const handleMouseUp = () => {
      const state = endCrossDrag();
      if (!state) return;

      // Calculer la position en grid sur le desktop actuel
      const gridX = pixelToGrid(state.clientX - state.offsetX);
      const gridY = pixelToGrid(state.clientY - state.offsetY);
      const gridW = Math.round(state.width / CELL_SIZE);
      const gridH = Math.round(state.height / CELL_SIZE);

      // Limiter aux bords de l'écran
      const maxCols = Math.floor(window.innerWidth / CELL_SIZE);
      const maxRows = Math.floor(window.innerHeight / CELL_SIZE);
      const finalX = Math.max(0, Math.min(gridX, maxCols - gridW));
      const finalY = Math.max(0, Math.min(gridY, maxRows - gridH));

      const newLayout = { x: finalX, y: finalY, w: gridW, h: gridH };
      const targetDesktopId = config.desktops[currentDesktopIndex]?.id;

      if (targetDesktopId && targetDesktopId !== state.sourceDesktopId) {
        // Déplacer vers un autre desktop
        moveBlockToDesktop(state.block.id, state.sourceDesktopId, targetDesktopId, newLayout);
      } else if (targetDesktopId) {
        // Même desktop, juste déplacer
        moveBlock(state.block.id, newLayout);
      }
    };

    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [crossDragState, endCrossDrag, config.desktops, currentDesktopIndex, moveBlock, moveBlockToDesktop]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" isDark={true} />
      </div>
    );
  }

  const isDark = config.settings.theme === 'dark';
  const currentDesktop = getCurrentDesktop();


  const renderBlockContent = (block: Block) => (
    <BlockContent
      block={block}
      searchEngine={config.settings.searchEngine}
      onUpdateNote={updateNote}
      onUpdateNoteTitle={updateNoteTitle}
      onUpdateTodo={updateTodo}
      onUpdateTodoTitle={updateTodoTitle}
      onUpdateWeatherCity={updateWeatherCity}
      onUpdateClockCity={updateClockCity}
      onUpdateStockSymbol={updateStockSymbol}
      onUpdateStationUrl={updateStationUrl}
      onUpdateRssFeedUrl={updateRssFeedUrl}
      onUpdateLinks={updateLinks}
      isDark={isDark}
      focusedNoteId={focusedNoteId}
      onNoteFocused={() => setFocusedNoteId(null)}
      config={config}
      // Settings block props
      syncing={syncing}
      dragLocked={dragLocked}
      notesHidden={notesHidden}
      onToggleTheme={toggleTheme}
      onToggleLinkTarget={toggleLinkTarget}
      onToggleDragLock={() => setDragLocked(!dragLocked)}
      onToggleNotesHidden={() => setNotesHidden(!notesHidden)}
      onToggleGridLines={toggleGridLines}
      onImport={setConfig}
      onShowQRModal={() => setShowQRModal(true)}
    />
  );

  const renderBlock = (block: Block, isDragging: boolean) => {
    const isCompact = block.layout.h <= 2 || (block.type === 'links' && block.layout.w > block.layout.h * 2);
    return (
      <BlockWrapper isDragging={isDragging} isDark={isDark} compact={isCompact}>
        {renderBlockContent(block)}
      </BlockWrapper>
    );
  };

  // Version mobile - message desktop only
  if (isMobile) {
    return (
      <div className="min-h-screen bg-[var(--grid-color)] p-4 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm border border-neutral-200 rounded-2xl p-6 text-center max-w-sm">
          <p className="text-neutral-700 text-sm">
            This app is optimized for desktop use only.
          </p>
        </div>
        <SpeedInsights />
        <Analytics />
      </div>
    );
  }

  // Version desktop
  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <Toolbar
        isDark={isDark}
        dragLocked={dragLocked}
        notesHidden={notesHidden}
        onAddBlock={addBlock}
        onAddBookmark={addBookmark}
        onAddNote={(content) => setFocusedNoteId(addSingleNote(content))}
        onAddStation={addStation}
        onAddStock={addStock}
        onAddTodo={addTodo}
        onAddClock={addClock}
        onAddRss={addRss}
        onAddSettings={addSettings}
        showBookmarkForm={showBookmarkModal}
        onShowBookmarkForm={setShowBookmarkModal}
        hasSearchBlock={currentDesktop.blocks.some(b => b.type === 'search')}
        hasSettingsBlock={currentDesktop.blocks.some(b => b.type === 'settings')}
      />
      <DesktopCarousel
        currentIndex={config.desktops.findIndex(d => d.id === config.currentDesktopId)}
        onChangeIndex={handleCarouselIndexChange}
        isDark={isDark}
        lastDesktopEmpty={lastDesktopEmpty}
      >
        {config.desktops.map((desktop) => {
          const desktopBlocks = notesHidden
            ? desktop.blocks.filter(b => b.type === 'search' || b.type === 'bookmark' || b.type === 'settings')
            : desktop.blocks;
          
          return (
            <DraggableGrid
              key={desktop.id}
              blocks={desktopBlocks}
              desktopId={desktop.id}
              onMoveBlock={moveBlock}
              onDeleteBlock={deleteBlock}
              renderBlock={renderBlock}
              isDark={isDark}
              dragLocked={dragLocked}
              hideGridLines={config.settings.hideGridLines}
            />
          );
        })}
      </DesktopCarousel>
      <SlashMenu
        onAddSearch={() => addBlock('search')}
        onAddWeather={() => addBlock('weather')}
        onAddBookmark={() => setShowBookmarkModal(true)}
        onAddNote={() => setFocusedNoteId(addSingleNote(''))}
        onAddStation={addStation}
        onAddStock={addStock}
        onAddTodo={addTodo}
        onAddClock={addClock}
        onAddRss={addRss}
        onAddLinks={addLinks}
        onAddSettings={addSettings}
        hasSearchBlock={currentDesktop.blocks.some(b => b.type === 'search')}
        hasSettingsBlock={currentDesktop.blocks.some(b => b.type === 'settings')}
        isDark={isDark}
      />
      <DesktopNavigator
        desktops={config.desktops}
        currentDesktopId={config.currentDesktopId}
        onSwitchDesktop={switchDesktop}
        onAddDesktop={addDesktop}
        isDark={isDark}
        lastDesktopEmpty={lastDesktopEmpty}
      />
      {/* Overlay de drag cross-desktop */}
      <DragOverlay
        renderBlock={renderBlock}
        desktopCount={config.desktops.length}
        currentDesktopIndex={currentDesktopIndex}
        onScrollToDesktop={handleCarouselIndexChange}
        lastDesktopEmpty={lastDesktopEmpty}
      />
      {/* Modal QR Code */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowQRModal(false)}>
          <div className={`p-6 rounded-lg border shadow-xl w-80 ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'}`} onClick={(e) => e.stopPropagation()}>
            <h3 className={`text-lg font-semibold mb-4 text-center ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
              Sync
            </h3>
            <div className="flex justify-center mb-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(getShareUrl())}`}
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
              onClick={() => {
                navigator.clipboard.writeText(getShareUrl());
                setShowQRModal(false);
              }}
              className="w-full py-2 rounded text-sm cursor-pointer bg-[var(--accent-color)] text-white font-medium"
            >
              Copy link
            </button>
          </div>
        </div>
      )}
      <SpeedInsights />
      <Analytics />
    </div>
  );
}

// Wrapper avec le provider
function App() {
  return (
    <CrossDesktopDragProvider>
      <AppContent />
    </CrossDesktopDragProvider>
  );
}

export default App
