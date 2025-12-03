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

export interface Link {
  id: string;
  label: string;
  url: string;
  icon?: string;
}

export interface LinksBlock extends BaseBlock {
  type: 'links';
  title: string;
  links: Link[];
}

export interface NoteItem {
  id: string;
  content: string;
  createdAt: string;
}

export interface NotesBlock extends BaseBlock {
  type: 'notes';
  title: string;
  items: NoteItem[];
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

export type Block = SearchBlock | LinksBlock | NotesBlock | RadioBlock;

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
