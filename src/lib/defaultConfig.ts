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
    { id: 'yrnxsch', type: 'note', content: 'Welcome to Paaage.app!!\n\nYou can add, move, delete blocks, and create your own start page.', layout: { x: 29, y: 7, w: 21, h: 9 } },
    { id: 'k0nmq2x', type: 'note', content: 'Shift L  -> lock\nShift M -> hide\nShift U  -> undo', layout: { x: 37, y: 18, w: 12, h: 6 } },
    { id: '52p4xxg', type: 'note', content: 'Type / to open the add menu.', layout: { x: 47, y: 14, w: 12, h: 5 } },
    { id: 'fohf9ph', type: 'note', content: 'Hmm... this is very interesting!\n\nhttps://www.youtube.com/watch?v=xvFZjo5PgG0', layout: { x: 55, y: 29, w: 20, h: 8 } },
  ],
};
