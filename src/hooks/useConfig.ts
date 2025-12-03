import { useState, useEffect, useCallback } from 'react';
import type { Config, Block, Link, NoteItem, BlockLayout } from '../types/config';
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

  // Déplacer un bloc sur la grille
  const moveBlock = useCallback((blockId: string, layout: BlockLayout) => {
    updateConfig((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === blockId ? { ...block, layout } : block
      ),
    }));
  }, [updateConfig]);

  // Supprimer un bloc
  const deleteBlock = useCallback((blockId: string) => {
    updateConfig((prev) => ({
      ...prev,
      blocks: prev.blocks.filter((block) => block.id !== blockId),
    }));
  }, [updateConfig]);

  // Ajouter un bloc
  const addBlock = useCallback((type: 'search' | 'links' | 'notes' | 'radio' | 'weather') => {
    const id = generateId();
    const baseLayout = { x: 1, y: 1, w: 20, h: 10 };
    
    let newBlock: Block;
    switch (type) {
      case 'search':
        newBlock = { id, type: 'search', layout: { ...baseLayout, h: 3 } };
        break;
      case 'links':
        newBlock = { id, type: 'links', title: 'Liens', links: [], layout: baseLayout };
        break;
      case 'notes':
        newBlock = { id, type: 'notes', title: 'Notes', items: [], layout: baseLayout };
        break;
      case 'radio':
        newBlock = { id, type: 'radio', title: 'Radio', stations: [], layout: baseLayout };
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

  // Notes
  const addNote = useCallback((blockId: string, content: string) => {
    updateConfig((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) => {
        if (block.id === blockId && block.type === 'notes') {
          const newItem: NoteItem = {
            id: generateId(),
            content,
            createdAt: new Date().toISOString(),
          };
          return { ...block, items: [newItem, ...block.items] };
        }
        return block;
      }),
    }));
  }, [updateConfig]);

  const deleteNote = useCallback((blockId: string, noteId: string) => {
    updateConfig((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) => {
        if (block.id === blockId && block.type === 'notes') {
          return { ...block, items: block.items.filter((n) => n.id !== noteId) };
        }
        return block;
      }),
    }));
  }, [updateConfig]);

  // Links
  const addLink = useCallback((blockId: string, link: Omit<Link, 'id'>) => {
    updateConfig((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) => {
        if (block.id === blockId && block.type === 'links') {
          return { ...block, links: [...block.links, { ...link, id: generateId() }] };
        }
        return block;
      }),
    }));
  }, [updateConfig]);

  const deleteLink = useCallback((blockId: string, linkId: string) => {
    updateConfig((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) => {
        if (block.id === blockId && block.type === 'links') {
          return { ...block, links: block.links.filter((l) => l.id !== linkId) };
        }
        return block;
      }),
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
    addNote,
    deleteNote,
    addLink,
    deleteLink,
    selectStation,
    toggleTheme,
  };
}
