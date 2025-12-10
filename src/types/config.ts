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
  title?: string;
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
  title?: string;
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

export interface SettingsBlock extends BaseBlock {
  type: 'settings';
}

export type Block = SearchBlock | WeatherBlock | BookmarkBlock | NoteBlock | StationBlock | StockBlock | TodoBlock | ClockBlock | RssBlock | LinksBlock | SettingsBlock;

export interface Desktop {
  id: string;
  name: string;
  blocks: Block[];
}

export interface Settings {
  theme: 'light' | 'dark';
  searchEngine: string;
  linkTarget: '_blank' | '_self';
  hideGridLines?: boolean;
}

export interface Config {
  version: number;
  updatedAt: string;
  settings: Settings;
  desktops: Desktop[];
  currentDesktopId: string;
  // Legacy support - will be migrated to desktops
  blocks?: Block[];
}
