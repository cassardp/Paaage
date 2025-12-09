import { useCallback, useRef } from 'react';
import type { Config, Block, BlockLayout, TodoItem, LinkItem, Desktop } from '../types/config';
import { useCloudStorage } from './useCloudStorage';
import { generateId } from '../lib/utils';
import { CELL_SIZE } from '../lib/defaultConfig';

// Migrer une ancienne config vers le nouveau format avec desktops
function migrateToDesktops(config: Config): Config {
  // Si la config a déjà des desktops, pas besoin de migrer
  if (config.desktops && config.desktops.length > 0) {
    return config;
  }

  // Si la config a des blocks (ancien format), les migrer vers un desktop
  if (config.blocks && config.blocks.length > 0) {
    return {
      ...config,
      currentDesktopId: 'main',
      desktops: [
        {
          id: 'main',
          name: 'Main',
          blocks: config.blocks,
        },
      ],
      blocks: undefined, // Supprimer l'ancien champ
    };
  }

  // Config vide, créer un desktop par défaut
  return {
    ...config,
    currentDesktopId: 'main',
    desktops: [
      {
        id: 'main',
        name: 'Main',
        blocks: [],
      },
    ],
  };
}

// Calcule une position centrée pour un bloc
function getCenteredPosition(w: number, h: number): { x: number; y: number } {
  const cols = Math.floor(window.innerWidth / CELL_SIZE);
  const rows = Math.floor(window.innerHeight / CELL_SIZE);
  return {
    x: Math.max(1, Math.floor((cols - w) / 2)),
    y: Math.max(1, Math.floor((rows - h) / 2)),
  };
}

const MAX_HISTORY = 20;

