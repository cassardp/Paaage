import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface SelectionContextType {
  selectedBlockIds: Set<string>;
  toggleSelection: (blockId: string, addToSelection: boolean) => void;
  selectBlock: (blockId: string) => void;
  clearSelection: () => void;
  isSelected: (blockId: string) => boolean;
}

const SelectionContext = createContext<SelectionContextType | null>(null);

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selectedBlockIds, setSelectedBlockIds] = useState<Set<string>>(new Set());

  const toggleSelection = useCallback((blockId: string, addToSelection: boolean) => {
    setSelectedBlockIds(prev => {
      const next = new Set(prev);
      if (addToSelection) {
        if (next.has(blockId)) {
          next.delete(blockId);
        } else {
          next.add(blockId);
        }
      } else {
        next.clear();
        next.add(blockId);
      }
      return next;
    });
  }, []);

  const selectBlock = useCallback((blockId: string) => {
    setSelectedBlockIds(new Set([blockId]));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedBlockIds(new Set());
  }, []);

  const isSelected = useCallback((blockId: string) => {
    return selectedBlockIds.has(blockId);
  }, [selectedBlockIds]);

  return (
    <SelectionContext.Provider value={{
      selectedBlockIds,
      toggleSelection,
      selectBlock,
      clearSelection,
      isSelected,
    }}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelection must be used within SelectionProvider');
  }
  return context;
}
