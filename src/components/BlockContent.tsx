import type { Block } from '../types/config';
import { SearchBlock } from './SearchBlock';
import { LinksBlock } from './LinksBlock';
import { NotesBlock } from './NotesBlock';
import { RadioBlock } from './RadioBlock';
import { WeatherBlock } from './WeatherBlock';

interface BlockContentProps {
  block: Block;
  searchEngine: string;
  onAddNote: (blockId: string, content: string) => void;
  onDeleteNote: (blockId: string, noteId: string) => void;
  onAddLink: (blockId: string, link: { label: string; url: string }) => void;
  onDeleteLink: (blockId: string, linkId: string) => void;
  onSelectStation: (blockId: string, stationId: string | null) => void;
  isDark?: boolean;
}

export function BlockContent({
  block,
  searchEngine,
  onAddNote,
  onDeleteNote,
  onAddLink,
  onDeleteLink,
  onSelectStation,
  isDark = true,
}: BlockContentProps) {
  switch (block.type) {
    case 'search':
      return <SearchBlock searchEngine={searchEngine} isDark={isDark} />;
    
    case 'links':
      return (
        <LinksBlock
          blockId={block.id}
          title={block.title}
          links={block.links}
          onAddLink={onAddLink}
          onDeleteLink={onDeleteLink}
          isDark={isDark}
        />
      );
    
    case 'notes':
      return (
        <NotesBlock
          blockId={block.id}
          title={block.title}
          items={block.items}
          onAddNote={onAddNote}
          onDeleteNote={onDeleteNote}
          isDark={isDark}
        />
      );
    
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
    
    default:
      return null;
  }
}