export function useConfig() {
  const [rawConfig, setRawConfig, { loading: isLoading, syncing, syncId }] = useCloudStorage();

  // Migrer la config si nécessaire
  const config = migrateToDesktops(rawConfig);
  const setConfig = useCallback((updater: Config | ((prev: Config) => Config)) => {
    setRawConfig((prev) => {
      const migratedPrev = migrateToDesktops(prev);
      const newConfig = typeof updater === 'function' ? updater(migratedPrev) : updater;
      return migrateToDesktops(newConfig);
    });
  }, [setRawConfig]);

  const historyRef = useRef<Config[]>([]);
  const isUndoing = useRef(false);

  // Helper pour obtenir le desktop actif
  const getCurrentDesktop = useCallback(() => {
    return config.desktops.find(d => d.id === config.currentDesktopId) || config.desktops[0];
  }, [config]);

  const updateConfig = useCallback((updater: (prev: Config) => Config) => {
    setConfig((prev) => {
      // Sauvegarder l'état précédent dans l'historique (sauf si on fait un undo)
      if (!isUndoing.current && prev) {
        historyRef.current = [...historyRef.current.slice(-MAX_HISTORY + 1), prev];
      }
      isUndoing.current = false;
      return updater(prev);
    });
  }, [setConfig]);

  const undo = useCallback(() => {
    if (historyRef.current.length === 0) return;
    const previousConfig = historyRef.current.pop();
    if (previousConfig) {
      isUndoing.current = true;
      setConfig(() => previousConfig);
    }
  }, [setConfig]);

  // === Gestion des desktops ===

  const addDesktop = useCallback(() => {
    const id = generateId();
    updateConfig((prev) => {
      const name = `Desktop ${prev.desktops.length + 1}`;
      return {
        ...prev,
        desktops: [...prev.desktops, { id, name, blocks: [] }],
        currentDesktopId: id, // Basculer vers le nouveau desktop
      };
    });
  }, [updateConfig]);

  const deleteDesktop = useCallback((desktopId: string) => {
    updateConfig((prev) => {
      // Ne pas supprimer s'il n'y a qu'un seul desktop
      if (prev.desktops.length <= 1) return prev;

      const newDesktops = prev.desktops.filter(d => d.id !== desktopId);
      const newCurrentId = prev.currentDesktopId === desktopId
        ? newDesktops[0].id
        : prev.currentDesktopId;

      return {
        ...prev,
        desktops: newDesktops,
        currentDesktopId: newCurrentId,
      };
    });
  }, [updateConfig]);

  const switchDesktop = useCallback((desktopId: string) => {
    updateConfig((prev) => {
      // Nettoyer les desktops vides (sauf si c'est le seul)
      const nonEmptyDesktops = prev.desktops.filter(d =>
        d.blocks.length > 0 || d.id === desktopId || prev.desktops.length === 1
      );

      // S'assurer qu'il reste au moins un desktop
      const finalDesktops = nonEmptyDesktops.length > 0 ? nonEmptyDesktops : prev.desktops;

      return {
        ...prev,
        desktops: finalDesktops,
        currentDesktopId: desktopId,
      };
    });
  }, [updateConfig]);

  const renameDesktop = useCallback((desktopId: string, name: string) => {
    updateConfig((prev) => ({
      ...prev,
      desktops: prev.desktops.map(d =>
        d.id === desktopId ? { ...d, name } : d
      ),
    }));
  }, [updateConfig]);

  // === Gestion des blocs (opèrent sur le desktop actif) ===


  // Déplacer un bloc sur la grille (et le mettre au premier plan)
  const moveBlock = useCallback((blockId: string, layout: BlockLayout) => {
    updateConfig((prev) => ({
      ...prev,
      desktops: prev.desktops.map(desktop => {
        if (desktop.id !== prev.currentDesktopId) return desktop;
        const block = desktop.blocks.find((b) => b.id === blockId);
        if (!block) return desktop;
        const others = desktop.blocks.filter((b) => b.id !== blockId);
        return { ...desktop, blocks: [...others, { ...block, layout }] };
      }),
    }));
  }, [updateConfig]);

  // Supprimer un bloc
  const deleteBlock = useCallback((blockId: string) => {
    updateConfig((prev) => ({
      ...prev,
      desktops: prev.desktops.map(desktop =>
        desktop.id === prev.currentDesktopId
          ? { ...desktop, blocks: desktop.blocks.filter((block) => block.id !== blockId) }
          : desktop
      ),
    }));
  }, [updateConfig]);

  // Ajouter un bloc
  const addBlock = useCallback((type: 'search' | 'weather') => {
    const id = generateId();

    let newBlock: Block;
    switch (type) {
      case 'search': {
        const pos = getCenteredPosition(40, 4);
        newBlock = { id, type: 'search', layout: { ...pos, w: 40, h: 4 } };
        break;
      }
      case 'weather': {
        const pos = getCenteredPosition(15, 5);
        newBlock = { id, type: 'weather', city: 'Toulon', layout: { ...pos, w: 15, h: 5 } };
        break;
      }
    }

    updateConfig((prev) => ({
      ...prev,
      desktops: prev.desktops.map(desktop =>
        desktop.id === prev.currentDesktopId
          ? { ...desktop, blocks: [...desktop.blocks, newBlock] }
          : desktop
      ),
    }));
  }, [updateConfig]);

  // Ajouter un bookmark
  const addBookmark = useCallback((label: string, url: string) => {
    const id = generateId();
    const pos = getCenteredPosition(7, 3);
    const newBlock: Block = {
      id,
      type: 'bookmark',
      label,
      url,
      layout: { ...pos, w: 7, h: 2 }
    };

    updateConfig((prev) => ({
      ...prev,
      desktops: prev.desktops.map(desktop =>
        desktop.id === prev.currentDesktopId
          ? { ...desktop, blocks: [...desktop.blocks, newBlock] }
          : desktop
      ),
    }));
  }, [updateConfig]);

  // Ajouter une note simple
  const addSingleNote = useCallback((content: string): string => {
    const id = generateId();
    const pos = getCenteredPosition(20, 10);
    const newBlock: Block = {
      id,
      type: 'note',
      content,
      layout: { ...pos, w: 20, h: 10 }
    };

    updateConfig((prev) => ({
      ...prev,
      desktops: prev.desktops.map(desktop =>
        desktop.id === prev.currentDesktopId
          ? { ...desktop, blocks: [...desktop.blocks, newBlock] }
          : desktop
      ),
    }));
    return id;
  }, [updateConfig]);

  // Mettre à jour une note
  const updateNote = useCallback((blockId: string, content: string) => {
    updateConfig((prev) => ({
      ...prev,
      desktops: prev.desktops.map(desktop => ({
        ...desktop,
        blocks: desktop.blocks.map((block) => {
          if (block.id === blockId && block.type === 'note') {
            return { ...block, content };
          }
          return block;
        }),
      })),
    }));
  }, [updateConfig]);

  // Mettre à jour le titre d'une note
  const updateNoteTitle = useCallback((blockId: string, title: string) => {
    updateConfig((prev) => ({
      ...prev,
      desktops: prev.desktops.map(desktop => ({
        ...desktop,
        blocks: desktop.blocks.map((block) => {
          if (block.id === blockId && block.type === 'note') {
            return { ...block, title };
          }
          return block;
        }),
      })),
    }));
  }, [updateConfig]);

  // Mettre à jour une todo
  const updateTodo = useCallback((blockId: string, items: TodoItem[]) => {
    updateConfig((prev) => ({
      ...prev,
      desktops: prev.desktops.map(desktop => ({
        ...desktop,
        blocks: desktop.blocks.map((block) => {
          if (block.id === blockId && block.type === 'todo') {
            return { ...block, items };
          }
          return block;
        }),
      })),
    }));
  }, [updateConfig]);

  // Mettre à jour le titre d'une todo
  const updateTodoTitle = useCallback((blockId: string, title: string) => {
    updateConfig((prev) => ({
      ...prev,
      desktops: prev.desktops.map(desktop => ({
        ...desktop,
        blocks: desktop.blocks.map((block) => {
          if (block.id === blockId && block.type === 'todo') {
            return { ...block, title };
          }
          return block;
        }),
      })),
    }));
  }, [updateConfig]);

  // Mettre à jour la ville d'un bloc météo
  const updateWeatherCity = useCallback((blockId: string, city: string) => {
    updateConfig((prev) => ({
      ...prev,
      desktops: prev.desktops.map(desktop => ({
        ...desktop,
        blocks: desktop.blocks.map((block) => {
          if (block.id === blockId && block.type === 'weather') {
            return { ...block, city };
          }
          return block;
        }),
      })),
    }));
  }, [updateConfig]);

  // Mettre à jour la ville d'un bloc horloge
  const updateClockCity = useCallback((blockId: string, city: string, timezone: string) => {
    updateConfig((prev) => ({
      ...prev,
      desktops: prev.desktops.map(desktop => ({
        ...desktop,
        blocks: desktop.blocks.map((block) => {
          if (block.id === blockId && block.type === 'clock') {
            return { ...block, city, timezone };
          }
          return block;
        }),
      })),
    }));
  }, [updateConfig]);

  // Mettre à jour le symbole d'un bloc stock
  const updateStockSymbol = useCallback((blockId: string, symbol: string) => {
    updateConfig((prev) => ({
      ...prev,
      desktops: prev.desktops.map(desktop => ({
        ...desktop,
        blocks: desktop.blocks.map((block) => {
          if (block.id === blockId && block.type === 'stock') {
            return { ...block, symbol };
          }
          return block;
        }),
      })),
    }));
  }, [updateConfig]);

  // Mettre à jour l'URL d'une station
  const updateStationUrl = useCallback((blockId: string, name: string, streamUrl: string) => {
    updateConfig((prev) => ({
      ...prev,
      desktops: prev.desktops.map(desktop => ({
        ...desktop,
        blocks: desktop.blocks.map((block) => {
          if (block.id === blockId && block.type === 'station') {
            return { ...block, name, streamUrl };
          }
          return block;
        }),
      })),
    }));
  }, [updateConfig]);

  // Ajouter une todo
  const addTodo = useCallback(() => {
    const id = generateId();
    const pos = getCenteredPosition(15, 20);
    const newBlock: Block = {
      id,
      type: 'todo',
      items: [],
      layout: { ...pos, w: 15, h: 20 }
    };

    updateConfig((prev) => ({
      ...prev,
      desktops: prev.desktops.map(desktop =>
        desktop.id === prev.currentDesktopId
          ? { ...desktop, blocks: [...desktop.blocks, newBlock] }
          : desktop
      ),
    }));
  }, [updateConfig]);

  // Ajouter une station (FIP par défaut)
  const addStation = useCallback(() => {
    const id = generateId();
    const pos = getCenteredPosition(12, 4);
    const newBlock: Block = {
      id,
      type: 'station',
      name: 'FIP',
      streamUrl: 'https://icecast.radiofrance.fr/fip-midfi.mp3',
      layout: { ...pos, w: 12, h: 4 }
    };

    updateConfig((prev) => ({
      ...prev,
      desktops: prev.desktops.map(desktop =>
        desktop.id === prev.currentDesktopId
          ? { ...desktop, blocks: [...desktop.blocks, newBlock] }
          : desktop
      ),
    }));
  }, [updateConfig]);

  // Ajouter un stock (Apple par défaut)
  const addStock = useCallback(() => {
    const id = generateId();
    const pos = getCenteredPosition(12, 4);
    const newBlock: Block = {
      id,
      type: 'stock',
      symbol: 'AAPL',
      layout: { ...pos, w: 14, h: 5 }
    };

    updateConfig((prev) => ({
      ...prev,
      desktops: prev.desktops.map(desktop =>
        desktop.id === prev.currentDesktopId
          ? { ...desktop, blocks: [...desktop.blocks, newBlock] }
          : desktop
      ),
    }));
  }, [updateConfig]);

  // Ajouter une horloge
  const addClock = useCallback(() => {
    const id = generateId();
    const pos = getCenteredPosition(9, 6);
    const newBlock: Block = {
      id,
      type: 'clock',
      city: 'Paris',
      timezone: 'Europe/Paris',
      layout: { ...pos, w: 9, h: 6 }
    };

    updateConfig((prev) => ({
      ...prev,
      desktops: prev.desktops.map(desktop =>
        desktop.id === prev.currentDesktopId
          ? { ...desktop, blocks: [...desktop.blocks, newBlock] }
          : desktop
      ),
    }));
  }, [updateConfig]);

  // Ajouter un bloc RSS
  const addRss = useCallback(() => {
    const id = generateId();
    const pos = getCenteredPosition(15, 20);
    const newBlock: Block = {
      id,
      type: 'rss',
      feedUrl: 'https://news.ycombinator.com/rss',
      layout: { ...pos, w: 15, h: 20 }
    };

    updateConfig((prev) => ({
      ...prev,
      desktops: prev.desktops.map(desktop =>
        desktop.id === prev.currentDesktopId
          ? { ...desktop, blocks: [...desktop.blocks, newBlock] }
          : desktop
      ),
    }));
  }, [updateConfig]);

  // Mettre à jour l'URL d'un flux RSS
  const updateRssFeedUrl = useCallback((blockId: string, feedUrl: string) => {
    updateConfig((prev) => ({
      ...prev,
      desktops: prev.desktops.map(desktop => ({
        ...desktop,
        blocks: desktop.blocks.map((block) => {
          if (block.id === blockId && block.type === 'rss') {
            return { ...block, feedUrl };
          }
          return block;
        }),
      })),
    }));
  }, [updateConfig]);

  // Ajouter un bloc links
  const addLinks = useCallback(() => {
    const id = generateId();
    const pos = getCenteredPosition(26, 3);
    const newBlock: Block = {
      id,
      type: 'links',
      items: [
        { id: generateId(), label: 'Google', url: 'https://google.com' },
        { id: generateId(), label: 'GitHub', url: 'https://github.com' },
        { id: generateId(), label: 'YouTube', url: 'https://youtube.com' },
      ],
      layout: { ...pos, w: 26, h: 3 }
    };

    updateConfig((prev) => ({
      ...prev,
      desktops: prev.desktops.map(desktop =>
        desktop.id === prev.currentDesktopId
          ? { ...desktop, blocks: [...desktop.blocks, newBlock] }
          : desktop
      ),
    }));
  }, [updateConfig]);

  // Mettre à jour les liens d'un bloc links
  const updateLinks = useCallback((blockId: string, items: LinkItem[]) => {
    updateConfig((prev) => ({
      ...prev,
      desktops: prev.desktops.map(desktop => ({
        ...desktop,
        blocks: desktop.blocks.map((block) => {
          if (block.id === blockId && block.type === 'links') {
            return { ...block, items };
          }
          return block;
        }),
      })),
    }));
  }, [updateConfig]);

  // Theme
  const toggleTheme = useCallback(() => {
    updateConfig((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        theme: prev.settings.theme === 'dark' ? 'light' : 'dark',
      },
    }));
  }, [updateConfig]);

  // Link Target
  const toggleLinkTarget = useCallback(() => {
    updateConfig((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        linkTarget: prev.settings.linkTarget === '_blank' ? '_self' : '_blank',
      },
    }));
  }, [updateConfig]);

  return {
    config,
    isLoading,
    syncing,
    syncId,
    setConfig,
    updateConfig,
    getCurrentDesktop,
    addDesktop,
    deleteDesktop,
    switchDesktop,
    renameDesktop,
    moveBlock,
    deleteBlock,
    addBlock,
    addBookmark,
    addSingleNote,
    updateNote,
    updateNoteTitle,
    addTodo,
    updateTodo,
    updateTodoTitle,
    updateWeatherCity,
    updateClockCity,
    updateStockSymbol,
    updateStationUrl,
    addStation,
    addStock,
    addClock,
    addRss,
    updateRssFeedUrl,
    addLinks,
    updateLinks,
    toggleTheme,
    toggleLinkTarget,
    undo,
    canUndo: historyRef.current.length > 0,
  };
}
