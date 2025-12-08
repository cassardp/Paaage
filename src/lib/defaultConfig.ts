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
    linkTarget: '_blank',
  },
  blocks: [
    { id: 'fohf9ph', type: 'note', content: 'Hmmm… this is really very interesting!\n\nhttps://www.youtube.com/watch?v=xvFZjo5PgG0', layout: { x: 41, y: 15, w: 20, h: 9 } },
    { id: '52p4xxg', type: 'note', content: '/ to open the insert menu.', layout: { x: 29, y: 11, w: 14, h: 5 } },
    { id: 'k0nmq2x', type: 'note', content: 'Shift L  -> lock\nShift M -> mask\nShift U  -> undo', layout: { x: 25, y: 28, w: 12, h: 6 } },
    { id: 'b22itk4', type: 'weather', city: 'San Francisco', layout: { x: 21, y: 19, w: 15, h: 5 } },
    { id: '6g2ygki', type: 'stock', symbol: 'AAPL', layout: { x: 41, y: 27, w: 14, h: 5 } },
    { id: 'o0wq8gm', type: 'note', content: 'iPhone app coming soon !', title: 'Soon', layout: { x: 49, y: 38, w: 20, h: 5 } },
    { id: 'tr7q9hx', type: 'station', name: 'Soma FM Groove Salad 320K AAC HLS', streamUrl: 'https://hls.somafm.com/hls/groovesalad/320k/program.m3u8', layout: { x: 56, y: 5, w: 12, h: 4 } },
  ],
};
