import type { Block, TodoItem } from '../types/config';
import { SearchBlock } from './SearchBlock';
import { RadioBlock } from './RadioBlock';
import { WeatherBlock } from './WeatherBlock';
import { BookmarkBlock } from './BookmarkBlock';
import { NoteBlock } from './NoteBlock';
import { StationBlock } from './StationBlock';
import { StockBlock } from './StockBlock';
import { TodoBlock } from './TodoBlock';
import { ClockBlock } from './ClockBlock';

interface BlockContentProps {
  block: Block;
  searchEngine: string;
  onSelectStation: (blockId: string, stationId: string | null) => void;
  onUpdateNote: (blockId: string, content: string) => void;
  onUpdateTodo: (blockId: string, items: TodoItem[]) => void;
  isDark?: boolean;
  focusedNoteId?: string | null;
  onNoteFocused?: () => void;
}

export function BlockContent({
  block,
  searchEngine,
  onSelectStation,
  onUpdateNote,
  onUpdateTodo,
  isDark = true,
  focusedNoteId,
  onNoteFocused,
}: BlockContentProps) {
  switch (block.type) {
    case 'search':
      return <SearchBlock searchEngine={searchEngine} isDark={isDark} />;
    
    case 'radio':
      return (
        <RadioBlock
          blockId={block.id}
          title={block.title}
          stations={block.stations}
          currentStationId={block.currentStationId}
          onSelectStation={onSelectStation}
          isDark={isDark}
        />
      );
    
    case 'weather':
      return <WeatherBlock city={block.city} isDark={isDark} />;
    
    case 'bookmark':
      return <BookmarkBlock label={block.label} url={block.url} height={block.layout.h} isDark={isDark} />;
    
    case 'note':
      return (
        <NoteBlock
          blockId={block.id}
          content={block.content}
          onUpdate={onUpdateNote}
          isDark={isDark}
          autoFocus={focusedNoteId === block.id}
          onFocused={onNoteFocused}
        />
      );
    
    case 'station':
      return <StationBlock name={block.name} streamUrl={block.streamUrl} isDark={isDark} />;
    
    case 'stock':
      return <StockBlock symbol={block.symbol} isDark={isDark} />;
    
    case 'todo':
      return <TodoBlock blockId={block.id} items={block.items} onUpdate={onUpdateTodo} isDark={isDark} />;
    
    case 'clock':
      return <ClockBlock city={block.city} timezone={block.timezone} isDark={isDark} />;
    
    default:
      return null;
  }
}
