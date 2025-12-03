import { useConfig } from './hooks/useConfig';
import { DraggableGrid } from './components/DraggableGrid';
import { BlockWrapper } from './components/BlockWrapper';
import { BlockContent } from './components/BlockContent';
import { Toolbar } from './components/Toolbar';
import type { Block } from './types/config';

function App() {
  const {
    config,
    isLoading,
    setConfig,
    moveBlock,
    deleteBlock,
    addBlock,
    addNote,
    deleteNote,
    addLink,
    deleteLink,
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

  const renderBlock = (block: Block, isDragging: boolean) => (
    <BlockWrapper isDragging={isDragging} isDark={isDark}>
      <BlockContent
        block={block}
        searchEngine={config.settings.searchEngine}
        onAddNote={addNote}
        onDeleteNote={deleteNote}
        onAddLink={addLink}
        onDeleteLink={deleteLink}
        onSelectStation={selectStation}
        isDark={isDark}
      />
    </BlockWrapper>
  );

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      {/* Grille de blocs - pleine page */}
      <DraggableGrid
        blocks={config.blocks}
        onMoveBlock={moveBlock}
        onDeleteBlock={deleteBlock}
        renderBlock={renderBlock}
        toolbar={<Toolbar config={config} onImport={setConfig} onToggleTheme={toggleTheme} onAddBlock={addBlock} />}
        isDark={isDark}
      />
    </div>
  );
}

export default App
