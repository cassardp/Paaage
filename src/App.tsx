import { useState, useEffect } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { useConfig } from './hooks/useConfig';
import { DraggableGrid } from './components/DraggableGrid';
import { MobileLayout } from './components/MobileLayout';
import { BlockWrapper } from './components/BlockWrapper';
import { BlockContent } from './components/BlockContent';
import { Toolbar } from './components/Toolbar';
import type { Block } from './types/config';

function App() {
  const [dragLocked, setDragLocked] = useState(false);
  const [focusedNoteId, setFocusedNoteId] = useState<string | null>(null);
  const [notesHidden, setNotesHidden] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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
    moveBlock,
    deleteBlock,
    addBlock,
    addBookmark,
    addSingleNote,
    updateNote,
    addTodo,
    updateTodo,
    addStation,
    addStock,
    addClock,
    addNews,
    selectStation,
    toggleTheme,
  } = useConfig();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--accent-color)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isDark = config.settings.theme === 'dark';
  const visibleBlocks = notesHidden 
    ? config.blocks.filter(b => b.type !== 'note' && b.type !== 'todo') 
    : config.blocks;

  const renderBlockContent = (block: Block) => (
    <BlockContent
      block={block}
      searchEngine={config.settings.searchEngine}
      onSelectStation={selectStation}
      onUpdateNote={updateNote}
      onUpdateTodo={updateTodo}
      isDark={isDark}
      focusedNoteId={focusedNoteId}
      onNoteFocused={() => setFocusedNoteId(null)}
    />
  );

  const renderBlock = (block: Block, isDragging: boolean) => {
    const isCompact = block.layout.h <= 2;
    return (
      <BlockWrapper isDragging={isDragging} isDark={isDark} compact={isCompact}>
        {renderBlockContent(block)}
      </BlockWrapper>
    );
  };

  const renderMobileBlock = (block: Block) => {
    const isCompact = block.layout.h <= 2;
    return (
      <BlockWrapper isDragging={false} isDark={isDark} compact={isCompact}>
        {renderBlockContent(block)}
      </BlockWrapper>
    );
  };

  // Version mobile - uniquement liens, notes et todos
  if (isMobile) {
    const mobileBlocks = visibleBlocks.filter(b => 
      b.type === 'bookmark' || b.type === 'note' || b.type === 'todo'
    );
    return (
      <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
        <MobileLayout
          blocks={mobileBlocks}
          renderBlock={renderMobileBlock}
          isDark={isDark}
        />
        <SpeedInsights />
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
        onAddNews={addNews}
        isDark={isDark}
        dragLocked={dragLocked}
        onToggleDragLock={() => setDragLocked(!dragLocked)}
        notesHidden={notesHidden}
        onToggleNotesHidden={() => setNotesHidden(!notesHidden)}
      />
      <DraggableGrid
        blocks={visibleBlocks}
        onMoveBlock={moveBlock}
        onDeleteBlock={deleteBlock}
        renderBlock={renderBlock}
        isDark={isDark}
        dragLocked={dragLocked}
      />
      <SpeedInsights />
    </div>
  );
}

export default App
