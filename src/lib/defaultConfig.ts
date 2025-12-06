import type { Config } from '../types/config';

// Configuration de la grille
export const CELL_SIZE = 16; // px - taille d'une cellule

export const DEFAULT_CONFIG: Config = {
  version: 1,
  updatedAt: new Date().toISOString(),
  settings: {
    theme: 'light',
    accentColor: '#FF6B00',
    searchEngine: 'https://www.google.com/search?q=',
  },
  blocks: [
    { id: '52p4xxg', type: 'note', content: '/ to open the insert menu.', layout: { x: 39, y: 17, w: 12, h: 5 } },
    { id: 'fohf9ph', type: 'note', content: 'Hmmm… this is really very interesting!\n\nhttps://www.youtube.com/watch?v=xvFZjo5PgG0', layout: { x: 49, y: 21, w: 20, h: 8 } },
    { id: 'k0nmq2x', type: 'note', content: 'Shift L  -> lock\nShift M -> mask\nShift U  -> undo', layout: { x: 30, y: 28, w: 12, h: 6 } },
  ],
};
