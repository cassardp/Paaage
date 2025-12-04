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
      id: 'n03j3qx',
      type: 'weather',
      city: 'Lyon',
      layout: { x: 61, y: 10, w: 12, h: 4 },
    },
    {
      id: '2a6cshz',
      type: 'news',
      layout: { x: 61, y: 15, w: 12, h: 15 },
    },
    {
      id: 'qm39xcz',
      type: 'search',
      layout: { x: 23, y: 17, w: 30, h: 3 },
    },
    {
      id: 'l7r4fpx',
      type: 'station',
      name: 'Radio Classique',
      streamUrl: 'https://str0.creacast.com/classique1',
      layout: { x: 61, y: 32, w: 12, h: 3 },
    },
    {
      id: 'station-1',
      type: 'station',
      name: 'FIP',
      streamUrl: 'https://icecast.radiofrance.fr/fip-midfi.mp3',
      layout: { x: 61, y: 36, w: 12, h: 3 },
    },
    {
      id: 'todo-1',
      type: 'todo',
      items: [
        { id: 'todo-item-1', text: 'Choix de la ville pour l\'horloge', done: true },
        { id: 'todo-item-3', text: 'Synchro Cloud sans auth', done: true },
        { id: 'todo-item-4', text: 'App mobile', done: false },
        { id: 'todo-item-5', text: 'Choix des stations', done: true },
        { id: 'todo-item-6', text: 'Bouton d\'annulation', done: true },
        { id: 'todo-item-7', text: 'Choix des stocks', done: true },
        { id: 'todo-item-8', text: 'Ville pour la météo', done: true },
        { id: '0ihoppj', text: 'Agrandissement auto des notes', done: false },
      ],
      layout: { x: 3, y: 12, w: 16, h: 24 },
    },
    {
      id: 'weather-1',
      type: 'weather',
      city: 'Toulon',
      layout: { x: 61, y: 5, w: 12, h: 4 },
    },
    {
      id: 'mqu93lg',
      type: 'clock',
      city: 'San Francisco',
      timezone: 'America/Los_Angeles',
      layout: { x: 3, y: 5, w: 8, h: 5 },
    },
    {
      id: 'bookmark-maps',
      type: 'bookmark',
      label: 'Maps',
      url: 'https://www.google.com/maps',
      layout: { x: 49, y: 1, w: 5, h: 2 },
    },
    {
      id: 'bookmark-youtube',
      type: 'bookmark',
      label: 'Youtube',
      url: 'https://www.youtube.com/feed/subscriptions',
      layout: { x: 43, y: 1, w: 5, h: 2 },
    },
    {
      id: 'bookmark-chatgpt',
      type: 'bookmark',
      label: 'ChatGPT',
      url: 'https://chatgpt.com',
      layout: { x: 37, y: 1, w: 5, h: 2 },
    },
    {
      id: 'bookmark-twitter',
      type: 'bookmark',
      label: 'Twitter',
      url: 'https://x.com/home',
      layout: { x: 31, y: 1, w: 5, h: 2 },
    },
    {
      id: 'sdpt1or',
      type: 'bookmark',
      label: 'Github',
      url: 'https://github.com/cassardp',
      layout: { x: 25, y: 1, w: 5, h: 2 },
    },
    {
      id: 'g7zer26',
      type: 'bookmark',
      label: 'Sketchup',
      url: 'https://app.sketchup.com/app?hl=en',
      layout: { x: 19, y: 1, w: 5, h: 2 },
    },
    {
      id: '0tv5fag',
      type: 'bookmark',
      label: 'Vercel',
      url: 'https://vercel.com/cassardps-projects/paaage',
      layout: { x: 13, y: 1, w: 5, h: 2 },
    },
    {
      id: 'sj40570',
      type: 'bookmark',
      label: 'Budget',
      url: 'https://budget-ruby-zeta.vercel.app',
      layout: { x: 55, y: 1, w: 6, h: 2 },
    },
    {
      id: 'vttxo7v',
      type: 'stock',
      symbol: 'AAPL',
      layout: { x: 21, y: 23, w: 12, h: 4 },
    },
    {
      id: '65y9ssm',
      type: 'note',
      content: '',
      layout: { x: 15, y: 29, w: 18, h: 11 },
    },
    {
      id: 'i680rfm',
      type: 'note',
      content: 'Sympa cette app iPhone !! ;-) \n\nhttps://apps.apple.com/us/app/woatch/id6741385536',
      layout: { x: 32, y: 31, w: 21, h: 5 },
    },
    {
      id: 'rudm8xz',
      type: 'note',
      content: 'Bienvenue sur Page.app ! \n\nVous pouvez ajouter du contenu avec le bouton "+" ou le menu / au clavier.',
      layout: { x: 33, y: 7, w: 13, h: 7 },
    },
  ],
};
