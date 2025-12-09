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
    { id: 'b22itk4', type: 'weather', city: 'San Francisco', layout: { x: 21, y: 19, w: 15, h: 5 } },
    { id: '6g2ygki', type: 'stock', symbol: 'AAPL', layout: { x: 41, y: 27, w: 14, h: 5 } },
    { id: 'o0wq8gm', type: 'note', content: 'iPhone app coming soon !', title: 'Soon', layout: { x: 49, y: 38, w: 20, h: 5 } },
    { id: 'k0nmq2x', type: 'note', content: 'Shift L  -> lock\nShift M -> mask\nShift U  -> undo', title: 'Shortcuts', layout: { x: 27, y: 30, w: 12, h: 8 } },
    { id: 'fohf9ph', type: 'note', content: 'Hmmm… this is really very interesting!\n\nhttps://www.youtube.com/watch?v=xvFZjo5PgG0', title: '???', layout: { x: 41, y: 15, w: 21, h: 10 } },
    { id: '52p4xxg', type: 'note', content: '/ to open the insert menu.', layout: { x: 28, y: 11, w: 14, h: 5 } },
    { id: 'tr7q9hx', type: 'station', name: 'SomaFM Groove Salad (HLS FLAC)', streamUrl: 'https://hls.somafm.com/hls/groovesalad/FLAC/program.m3u8', layout: { x: 58, y: 5, w: 11, h: 3 } },
  ],
};
