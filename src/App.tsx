import { useState, useCallback } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import { useConfig } from './hooks/useConfig';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useResponsive } from './hooks/useResponsive';
import { DraggableGrid } from './components/DraggableGrid';
import { ResponsiveBlockList } from './components/ResponsiveBlockList';
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
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);

  // Responsive detection
  const { isMobile, isTablet, cellSize } = useResponsive();

  const {
    config,
    isLoading,
    syncing,
    syncId,
    setConfig,
    getCurrentDesktop,
    addDesktop,
    switchDesktop,
    reorderBlock,
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

  // Navigation entre desktops avec les flèches
  const navigateLeft = useCallback(() => {
    const currentIndex = config.desktops.findIndex(d => d.id === config.currentDesktopId);
    if (currentIndex > 0) {
      switchDesktop(config.desktops[currentIndex - 1].id);
    } else {
      // Boucler vers le dernier desktop
      switchDesktop(config.desktops[config.desktops.length - 1].id);
    }
  }, [config.desktops, config.currentDesktopId, switchDesktop]);

  const navigateRight = useCallback(() => {
    const currentIndex = config.desktops.findIndex(d => d.id === config.currentDesktopId);
    if (currentIndex < config.desktops.length - 1) {
      switchDesktop(config.desktops[currentIndex + 1].id);
    } else {
      // Boucler vers le premier desktop
      switchDesktop(config.desktops[0].id);
    }
  }, [config.desktops, config.currentDesktopId, switchDesktop]);

  useKeyboardShortcuts({
    onToggleLock: toggleLock,
    onToggleHidden: toggleHidden,
    onUndo: undo,
    onNavigateLeft: navigateLeft,
    onNavigateRight: navigateRight
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

  // Render mobile layout
  if (isMobile) {
    return (
      <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
        <ResponsiveBlockList
          blocks={visibleBlocks}
          onMoveBlock={reorderBlock}
          onDeleteBlock={deleteBlock}
          isDark={isDark}
          config={config}
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
          focusedNoteId={focusedNoteId}
          onNoteFocused={() => setFocusedNoteId(null)}
        />
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
        {/* Desktop navigator at top on mobile */}
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-30">
          <DesktopNavigator
            desktops={config.desktops}
            currentDesktopId={config.currentDesktopId}
            onSwitchDesktop={switchDesktop}
            onAddDesktop={addDesktop}
            isDark={isDark}
          />
        </div>
        <SpeedInsights />
        <Analytics />
      </div>
    );
  }

  // Render desktop/tablet layout
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
        cellSize={cellSize}
        isTablet={isTablet}
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
