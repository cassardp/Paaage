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
import { NewsBlock } from './NewsBlock';

interface BlockContentProps {
  block: Block;
  searchEngine: string;
  onSelectStation: (blockId: string, stationId: string | null) => void;
  onUpdateNote: (blockId: string, content: string) => void;
  onUpdateTodo: (blockId: string, items: TodoItem[]) => void;
  onUpdateWeatherCity: (blockId: string, city: string) => void;
  onUpdateClockCity: (blockId: string, city: string, timezone: string) => void;
  onUpdateStockSymbol: (blockId: string, symbol: string) => void;
  onUpdateStationUrl: (blockId: string, name: string, streamUrl: string) => void;
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
  onUpdateWeatherCity,
  onUpdateClockCity,
  onUpdateStockSymbol,
  onUpdateStationUrl,
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
      return <WeatherBlock city={block.city} isDark={isDark} onUpdateCity={(city) => onUpdateWeatherCity(block.id, city)} />;
    
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
      return <StationBlock name={block.name} streamUrl={block.streamUrl} isDark={isDark} onUpdateStation={(name, url) => onUpdateStationUrl(block.id, name, url)} />;
    
    case 'stock':
      return <StockBlock symbol={block.symbol} isDark={isDark} onUpdateSymbol={(symbol) => onUpdateStockSymbol(block.id, symbol)} />;
    
    case 'todo':
      return <TodoBlock blockId={block.id} items={block.items} onUpdate={onUpdateTodo} isDark={isDark} />;
    
    case 'clock':
      return <ClockBlock city={block.city} timezone={block.timezone} isDark={isDark} onUpdateCity={(city, tz) => onUpdateClockCity(block.id, city, tz)} />;
    
    case 'news':
      return <NewsBlock isDark={isDark} />;
    
    default:
      return null;
  }
}
