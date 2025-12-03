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


export interface RadioStation {
  id: string;
  name: string;
  streamUrl: string;
}

export interface RadioBlock extends BaseBlock {
  type: 'radio';
  title: string;
  stations: RadioStation[];
  currentStationId?: string;
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

export interface StationBlock extends BaseBlock {
  type: 'station';
  name: string;
  streamUrl: string;
}

export interface StockBlock extends BaseBlock {
  type: 'stock';
  symbol: string;
}

export type Block = SearchBlock | RadioBlock | WeatherBlock | BookmarkBlock | NoteBlock | StationBlock | StockBlock;

export interface Settings {
  theme: 'light' | 'dark';
  accentColor: string;
  searchEngine: string;
}

export interface Config {
  version: number;
  updatedAt: string;
  settings: Settings;
  blocks: Block[];
}
