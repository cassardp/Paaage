import type { Block, TodoItem, LinkItem, Config } from '../types/config';
import { SearchBlock } from './SearchBlock';
import { WeatherBlock } from './WeatherBlock';
import { BookmarkBlock } from './BookmarkBlock';
import { NoteBlock } from './NoteBlock';
import { StationBlock } from './StationBlock';
import { StockBlock } from './StockBlock';
import { TodoBlock } from './TodoBlock';
import { ClockBlock } from './ClockBlock';
import { RssBlock } from './RssBlock';
import { LinksBlock } from './LinksBlock';
import { SettingsBlock } from './SettingsBlock';

interface BlockContentProps {
  block: Block;
  searchEngine: string;
  onUpdateNote: (blockId: string, content: string) => void;
  onUpdateNoteTitle: (blockId: string, title: string) => void;
  onUpdateTodo: (blockId: string, items: TodoItem[]) => void;
  onUpdateTodoTitle: (blockId: string, title: string) => void;
  onUpdateWeatherCity: (blockId: string, city: string) => void;
  onUpdateClockCity: (blockId: string, city: string, timezone: string) => void;
  onUpdateStockSymbol: (blockId: string, symbol: string) => void;
  onUpdateStationUrl: (blockId: string, name: string, streamUrl: string) => void;
  onUpdateRssFeedUrl: (blockId: string, feedUrl: string) => void;
  onUpdateLinks: (blockId: string, items: LinkItem[]) => void;
  isDark?: boolean;
  focusedNoteId?: string | null;
  onNoteFocused?: () => void;
  config: Config;
  // Settings block props
  syncId?: string;
  syncing?: boolean;
  canUndo?: boolean;
  dragLocked?: boolean;
  notesHidden?: boolean;
  onToggleTheme?: () => void;
  onToggleLinkTarget?: () => void;
  onToggleDragLock?: () => void;
  onToggleNotesHidden?: () => void;
  onToggleGridLines?: () => void;
  onUndo?: () => void;
  onImport?: (config: Config) => void;
  onShowQRModal?: () => void;
}

export function BlockContent({
  block,
  searchEngine,
  onUpdateNote,
  onUpdateNoteTitle,
  onUpdateTodo,
  onUpdateTodoTitle,
  onUpdateWeatherCity,
  onUpdateClockCity,
  onUpdateStockSymbol,
  onUpdateStationUrl,
  onUpdateRssFeedUrl,
  onUpdateLinks,
  isDark = true,
  focusedNoteId,
  onNoteFocused,
  config,
  // Settings props
  syncId = '',
  syncing = false,
  canUndo = false,
  dragLocked = false,
  notesHidden = false,
  onToggleTheme,
  onToggleLinkTarget,
  onToggleDragLock,
  onToggleNotesHidden,
  onToggleGridLines,
  onUndo,
  onImport,
  onShowQRModal,
}: BlockContentProps) {
  switch (block.type) {
    case 'search':
      return <SearchBlock searchEngine={searchEngine} isDark={isDark} config={config} />;

    case 'weather':
      return <WeatherBlock city={block.city} isDark={isDark} width={block.layout.w} onUpdateCity={(city) => onUpdateWeatherCity(block.id, city)} />;

    case 'bookmark':
      return <BookmarkBlock label={block.label} url={block.url} height={block.layout.h} isDark={isDark} config={config} />;

    case 'note':
      return (
        <NoteBlock
          blockId={block.id}
          content={block.content}
          title={block.title}
          onUpdate={onUpdateNote}
          onUpdateTitle={(title) => onUpdateNoteTitle(block.id, title)}
          isDark={isDark}
          autoFocus={focusedNoteId === block.id}
          onFocused={onNoteFocused}
          config={config}
        />
      );

    case 'station':
      return <StationBlock name={block.name} streamUrl={block.streamUrl} isDark={isDark} onUpdateStation={(name, url) => onUpdateStationUrl(block.id, name, url)} />;

    case 'stock':
      return <StockBlock symbol={block.symbol} isDark={isDark} width={block.layout.w} onUpdateSymbol={(symbol) => onUpdateStockSymbol(block.id, symbol)} />;

    case 'todo':
      return <TodoBlock blockId={block.id} items={block.items} title={block.title} onUpdate={onUpdateTodo} onUpdateTitle={(title) => onUpdateTodoTitle(block.id, title)} isDark={isDark} config={config} />;

    case 'clock':
      return <ClockBlock city={block.city} timezone={block.timezone} isDark={isDark} onUpdateCity={(city, tz) => onUpdateClockCity(block.id, city, tz)} />;

    case 'rss':
      return <RssBlock feedUrl={block.feedUrl} isDark={isDark} onUpdateFeedUrl={(url) => onUpdateRssFeedUrl(block.id, url)} config={config} />;

    case 'links':
      return <LinksBlock blockId={block.id} items={block.items} width={block.layout.w} height={block.layout.h} onUpdate={onUpdateLinks} isDark={isDark} config={config} />;

    case 'settings':
      return (
        <SettingsBlock
          isDark={isDark}
          config={config}
          syncId={syncId}
          syncing={syncing}
          canUndo={canUndo}
          dragLocked={dragLocked}
          notesHidden={notesHidden}
          onToggleTheme={onToggleTheme!}
          onToggleLinkTarget={onToggleLinkTarget!}
          onToggleDragLock={onToggleDragLock!}
          onToggleNotesHidden={onToggleNotesHidden!}
          onToggleGridLines={onToggleGridLines!}
          onUndo={onUndo!}
          onImport={onImport!}
          onShowQRModal={onShowQRModal!}
        />
      );

    default:
      return null;
  }
}
