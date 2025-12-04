import { useState, useEffect } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Monitor } from 'lucide-react';
import { useConfig } from './hooks/useConfig';
import { DraggableGrid } from './components/DraggableGrid';
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

  // Afficher un message sur mobile
  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-900 text-neutral-200 p-8 text-center">
        <Monitor className="w-12 h-12 mb-4 text-neutral-500" />
        <h1 className="text-xl font-semibold mb-2">Desktop uniquement</h1>
        <p className="text-neutral-400 text-sm max-w-xs">
          Paaage n'est pas encore disponible sur mobile. Ouvrez cette page sur un ordinateur.
        </p>
        <SpeedInsights />
      </div>
    );
  }

  const isDark = config.settings.theme === 'dark';

  const renderBlock = (block: Block, isDragging: boolean) => {
    const isCompact = block.layout.h <= 2;
    
    return (
      <BlockWrapper isDragging={isDragging} isDark={isDark} compact={isCompact}>
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
      </BlockWrapper>
    );
  };

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      {/* Toolbar fixe */}
      <Toolbar
        config={config}
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
      
      {/* Grille de blocs - pleine page */}
      <DraggableGrid
        blocks={notesHidden ? config.blocks.filter(b => b.type !== 'note' && b.type !== 'todo') : config.blocks}
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
