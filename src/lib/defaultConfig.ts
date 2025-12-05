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
    { id: 'yrnxsch', type: 'note', content: 'Bienvenue sur Paaage.app !!\n\nVous pouvez ajouter, déplacer, supprimer des blocs, et créer votre propre page de démarrage. ', layout: { x: 29, y: 7, w: 21, h: 9 } },
    { id: 'k0nmq2x', type: 'note', content: 'Shift L  -> locker\nShift M -> masquer\nShift U  -> undo', layout: { x: 37, y: 18, w: 12, h: 6 } },
    { id: '52p4xxg', type: 'note', content: 'Tapez / pour afficher un menu d\'ajout.', layout: { x: 47, y: 14, w: 12, h: 5 } },
    { id: 'fohf9ph', type: 'note', content: 'Humm... c\'est très intéressant ! \n\nhttps://www.youtube.com/watch?v=xvFZjo5PgG0', layout: { x: 55, y: 29, w: 20, h: 8 } },
  ],
};
