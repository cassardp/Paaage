import type { Config } from '../types/config';

// Configuration de la grille
export const CELL_SIZE = 20; // px - taille d'une cellule

export const DEFAULT_CONFIG: Config = {
  version: 1,
  updatedAt: new Date().toISOString(),
  settings: {
    theme: 'dark',
    accentColor: '#FF6B00',
    searchEngine: 'https://www.google.com/search?q=',
  },
  blocks: [
    {
      id: 'search-1',
      type: 'search',
      layout: { x: 1, y: 1, w: 58, h: 3 },
    },
    {
      id: 'radio-1',
      type: 'radio',
      title: 'Radio',
      stations: [
        { id: 'r1', name: 'France Inter', streamUrl: 'https://icecast.radiofrance.fr/franceinter-midfi.mp3' },
        { id: 'r2', name: 'France Info', streamUrl: 'https://icecast.radiofrance.fr/franceinfo-midfi.mp3' },
        { id: 'r3', name: 'France Culture', streamUrl: 'https://icecast.radiofrance.fr/franceculture-midfi.mp3' },
        { id: 'r4', name: 'FIP', streamUrl: 'https://icecast.radiofrance.fr/fip-midfi.mp3' },
      ],
      layout: { x: 1, y: 5, w: 20, h: 12 },
    },
  ],
};
