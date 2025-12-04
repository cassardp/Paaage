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
      id: 'weather-1',
      type: 'weather',
      city: 'Paris',
      layout: { x: 2, y: 2, w: 11, h: 5 },
    },
    {
      id: 'search-1',
      type: 'search',
      layout: { x: 24, y: 17, w: 28, h: 3 },
    },
    {
      id: 'clock-1',
      type: 'clock',
      city: 'Paris',
      timezone: 'Europe/Paris',
      layout: { x: 63, y: 4, w: 8, h: 5 },
    },
    {
      id: 'bookmark-maps',
      type: 'bookmark',
      label: 'Maps',
      url: 'https://www.google.com/maps',
      layout: { x: 44, y: 2, w: 5, h: 2 },
    },
    {
      id: 'bookmark-youtube',
      type: 'bookmark',
      label: 'Youtube',
      url: 'https://www.youtube.com/feed/subscriptions',
      layout: { x: 38, y: 2, w: 5, h: 2 },
    },
    {
      id: 'bookmark-chatgpt',
      type: 'bookmark',
      label: 'ChatGPT',
      url: 'https://chatgpt.com',
      layout: { x: 32, y: 2, w: 5, h: 2 },
    },
    {
      id: 'bookmark-twitter',
      type: 'bookmark',
      label: 'Twitter',
      url: 'https://x.com/home',
      layout: { x: 26, y: 2, w: 5, h: 2 },
    },
    {
      id: 'stock-1',
      type: 'stock',
      symbol: 'AAPL',
      layout: { x: 2, y: 8, w: 11, h: 4 },
    },
    {
      id: 'station-1',
      type: 'station',
      name: 'FIP',
      streamUrl: 'https://icecast.radiofrance.fr/fip-midfi.mp3',
      layout: { x: 63, y: 34, w: 7, h: 3 },
    },
    {
      id: 'note-1',
      type: 'note',
      content: 'Ne surtout pas cliquer sur ce lien !!!\n\nhttps://www.youtube.com/watch?v=dQw4w9WgXcQ',
      layout: { x: 57, y: 12, w: 14, h: 6 },
    },
    {
      id: 'todo-1',
      type: 'todo',
      items: [
        { id: 'todo-item-1', text: 'Choix de la ville pour l\'horloge', done: false },
        { id: 'todo-item-2', text: 'Refaire l\'UI du menu settings', done: false },
        { id: 'todo-item-3', text: 'Synchro Cloud sans auth', done: false },
        { id: 'todo-item-4', text: 'App mobile', done: false },
        { id: 'todo-item-5', text: 'Choix des stations', done: false },
        { id: 'todo-item-6', text: 'Bouton d\'annulation', done: false },
        { id: 'todo-item-7', text: 'Choix des stocks', done: false },
        { id: 'todo-item-8', text: 'Ville pour la météo', done: false },
        { id: 'todo-item-9', text: 'Todos', done: true },
      ],
      layout: { x: 2, y: 24, w: 15, h: 16 },
    },
    {
      id: 'note-2',
      type: 'note',
      content: 'Bienvenue sur la version alpha de Paaage !! :-)\n\n',
      layout: { x: 14, y: 30, w: 13, h: 4 },
    },
    {
      id: 'note-3',
      type: 'note',
      content: 'Hello world !',
      layout: { x: 15, y: 23, w: 7, h: 2 },
    },
  ],
};
