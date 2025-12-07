import type { Block, TodoItem, LinkItem } from '../types/config';
import { SearchBlock } from './SearchBlock';
import { RadioBlock } from './RadioBlock';
import { WeatherBlock } from './WeatherBlock';
import { BookmarkBlock } from './BookmarkBlock';
import { NoteBlock } from './NoteBlock';
import { StationBlock } from './StationBlock';
import { StockBlock } from './StockBlock';
import { TodoBlock } from './TodoBlock';
import { ClockBlock } from './ClockBlock';
import { RssBlock } from './RssBlock';
import { LinksBlock } from './LinksBlock';

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
  onUpdateRssFeedUrl: (blockId: string, feedUrl: string) => void;
  onUpdateLinks: (blockId: string, items: LinkItem[]) => void;
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
  onUpdateRssFeedUrl,
  onUpdateLinks,
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
      return <WeatherBlock city={block.city} isDark={isDark} width={block.layout.w} onUpdateCity={(city) => onUpdateWeatherCity(block.id, city)} />;
    
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
      return <StockBlock symbol={block.symbol} isDark={isDark} width={block.layout.w} onUpdateSymbol={(symbol) => onUpdateStockSymbol(block.id, symbol)} />;
    
    case 'todo':
      return <TodoBlock blockId={block.id} items={block.items} onUpdate={onUpdateTodo} isDark={isDark} />;
    
    case 'clock':
      return <ClockBlock city={block.city} timezone={block.timezone} isDark={isDark} onUpdateCity={(city, tz) => onUpdateClockCity(block.id, city, tz)} />;
    
    case 'rss':
      return <RssBlock feedUrl={block.feedUrl} isDark={isDark} onUpdateFeedUrl={(url) => onUpdateRssFeedUrl(block.id, url)} />;
    
    case 'links':
      return <LinksBlock blockId={block.id} items={block.items} width={block.layout.w} height={block.layout.h} onUpdate={onUpdateLinks} isDark={isDark} />;
    
    default:
      return null;
  }
}
