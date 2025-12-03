import { useState, useEffect, useCallback } from 'react';
import type { Config, Block, BlockLayout } from '../types/config';
import { loadConfig, saveConfig, fetchRemoteConfig, mergeWithRemote } from '../lib/storage';
import { generateId } from '../lib/utils';

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
    const baseLayout = { x: 1, y: 1, w: 20, h: 10 };
    
    let newBlock: Block;
    switch (type) {
      case 'search':
        newBlock = { id, type: 'search', layout: { ...baseLayout, h: 3 } };
        break;
      case 'weather':
        newBlock = { id, type: 'weather', city: 'Paris', layout: { ...baseLayout, w: 15, h: 4 } };
        break;
    }

    updateConfig((prev) => ({
      ...prev,
      blocks: [...prev.blocks, newBlock],
    }));
  }, [updateConfig]);

  // Ajouter un bookmark
  const addBookmark = useCallback((label: string, url: string) => {
    const id = generateId();
    const newBlock: Block = { 
      id, 
      type: 'bookmark', 
      label, 
      url, 
      layout: { x: 1, y: 1, w: 10, h: 3 } 
    };

    updateConfig((prev) => ({
      ...prev,
      blocks: [...prev.blocks, newBlock],
    }));
  }, [updateConfig]);

  // Ajouter une note simple
  const addSingleNote = useCallback((content: string) => {
    const id = generateId();
    const newBlock: Block = { 
      id, 
      type: 'note', 
      content, 
      layout: { x: 1, y: 1, w: 15, h: 4 } 
    };

    updateConfig((prev) => ({
      ...prev,
      blocks: [...prev.blocks, newBlock],
    }));
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

  // Ajouter une station (FIP par défaut)
  const addStation = useCallback(() => {
    const id = generateId();
    const newBlock: Block = { 
      id, 
      type: 'station', 
      name: 'FIP', 
      streamUrl: 'https://icecast.radiofrance.fr/fip-midfi.mp3', 
      layout: { x: 1, y: 1, w: 12, h: 3 } 
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
    addStation,
    selectStation,
    toggleTheme,
  };
}
