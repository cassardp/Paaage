// Types pour la configuration Paaage

export interface BlockLayout {
  x: number;      // Position colonne (0-indexed)
  y: number;      // Position ligne (0-indexed)
  w: number;      // Largeur en cellules
  h: number;      // Hauteur en cellules
}

export interface BaseBlock {
  id: string;
  layout: BlockLayout;
}

export interface SearchBlock extends BaseBlock {
  type: 'search';
}


export interface StationBlock extends BaseBlock {
  type: 'station';
  name: string;
  streamUrl: string;
}

export interface WeatherBlock extends BaseBlock {
  type: 'weather';
  city: string;
}

export interface BookmarkBlock extends BaseBlock {
  type: 'bookmark';
  label: string;
  url: string;
}

export interface NoteBlock extends BaseBlock {
  type: 'note';
  content: string;
}

export interface StockBlock extends BaseBlock {
  type: 'stock';
  symbol: string;
}

export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
}

export interface TodoBlock extends BaseBlock {
  type: 'todo';
  items: TodoItem[];
}

export interface ClockBlock extends BaseBlock {
  type: 'clock';
  city?: string;
  timezone?: string;
}

export interface RssBlock extends BaseBlock {
  type: 'rss';
  feedUrl?: string;
}

export interface LinkItem {
  id: string;
  label: string;
  url: string;
}

export interface LinksBlock extends BaseBlock {
  type: 'links';
  items: LinkItem[];
}

export type Block = SearchBlock | WeatherBlock | BookmarkBlock | NoteBlock | StationBlock | StockBlock | TodoBlock | ClockBlock | RssBlock | LinksBlock;

export interface Settings {
  theme: 'light' | 'dark';
  accentColor?: string; // Deprecated - non utilisé
  searchEngine: string;
  linkTarget: '_blank' | '_self';
}

export interface Config {
  version: number;
  updatedAt: string;
  settings: Settings;
  blocks: Block[];
}
