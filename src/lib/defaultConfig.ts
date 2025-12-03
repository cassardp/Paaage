import type { Config } from '../types/config';

// Configuration de la grille (cellules de 20x20px)
export const CELL_SIZE = 20; // px - taille d'une cellule
export const GRID_COLS = 60; // nombre de colonnes (1200px de large)
export const GRID_ROWS = 40; // nombre de lignes (800px de haut)

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
      layout: { x: 1, y: 1, w: 58, h: 3 }, // Pleine largeur - 1 marge de chaque côté (60px haut)
    },
    {
      id: 'links-1',
      type: 'links',
      title: 'Favoris',
      links: [
        { id: 'l1', label: 'GitHub', url: 'https://github.com' },
        { id: 'l2', label: 'Twitter', url: 'https://twitter.com' },
        { id: 'l3', label: 'YouTube', url: 'https://youtube.com' },
        { id: 'l4', label: 'Reddit', url: 'https://reddit.com' },
        { id: 'l5', label: 'HN', url: 'https://news.ycombinator.com' },
        { id: 'l6', label: 'Gmail', url: 'https://mail.google.com' },
      ],
      layout: { x: 1, y: 5, w: 28, h: 12 }, // Demi largeur gauche (560x240px)
    },
    {
      id: 'notes-1',
      type: 'notes',
      title: 'Notes',
      items: [
        { id: 'n1', content: 'Bienvenue sur Paaage ! 🎉', createdAt: new Date().toISOString() },
      ],
      layout: { x: 30, y: 5, w: 29, h: 12 }, // Demi largeur droite
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
        { id: 'r5', name: 'France Musique', streamUrl: 'https://icecast.radiofrance.fr/francemusique-midfi.mp3' },
        { id: 'r6', name: 'Mouv\'', streamUrl: 'https://icecast.radiofrance.fr/mouv-midfi.mp3' },
      ],
      layout: { x: 1, y: 18, w: 28, h: 12 },
    },
  ],
};
