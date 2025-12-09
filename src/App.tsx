import { useState, useEffect, useCallback } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import { useConfig } from './hooks/useConfig';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useSwipe } from './hooks/useSwipe';
import { DraggableGrid } from './components/DraggableGrid';
import { BlockWrapper } from './components/BlockWrapper';
import { BlockContent } from './components/BlockContent';
import { Spinner } from './components/Spinner';
import { Toolbar } from './components/Toolbar';
import { SlashMenu } from './components/SlashMenu';
import { DesktopNavigator } from './components/DesktopNavigator';
import type { Block } from './types/config';

function App() {
  const [dragLocked, setDragLocked] = useState(false);
  const [focusedNoteId, setFocusedNoteId] = useState<string | null>(null);
  const [notesHidden, setNotesHidden] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);

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
    toggleTheme,
    toggleLinkTarget,
    undo,
    canUndo,
  } = useConfig();

  // Raccourcis clavier
  const toggleLock = useCallback(() => setDragLocked(prev => !prev), []);
  const toggleHidden = useCallback(() => setNotesHidden(prev => !prev), []);
  useKeyboardShortcuts({ onToggleLock: toggleLock, onToggleHidden: toggleHidden, onUndo: undo });

  // Navigation par swipe
  const handleSwipeLeft = useCallback(() => {
    const currentIndex = config.desktops.findIndex(d => d.id === config.currentDesktopId);
    if (currentIndex < config.desktops.length - 1) {
      switchDesktop(config.desktops[currentIndex + 1].id);
    }
  }, [config.desktops, config.currentDesktopId, switchDesktop]);

  const handleSwipeRight = useCallback(() => {
    const currentIndex = config.desktops.findIndex(d => d.id === config.currentDesktopId);
    if (currentIndex > 0) {
      switchDesktop(config.desktops[currentIndex - 1].id);
    }
  }, [config.desktops, config.currentDesktopId, switchDesktop]);

  useSwipe({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    minSwipeDistance: 50,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" isDark={true} />
      </div>
    );
  }

  const isDark = config.settings.theme === 'dark';
  const currentDesktop = getCurrentDesktop();
  const visibleBlocks = notesHidden
    ? currentDesktop.blocks.filter(b => b.type === 'search' || b.type === 'bookmark')
    : currentDesktop.blocks;

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
        config={config}
        syncId={syncId}
        syncing={syncing}
        onImport={setConfig}
        onToggleTheme={toggleTheme}
        onAddBlock={addBlock}
        onAddBookmark={addBookmark}
        onAddNote={(content) => setFocusedNoteId(addSingleNote(content))}
        onAddStation={addStation}
        onAddStock={addStock}
        onAddTodo={addTodo}
        onAddClock={addClock}
        onAddRss={addRss}
        onUndo={undo}
        canUndo={canUndo}
        isDark={isDark}
        dragLocked={dragLocked}
        onToggleDragLock={() => setDragLocked(!dragLocked)}
        notesHidden={notesHidden}
        onToggleNotesHidden={() => setNotesHidden(!notesHidden)}
        showBookmarkForm={showBookmarkModal}
        onShowBookmarkForm={setShowBookmarkModal}
        onToggleLinkTarget={toggleLinkTarget}
        hasSearchBlock={currentDesktop.blocks.some(b => b.type === 'search')}
        hasNotesOrTodos={currentDesktop.blocks.some(b => b.type === 'note' || b.type === 'todo')}
      />
      <DraggableGrid
        blocks={visibleBlocks}
        onMoveBlock={moveBlock}
        onDeleteBlock={deleteBlock}
        renderBlock={renderBlock}
        isDark={isDark}
        dragLocked={dragLocked}
      />
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
        hasSearchBlock={currentDesktop.blocks.some(b => b.type === 'search')}
        isDark={isDark}
      />
      <DesktopNavigator
        desktops={config.desktops}
        currentDesktopId={config.currentDesktopId}
        onSwitchDesktop={switchDesktop}
        onAddDesktop={addDesktop}
        isDark={isDark}
      />
      <SpeedInsights />
      <Analytics />
    </div>
  );
}

export default App
