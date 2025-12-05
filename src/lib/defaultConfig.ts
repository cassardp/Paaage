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
    { id: '5recnq5', type: 'weather', city: 'Toulon', layout: { x: 76, y: 5, w: 16, h: 5 } },
    { id: 'c70yopu', type: 'weather', city: 'Lyon', layout: { x: 76, y: 11, w: 16, h: 5 } },
    { id: 'or8jnb1', type: 'bookmark', label: 'ChatGPT', url: 'https://chatgpt.com', layout: { x: 7, y: 1, w: 7, h: 2 } },
    { id: 'mk2ndja', type: 'bookmark', label: 'Vercel', url: 'https://vercel.com', layout: { x: 15, y: 1, w: 7, h: 2 } },
    { id: 'qpes2wx', type: 'bookmark', label: 'AI Studio', url: 'https://aistudio.google.com', layout: { x: 23, y: 1, w: 7, h: 2 } },
    { id: '68i6d6q', type: 'bookmark', label: 'Github', url: 'https://github.com', layout: { x: 31, y: 1, w: 7, h: 2 } },
    { id: 'x0fhynr', type: 'bookmark', label: 'Twitter', url: 'https://x.com/home', layout: { x: 39, y: 1, w: 7, h: 2 } },
    { id: '3kv5jas', type: 'bookmark', label: 'Youtube', url: 'https://www.youtube.com/feed/subscriptions', layout: { x: 47, y: 1, w: 7, h: 2 } },
    { id: 'ugay8eh', type: 'bookmark', label: 'Maps', url: 'https://www.google.com/maps', layout: { x: 55, y: 1, w: 7, h: 2 } },
    { id: 'apswrdp', type: 'bookmark', label: 'Sketchup', url: 'https://app.sketchup.com/app?hl=en', layout: { x: 63, y: 1, w: 7, h: 2 } },
    { id: 'tcbbded', type: 'bookmark', label: 'Budget', url: 'https://budget-ruby-zeta.vercel.app', layout: { x: 71, y: 1, w: 7, h: 2 } },
    { id: 'ldnk5ia', type: 'bookmark', label: 'Domains', url: 'https://vercel.com/domains', layout: { x: 79, y: 1, w: 7, h: 2 } },
    { id: '5mbmg3e', type: 'clock', city: 'San Francisco', timezone: 'America/Los_Angeles', layout: { x: 2, y: 5, w: 9, h: 6 } },
    { id: 'e50vsl2', type: 'search', layout: { x: 27, y: 22, w: 40, h: 4 } },
    { id: 'tj5g1v4', type: 'station', name: 'Radio Classique', streamUrl: 'https://str0.creacast.com/classique1', layout: { x: 76, y: 47, w: 16, h: 4 } },
    { id: '531hyko', type: 'station', name: 'FIP', streamUrl: 'https://icecast.radiofrance.fr/fip-midfi.mp3', layout: { x: 76, y: 42, w: 16, h: 4 } },
    { id: 'xlvm0hv', type: 'news', layout: { x: 76, y: 18, w: 16, h: 22 } },
    { id: 'tss2dwv', type: 'stock', symbol: 'AAPL', layout: { x: 24, y: 31, w: 14, h: 5 } },
    {
      id: 'w4mf04k',
      type: 'todo',
      items: [
        { id: 'mk93jis', text: 'App Mobile', done: false },
        { id: 'vkip91e', text: 'Blocs responsives', done: false },
        { id: 'hydeuxq', text: 'Grille 16x16', done: true },
        { id: 'fj766s0', text: 'Bloc Info', done: true },
        { id: 'f2lig85', text: 'Barre de liens avec import ?', done: false },
        { id: 'x3zqnkj', text: 'RSS ?', done: false },
        { id: '2rcvgcp', text: 'Sélecteur pour le choix de ville', done: false },
        { id: 'qbpvc2v', text: 'Agrandissement auto des notes', done: false },
        { id: 'r78s0i0', text: 'Unifier les couleurs', done: false },
        { id: 'oh63rcb', text: 'Alignement du check sur la ligne 1 quand plusieurs lignes', done: true },
        { id: '2qqgllw', text: 'Sauvegarde pendant l\'écriture des notes', done: true },
        { id: 'ytbo5j7', text: 'Undo (menu settings)', done: true },
        { id: 'jrhima3', text: 'Raccourcis clavier', done: true },
      ],
      layout: { x: 2, y: 13, w: 20, h: 38 },
    },
    { id: '1t6dp32', type: 'note', content: '', layout: { x: 17, y: 38, w: 21, h: 9 } },
    { id: 'k0nmq2x', type: 'note', content: 'Shift L  -> locker\nShift M -> masquer\nShift U  -> undo', layout: { x: 42, y: 42, w: 12, h: 6 } },
    { id: 'fohf9ph', type: 'note', content: 'Humm... c\'est très intéressant ! \n\nhttps://www.youtube.com/watch?v=xvFZjo5PgG0', layout: { x: 51, y: 35, w: 20, h: 8 } },
    { id: 'yrnxsch', type: 'note', content: 'Bienvenue sur Paaage.app !!\n\nVous pouvez ajouter, déplacer, supprimer des blocs, et créer votre propre page de démarrage. ', layout: { x: 30, y: 7, w: 20, h: 9 } },
    { id: '52p4xxg', type: 'note', content: 'Tapez / pour afficher un menu d\'ajout.', layout: { x: 47, y: 14, w: 12, h: 5 } },
  ],
};
