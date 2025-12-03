import type { Config } from '../types/config';

// Configuration de la grille
export const CELL_SIZE = 20; // px - taille d'une cellule

export const DEFAULT_CONFIG: Config = {
  version: 1,
  updatedAt: new Date().toISOString(),
  settings: {
    theme: 'light',
    accentColor: '#FF6B00',
    searchEngine: 'https://www.google.com/search?q=',
  },
  blocks: [
    {
      id: 'search-1',
      type: 'search',
      layout: { x: 22, y: 17, w: 35, h: 3 },
    },
    {
      id: 'weather-1',
      type: 'weather',
      city: 'Paris',
      layout: { x: 1, y: 1, w: 15, h: 4 },
    },
    {
      id: 'stock-1',
      type: 'stock',
      symbol: 'AAPL',
      layout: { x: 57, y: 25, w: 12, h: 4 },
    },
    {
      id: 'station-1',
      type: 'station',
      name: 'FIP',
      streamUrl: 'https://icecast.radiofrance.fr/fip-midfi.mp3',
      layout: { x: 57, y: 30, w: 12, h: 3 },
    },
    {
      id: 'bookmark-1',
      type: 'bookmark',
      label: 'Twitter',
      url: 'https://x.com/home',
      layout: { x: 18, y: 2, w: 6, h: 2 },
    },
    {
      id: 'bookmark-2',
      type: 'bookmark',
      label: 'Budget',
      url: 'https://budget-ruby-zeta.vercel.app/?room=1d960b9e',
      layout: { x: 25, y: 2, w: 7, h: 2 },
    },
    {
      id: 'note-1',
      type: 'note',
      content: 'Profitez d\'avantages supplémentaires, de l\'absence de publicités et de la priorisation des réponses la plus importante.',
      layout: { x: 1, y: 15, w: 13, h: 11 },
    },
    {
      id: 'note-2',
      type: 'note',
      content: 'Mais c\'est super !',
      layout: { x: 9, y: 24, w: 9, h: 3 },
    },
  ],
};
