import { useState, useEffect, useCallback } from 'react';
import type { Config, Block, BlockLayout, TodoItem } from '../types/config';
import { loadConfig, saveConfig, fetchRemoteConfig, mergeWithRemote } from '../lib/storage';
import { generateId } from '../lib/utils';
import { CELL_SIZE } from '../lib/defaultConfig';

// Calcule une position centrée pour un bloc
function getCenteredPosition(w: number, h: number): { x: number; y: number } {
  const cols = Math.floor(window.innerWidth / CELL_SIZE);
  const rows = Math.floor(window.innerHeight / CELL_SIZE);
  return {
    x: Math.max(1, Math.floor((cols - w) / 2)),
    y: Math.max(1, Math.floor((rows - h) / 2)),
  };
}

export function useConfig() {
  const [config, setConfig] = useState<Config>(() => loadConfig());
  const [isLoading, setIsLoading] = useState(true);

  // Sync avec Val.town au démarrage
  useEffect(() => {
    fetchRemoteConfig().then((remote) => {
      if (remote) {
        setConfig((current) => mergeWithRemote(current, remote));
      }
      setIsLoading(false);
    });
  }, []);

  const updateConfig = useCallback((updater: (prev: Config) => Config) => {
    setConfig((prev) => {
      const next = updater(prev);
      saveConfig(next);
      return next;
    });
  }, []);

  // Déplacer un bloc sur la grille (et le mettre au premier plan)
  const moveBlock = useCallback((blockId: string, layout: BlockLayout) => {
    updateConfig((prev) => {
      const block = prev.blocks.find((b) => b.id === blockId);
      if (!block) return prev;
      const others = prev.blocks.filter((b) => b.id !== blockId);
      return {
        ...prev,
        blocks: [...others, { ...block, layout }],
      };
    });
  }, [updateConfig]);

  // Supprimer un bloc
  const deleteBlock = useCallback((blockId: string) => {
    updateConfig((prev) => ({
      ...prev,
      blocks: prev.blocks.filter((block) => block.id !== blockId),
    }));
  }, [updateConfig]);

  // Ajouter un bloc
  const addBlock = useCallback((type: 'search' | 'weather') => {
    const id = generateId();
    
    let newBlock: Block;
    switch (type) {
      case 'search': {
        const pos = getCenteredPosition(20, 3);
        newBlock = { id, type: 'search', layout: { ...pos, w: 20, h: 3 } };
        break;
      }
      case 'weather': {
        const pos = getCenteredPosition(15, 4);
        newBlock = { id, type: 'weather', city: 'Toulon', layout: { ...pos, w: 15, h: 4 } };
        break;
      }
    }

    updateConfig((prev) => ({
      ...prev,
      blocks: [...prev.blocks, newBlock],
    }));
  }, [updateConfig]);

  // Ajouter un bookmark
  const addBookmark = useCallback((label: string, url: string) => {
    const id = generateId();
    const pos = getCenteredPosition(10, 3);
    const newBlock: Block = { 
      id, 
      type: 'bookmark', 
      label, 
      url, 
      layout: { ...pos, w: 10, h: 3 } 
    };

    updateConfig((prev) => ({
      ...prev,
      blocks: [...prev.blocks, newBlock],
    }));
  }, [updateConfig]);

  // Ajouter une note simple
  const addSingleNote = useCallback((content: string): string => {
    const id = generateId();
    const pos = getCenteredPosition(15, 4);
    const newBlock: Block = { 
      id, 
      type: 'note', 
      content, 
      layout: { ...pos, w: 15, h: 4 } 
    };

    updateConfig((prev) => ({
      ...prev,
      blocks: [...prev.blocks, newBlock],
    }));
    return id;
  }, [updateConfig]);

  // Mettre à jour une note
  const updateNote = useCallback((blockId: string, content: string) => {
    updateConfig((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) => {
        if (block.id === blockId && block.type === 'note') {
          return { ...block, content };
        }
        return block;
      }),
    }));
  }, [updateConfig]);

  // Mettre à jour une todo
  const updateTodo = useCallback((blockId: string, items: TodoItem[]) => {
    updateConfig((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) => {
        if (block.id === blockId && block.type === 'todo') {
          return { ...block, items };
        }
        return block;
      }),
    }));
  }, [updateConfig]);

  // Ajouter une todo
  const addTodo = useCallback(() => {
    const id = generateId();
    const pos = getCenteredPosition(15, 6);
    const newBlock: Block = { 
      id, 
      type: 'todo', 
      items: [],
      layout: { ...pos, w: 15, h: 6 } 
    };

    updateConfig((prev) => ({
      ...prev,
      blocks: [...prev.blocks, newBlock],
    }));
  }, [updateConfig]);

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

    updateConfig((prev) => ({
      ...prev,
      blocks: [...prev.blocks, newBlock],
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
      layout: { ...pos, w: 12, h: 4 } 
    };

    updateConfig((prev) => ({
      ...prev,
      blocks: [...prev.blocks, newBlock],
    }));
  }, [updateConfig]);

  // Ajouter une horloge
  const addClock = useCallback(() => {
    const id = generateId();
    const pos = getCenteredPosition(8, 5);
    const newBlock: Block = { 
      id, 
      type: 'clock',
      city: 'Paris',
      timezone: 'Europe/Paris',
      layout: { ...pos, w: 8, h: 5 } 
    };

    updateConfig((prev) => ({
      ...prev,
      blocks: [...prev.blocks, newBlock],
    }));
  }, [updateConfig]);

  // Radio
  const selectStation = useCallback((blockId: string, stationId: string | null) => {
    updateConfig((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) => {
        if (block.id === blockId && block.type === 'radio') {
          return { ...block, currentStationId: stationId ?? undefined };
        }
        return block;
      }),
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

  return {
    config,
    isLoading,
    setConfig,
    updateConfig,
    moveBlock,
    deleteBlock,
    addBlock,
    addBookmark,
    addSingleNote,
    updateNote,
    addTodo,
    updateTodo,
    addStation,
    addStock,
    addClock,
    selectStation,
    toggleTheme,
  };
}
