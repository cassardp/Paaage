import { useState, useCallback, useRef, useEffect } from 'react';
import type { Config, Block, BlockLayout, TodoItem, LinkItem } from '../types/config';
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

// Helper générique pour mettre à jour un champ d'un bloc spécifique
function updateBlockInConfig<T extends Block>(
  config: Config,
  blockId: string,
  blockType: T['type'],
  updater: (block: T) => Partial<T>
): Config {
  return {
    ...config,
    desktops: config.desktops.map(desktop => ({
      ...desktop,
      blocks: desktop.blocks.map((block) => {
        if (block.id === blockId && block.type === blockType) {
          return { ...block, ...updater(block as T) };
        }
        return block;
      }),
    })),
  };
}

export function useConfig() {
  const [rawConfig, setRawConfig, { loading: isLoading, syncing, syncId }] = useCloudStorage();

  // Migrer la config si nécessaire
  const migratedConfig = migrateToDesktops(rawConfig);
  
  // currentDesktopId est géré localement (toujours démarrer sur le premier desktop)
  const [currentDesktopId, setCurrentDesktopId] = useState<string>(
    migratedConfig.desktops[0]?.id || 'main'
  );

  // S'assurer que currentDesktopId existe dans les desktops
  const isCurrentIdValid = migratedConfig.desktops.some(d => d.id === currentDesktopId);
  const validCurrentId = isCurrentIdValid ? currentDesktopId : migratedConfig.desktops[0]?.id || 'main';

  // Synchroniser currentDesktopId seulement s'il n'existe plus dans les desktops
  useEffect(() => {
    if (!isCurrentIdValid) {
      setCurrentDesktopId(migratedConfig.desktops[0]?.id || 'main');
    }
  }, [isCurrentIdValid, migratedConfig.desktops]);

  // Config combinée avec currentDesktopId local
  const config: Config = { ...migratedConfig, currentDesktopId: validCurrentId };

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
      };
    });
    // Basculer vers le nouveau desktop (local seulement)
    setCurrentDesktopId(id);
  }, [updateConfig]);

  const switchDesktop = useCallback((desktopId: string) => {
    // Mettre à jour currentDesktopId localement (pas de sync cloud)
    setCurrentDesktopId(desktopId);

    // Vérifier s'il y a des desktops vides à nettoyer AVANT d'appeler setRawConfig
    const nonEmptyDesktops = migratedConfig.desktops.filter(d =>
      d.blocks.length > 0 || d.id === desktopId || migratedConfig.desktops.length === 1
    );

    // Ne déclencher la sync que si des desktops doivent être supprimés
    if (nonEmptyDesktops.length < migratedConfig.desktops.length) {
      setRawConfig((prev) => {
        const migratedPrev = migrateToDesktops(prev);
        const finalDesktops = migratedPrev.desktops.filter(d =>
          d.blocks.length > 0 || d.id === desktopId || migratedPrev.desktops.length === 1
        );
        return {
          ...migratedPrev,
          desktops: finalDesktops.length > 0 ? finalDesktops : migratedPrev.desktops,
        };
      });
    }
  }, [setRawConfig, migratedConfig.desktops]);

  // === Gestion des blocs (opèrent sur le desktop actif) ===

  // Helper pour ajouter un bloc au desktop actif
  const addBlockToCurrentDesktop = useCallback((block: Block) => {
    updateConfig((prev) => ({
      ...prev,
      desktops: prev.desktops.map(desktop =>
        desktop.id === validCurrentId
          ? { ...desktop, blocks: [...desktop.blocks, block] }
          : desktop
      ),
    }));
  }, [updateConfig, validCurrentId]);

  // Déplacer un bloc sur la grille (et le mettre au premier plan)
  const moveBlock = useCallback((blockId: string, layout: BlockLayout) => {
    updateConfig((prev) => ({
      ...prev,
      desktops: prev.desktops.map(desktop => {
        if (desktop.id !== validCurrentId) return desktop;
        const block = desktop.blocks.find((b) => b.id === blockId);
        if (!block) return desktop;
        const others = desktop.blocks.filter((b) => b.id !== blockId);
        return { ...desktop, blocks: [...others, { ...block, layout }] };
      }),
    }));
  }, [updateConfig, validCurrentId]);

  // Déplacer un bloc vers un autre desktop
  const moveBlockToDesktop = useCallback((blockId: string, sourceDesktopId: string, targetDesktopId: string, layout: BlockLayout) => {
    updateConfig((prev) => {
      // Trouver le bloc dans le desktop source
      const sourceDesktop = prev.desktops.find(d => d.id === sourceDesktopId);
      const block = sourceDesktop?.blocks.find(b => b.id === blockId);
      if (!block) return prev;

      return {
        ...prev,
        desktops: prev.desktops.map(desktop => {
          if (desktop.id === sourceDesktopId) {
            // Retirer le bloc du desktop source
            return { ...desktop, blocks: desktop.blocks.filter(b => b.id !== blockId) };
          }
          if (desktop.id === targetDesktopId) {
            // Ajouter le bloc au desktop cible avec la nouvelle position
            return { ...desktop, blocks: [...desktop.blocks, { ...block, layout }] };
          }
          return desktop;
        }),
      };
    });
  }, [updateConfig]);

  // Supprimer un bloc
  const deleteBlock = useCallback((blockId: string) => {
    updateConfig((prev) => ({
      ...prev,
      desktops: prev.desktops.map(desktop =>
        desktop.id === validCurrentId
          ? { ...desktop, blocks: desktop.blocks.filter((block) => block.id !== blockId) }
          : desktop
      ),
    }));
  }, [updateConfig, validCurrentId]);

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

    addBlockToCurrentDesktop(newBlock);
  }, [addBlockToCurrentDesktop]);

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

    addBlockToCurrentDesktop(newBlock);
  }, [addBlockToCurrentDesktop]);

  // Ajouter une note simple
  const addSingleNote = useCallback((content: string, source?: 'ios' | 'web'): string => {
    const id = generateId();
    const pos = getCenteredPosition(20, 10);
    const newBlock: Block = {
      id,
      type: 'note',
      content,
      layout: { ...pos, w: 20, h: 10 },
      ...(source && { source })
    };

    addBlockToCurrentDesktop(newBlock);
    return id;
  }, [addBlockToCurrentDesktop]);

  // Mettre à jour une note
  const updateNote = useCallback((blockId: string, content: string) => {
    updateConfig((prev) => updateBlockInConfig(prev, blockId, 'note', () => ({ content })));
  }, [updateConfig]);

  // Mettre à jour le titre d'une note
  const updateNoteTitle = useCallback((blockId: string, title: string) => {
    updateConfig((prev) => updateBlockInConfig(prev, blockId, 'note', () => ({ title })));
  }, [updateConfig]);

  // Mettre à jour une todo
  const updateTodo = useCallback((blockId: string, items: TodoItem[]) => {
    updateConfig((prev) => updateBlockInConfig(prev, blockId, 'todo', () => ({ items })));
  }, [updateConfig]);

  // Mettre à jour le titre d'une todo
  const updateTodoTitle = useCallback((blockId: string, title: string) => {
    updateConfig((prev) => updateBlockInConfig(prev, blockId, 'todo', () => ({ title })));
  }, [updateConfig]);

  // Mettre à jour la ville d'un bloc météo
  const updateWeatherCity = useCallback((blockId: string, city: string) => {
    updateConfig((prev) => updateBlockInConfig(prev, blockId, 'weather', () => ({ city })));
  }, [updateConfig]);

  // Mettre à jour la ville d'un bloc horloge
  const updateClockCity = useCallback((blockId: string, city: string, timezone: string) => {
    updateConfig((prev) => updateBlockInConfig(prev, blockId, 'clock', () => ({ city, timezone })));
  }, [updateConfig]);

  // Mettre à jour le symbole d'un bloc stock
  const updateStockSymbol = useCallback((blockId: string, symbol: string) => {
    updateConfig((prev) => updateBlockInConfig(prev, blockId, 'stock', () => ({ symbol })));
  }, [updateConfig]);

  // Mettre à jour l'URL d'une station
  const updateStationUrl = useCallback((blockId: string, name: string, streamUrl: string) => {
    updateConfig((prev) => updateBlockInConfig(prev, blockId, 'station', () => ({ name, streamUrl })));
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

    addBlockToCurrentDesktop(newBlock);
  }, [addBlockToCurrentDesktop]);

  // Ajouter une station (FIP par défaut)
  const addStation = useCallback(() => {
    const id = generateId();
    const pos = getCenteredPosition(12, 3);
    const newBlock: Block = {
      id,
      type: 'station',
      name: 'FIP',
      streamUrl: 'https://icecast.radiofrance.fr/fip-midfi.mp3',
      layout: { ...pos, w: 12, h: 3 }
    };

    addBlockToCurrentDesktop(newBlock);
  }, [addBlockToCurrentDesktop]);

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

    addBlockToCurrentDesktop(newBlock);
  }, [addBlockToCurrentDesktop]);

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

    addBlockToCurrentDesktop(newBlock);
  }, [addBlockToCurrentDesktop]);

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

    addBlockToCurrentDesktop(newBlock);
  }, [addBlockToCurrentDesktop]);

  // Mettre à jour l'URL d'un flux RSS
  const updateRssFeedUrl = useCallback((blockId: string, feedUrl: string) => {
    updateConfig((prev) => updateBlockInConfig(prev, blockId, 'rss', () => ({ feedUrl })));
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

    addBlockToCurrentDesktop(newBlock);
  }, [addBlockToCurrentDesktop]);

  // Toggle bloc settings (ajoute ou supprime)
  const addSettings = useCallback(() => {
    updateConfig((prev) => {
      const currentDesktop = prev.desktops.find(d => d.id === validCurrentId);
      const existingSettings = currentDesktop?.blocks.find(b => b.type === 'settings');

      if (existingSettings) {
        // Supprimer le bloc settings
        return {
          ...prev,
          desktops: prev.desktops.map(desktop =>
            desktop.id === validCurrentId
              ? { ...desktop, blocks: desktop.blocks.filter(b => b.type !== 'settings') }
              : desktop
          ),
        };
      } else {
        // Ajouter le bloc settings
        const id = generateId();
        const pos = getCenteredPosition(19, 30);
        const newBlock: Block = {
          id,
          type: 'settings',
          layout: { ...pos, w: 19, h: 30 }
        };
        return {
          ...prev,
          desktops: prev.desktops.map(desktop =>
            desktop.id === validCurrentId
              ? { ...desktop, blocks: [...desktop.blocks, newBlock] }
              : desktop
          ),
        };
      }
    });
  }, [updateConfig, validCurrentId]);

  // Mettre à jour les liens d'un bloc links
  const updateLinks = useCallback((blockId: string, items: LinkItem[]) => {
    updateConfig((prev) => updateBlockInConfig(prev, blockId, 'links', () => ({ items })));
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

  // Grid Lines
  const toggleGridLines = useCallback(() => {
    updateConfig((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        hideGridLines: !prev.settings.hideGridLines,
      },
    }));
  }, [updateConfig]);

  return {
    config,
    isLoading,
    syncing,
    syncId,
    setConfig,
    getCurrentDesktop,
    addDesktop,
    switchDesktop,
    moveBlock,
    moveBlockToDesktop,
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
    addSettings,
    toggleTheme,
    toggleLinkTarget,
    toggleGridLines,
    undo,
    canUndo: historyRef.current.length > 0,
  };
}
