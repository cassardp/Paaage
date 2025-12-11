import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
import type { Block } from '../types/config';

export interface BlockDragInfo {
  block: Block;
  // Offset relatif au block principal (0,0 pour le block principal)
  relativeX: number;
  relativeY: number;
  width: number;
  height: number;
}

interface DragState {
  block: Block;
  sourceDesktopId: string;
  // Position en pixels relative à la fenêtre
  clientX: number;
  clientY: number;
  // Offset du curseur par rapport au coin du bloc
  offsetX: number;
  offsetY: number;
  // Dimensions du bloc en pixels
  width: number;
  height: number;
  // Blocks additionnels sélectionnés (pour multi-drag)
  additionalBlocks: BlockDragInfo[];
}

interface CrossDesktopDragContextType {
  dragState: DragState | null;
  startCrossDrag: (
    block: Block,
    sourceDesktopId: string,
    clientX: number,
    clientY: number,
    offsetX: number,
    offsetY: number,
    width: number,
    height: number,
    additionalBlocks?: BlockDragInfo[]
  ) => void;
  updateDragPosition: (clientX: number, clientY: number) => void;
  endCrossDrag: () => DragState | null;
  cancelCrossDrag: () => void;
  carouselRef: React.RefObject<HTMLDivElement | null>;
}

const CrossDesktopDragContext = createContext<CrossDesktopDragContextType | null>(null);

export function CrossDesktopDragProvider({ children }: { children: ReactNode }) {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const startCrossDrag = useCallback((
    block: Block,
    sourceDesktopId: string,
    clientX: number,
    clientY: number,
    offsetX: number,
    offsetY: number,
    width: number,
    height: number,
    additionalBlocks: BlockDragInfo[] = []
  ) => {
    setDragState({
      block,
      sourceDesktopId,
      clientX,
      clientY,
      offsetX,
      offsetY,
      width,
      height,
      additionalBlocks,
    });
  }, []);

  const updateDragPosition = useCallback((clientX: number, clientY: number) => {
    setDragState(prev => prev ? { ...prev, clientX, clientY } : null);
  }, []);

  const endCrossDrag = useCallback(() => {
    const state = dragState;
    setDragState(null);
    return state;
  }, [dragState]);

  const cancelCrossDrag = useCallback(() => {
    setDragState(null);
  }, []);

  return (
    <CrossDesktopDragContext.Provider value={{
      dragState,
      startCrossDrag,
      updateDragPosition,
      endCrossDrag,
      cancelCrossDrag,
      carouselRef,
    }}>
      {children}
    </CrossDesktopDragContext.Provider>
  );
}

export function useCrossDesktopDrag() {
  const context = useContext(CrossDesktopDragContext);
  if (!context) {
    throw new Error('useCrossDesktopDrag must be used within CrossDesktopDragProvider');
  }
  return context;
}
