import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import { CELL_SIZE } from '../lib/defaultConfig';
import { gridToPixel, gridSizeToPixel, pixelToGrid } from './Grid';
import type { Block, BlockLayout } from '../types/config';
import { useCrossDesktopDrag, type BlockDragInfo } from '../contexts/CrossDesktopDragContext';
import { useSelection } from '../contexts/SelectionContext';

// Limites de taille par type de bloc (en cellules)
const BLOCK_SIZE_LIMITS: Record<string, { minW: number; minH: number; maxW: number; maxH: number }> = {
  search: { minW: 20, minH: 4, maxW: 60, maxH: 4 },
  bookmark: { minW: 4, minH: 2, maxW: 20, maxH: 4 },
  note: { minW: 4, minH: 1, maxW: 1000, maxH: 1000 },
  station: { minW: 6, minH: 2, maxW: 20, maxH: 4 },
  weather: { minW: 6, minH: 5, maxW: 25, maxH: 8 },
  stock: { minW: 6, minH: 5, maxW: 20, maxH: 6 },
  todo: { minW: 8, minH: 4, maxW: 30, maxH: 40 },
  clock: { minW: 9, minH: 6, maxW: 20, maxH: 6 },
  links: { minW: 4, minH: 2, maxW: 100, maxH: 100 },
  rss: { minW: 10, minH: 5, maxW: 40, maxH: 100 },
  settings: { minW: 10, minH: 10, maxW: 30, maxH: 40 },
  text: { minW: 4, minH: 2, maxW: 1000, maxH: 1000 },
  default: { minW: 4, minH: 2, maxW: 40, maxH: 30 },
};

interface DraggableGridProps {
  blocks: Block[];
  desktopId: string;
  onMoveBlock: (blockId: string, layout: BlockLayout) => void;
  onDeleteBlock: (blockId: string) => void;
  renderBlock: (block: Block, isDragging: boolean, isGrabHovering: boolean, isSelected: boolean) => ReactNode;
  isDark?: boolean;
  dragLocked?: boolean;
  hideGridLines?: boolean;
}

type DragMode = 'move' | 'resize-nw' | 'resize-ne' | 'resize-sw' | 'resize-se';

const LONG_PRESS_DELAY = 400; // ms pour déclencher le drag sur touch

export function DraggableGrid({ blocks, desktopId, onMoveBlock, onDeleteBlock, renderBlock, isDark = true, dragLocked = false, hideGridLines = false }: DraggableGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const { dragState: crossDragState, startCrossDrag } = useCrossDesktopDrag();
  const { selectedBlockIds, toggleSelection, clearSelection, isSelected } = useSelection();

  // Long press state pour touch
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressBlockRef = useRef<{ block: Block; startX: number; startY: number } | null>(null);
  const [longPressActive, setLongPressActive] = useState<string | null>(null);
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);

  const [dragState, setDragState] = useState<{
    blockId: string;
    mode: DragMode;
    offsetX: number;
    offsetY: number;
    currentPxX: number;
    currentPxY: number;
    currentPxW: number;
    currentPxH: number;
  } | null>(null);

  // Rectangle de sélection (lasso)
  const [selectionRect, setSelectionRect] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  // Annuler le long press
  const cancelLongPress = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    longPressBlockRef.current = null;
    setLongPressActive(null);
  }, []);

  // Démarrer le drag (appelé directement pour souris, après long press pour touch)
  const startDrag = useCallback((clientX: number, clientY: number, block: Block, mode: DragMode) => {
    if (!gridRef.current) return;

    const rect = gridRef.current.getBoundingClientRect();
    const pointerX = clientX - rect.left;
    const pointerY = clientY - rect.top;
    const blockPxX = gridToPixel(block.layout.x);
    const blockPxY = gridToPixel(block.layout.y);
    const blockPxW = gridSizeToPixel(block.layout.w);
    const blockPxH = gridSizeToPixel(block.layout.h);

    // Pour le mode move, on utilise le cross-desktop drag
    if (mode === 'move') {
      const offsetX = clientX - (rect.left + blockPxX);
      const offsetY = clientY - (rect.top + blockPxY);

      // Collecter les blocks additionnels sélectionnés (sauf le block principal)
      const additionalBlocks: BlockDragInfo[] = [];
      if (selectedBlockIds.has(block.id) && selectedBlockIds.size > 1) {
        for (const selectedId of selectedBlockIds) {
          if (selectedId === block.id) continue;
          const selectedBlock = blocks.find(b => b.id === selectedId);
          if (selectedBlock) {
            const selPxX = gridToPixel(selectedBlock.layout.x);
            const selPxY = gridToPixel(selectedBlock.layout.y);
            additionalBlocks.push({
              block: selectedBlock,
              relativeX: selPxX - blockPxX,
              relativeY: selPxY - blockPxY,
              width: gridSizeToPixel(selectedBlock.layout.w),
              height: gridSizeToPixel(selectedBlock.layout.h),
            });
          }
        }
      }

      startCrossDrag(
        block,
        desktopId,
        clientX,
        clientY,
        offsetX,
        offsetY,
        blockPxW,
        blockPxH,
        additionalBlocks
      );
      return;
    }

    // Pour le resize, on garde le comportement local
    setDragState({
      blockId: block.id,
      mode,
      offsetX: pointerX,
      offsetY: pointerY,
      currentPxX: blockPxX,
      currentPxY: blockPxY,
      currentPxW: blockPxW,
      currentPxH: blockPxH,
    });
  }, [desktopId, startCrossDrag, selectedBlockIds, blocks]);

  // Handler pour pointer down sur les zones de drag (bordures)
  const handlePointerDown = useCallback((e: React.PointerEvent, block: Block, mode: DragMode) => {
    e.preventDefault();
    e.stopPropagation();

    // Gérer la sélection avec Ctrl/Cmd+click
    if (mode === 'move' && (e.ctrlKey || e.metaKey)) {
      toggleSelection(block.id, true);
      return;
    }

    // Si le block n'est pas sélectionné et qu'on commence un drag, clear la sélection
    if (mode === 'move' && !isSelected(block.id)) {
      clearSelection();
    }

    if (e.pointerType === 'mouse') {
      // Souris : drag immédiat
      startDrag(e.clientX, e.clientY, block, mode);
    } else {
      // Touch/pen : long press requis pour move, immédiat pour resize
      if (mode !== 'move') {
        startDrag(e.clientX, e.clientY, block, mode);
        return;
      }

      // Démarrer le timer de long press
      longPressBlockRef.current = { block, startX: e.clientX, startY: e.clientY };
      setLongPressActive(block.id);

      longPressTimerRef.current = setTimeout(() => {
        if (longPressBlockRef.current) {
          const { block: b, startX, startY } = longPressBlockRef.current;
          startDrag(startX, startY, b, 'move');
          cancelLongPress();
        }
      }, LONG_PRESS_DELAY);
    }
  }, [startDrag, cancelLongPress, toggleSelection, isSelected, clearSelection]);

  // Annuler le long press si on bouge trop
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!longPressBlockRef.current) return;

    const dx = e.clientX - longPressBlockRef.current.startX;
    const dy = e.clientY - longPressBlockRef.current.startY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Si on bouge de plus de 10px, annuler le long press
    if (distance > 10) {
      cancelLongPress();
    }
  }, [cancelLongPress]);

  // Annuler le long press si on relâche avant le délai
  const handlePointerUp = useCallback(() => {
    cancelLongPress();
  }, [cancelLongPress]);

  // Démarrer la sélection par rectangle sur le fond
  const handleGridPointerDown = useCallback((e: React.PointerEvent) => {
    // Ne pas démarrer si on clique sur un block ou si drag locké
    if (dragLocked) return;
    if ((e.target as HTMLElement).closest('[data-block]')) return;

    // Clear la sélection existante sauf si Ctrl/Cmd
    if (!e.ctrlKey && !e.metaKey) {
      clearSelection();
    }

    if (!gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setSelectionRect({ startX: x, startY: y, currentX: x, currentY: y });
  }, [dragLocked, clearSelection]);

  // Mettre à jour le rectangle de sélection et sélectionner les blocks
  useEffect(() => {
    if (!selectionRect) return;

    const handleMove = (e: PointerEvent) => {
      if (!gridRef.current) return;
      const rect = gridRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setSelectionRect(prev => prev ? { ...prev, currentX: x, currentY: y } : null);
    };

    const handleUp = () => {
      if (!selectionRect || !gridRef.current) {
        setSelectionRect(null);
        return;
      }

      // Calculer le rectangle normalisé
      const minX = Math.min(selectionRect.startX, selectionRect.currentX);
      const maxX = Math.max(selectionRect.startX, selectionRect.currentX);
      const minY = Math.min(selectionRect.startY, selectionRect.currentY);
      const maxY = Math.max(selectionRect.startY, selectionRect.currentY);

      // Sélectionner les blocks qui intersectent le rectangle
      for (const block of blocks) {
        const blockLeft = gridToPixel(block.layout.x);
        const blockTop = gridToPixel(block.layout.y);
        const blockRight = blockLeft + gridSizeToPixel(block.layout.w);
        const blockBottom = blockTop + gridSizeToPixel(block.layout.h);

        // Vérifier l'intersection
        const intersects = !(blockRight < minX || blockLeft > maxX || blockBottom < minY || blockTop > maxY);
        if (intersects) {
          toggleSelection(block.id, true);
        }
      }

      setSelectionRect(null);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [selectionRect, blocks, toggleSelection]);

  // Cleanup du timer au unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!dragState) return;

    const block = blocks.find((b) => b.id === dragState.blockId);
    if (!block) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!gridRef.current) return;
      const rect = gridRef.current.getBoundingClientRect();

      const pointerX = e.clientX - rect.left;
      const pointerY = e.clientY - rect.top;
      const deltaX = pointerX - dragState.offsetX;
      const deltaY = pointerY - dragState.offsetY;

      if (dragState.mode === 'move') {
        let pxX = dragState.currentPxX + deltaX;
        let pxY = dragState.currentPxY + deltaY;

        const maxPxX = rect.width - dragState.currentPxW;
        const maxPxY = rect.height - dragState.currentPxH;
        pxX = Math.max(0, Math.min(pxX, maxPxX));
        pxY = Math.max(0, Math.min(pxY, maxPxY));

        setDragState((prev) => prev ? { ...prev, currentPxX: pxX, currentPxY: pxY, offsetX: pointerX, offsetY: pointerY } : null);
      } else {
        // Resize depuis un coin
        const limits = BLOCK_SIZE_LIMITS[block.type] || BLOCK_SIZE_LIMITS.default;
        const minW = CELL_SIZE * limits.minW;
        const minH = CELL_SIZE * limits.minH;
        const maxW = CELL_SIZE * limits.maxW;
        const maxH = CELL_SIZE * limits.maxH;

        let newX = dragState.currentPxX;
        let newY = dragState.currentPxY;
        let newW = dragState.currentPxW;
        let newH = dragState.currentPxH;

        if (dragState.mode === 'resize-se') {
          newW = dragState.currentPxW + deltaX;
          newH = dragState.currentPxH + deltaY;
        } else if (dragState.mode === 'resize-sw') {
          newX = dragState.currentPxX + deltaX;
          newW = dragState.currentPxW - deltaX;
          newH = dragState.currentPxH + deltaY;
        } else if (dragState.mode === 'resize-ne') {
          newY = dragState.currentPxY + deltaY;
          newW = dragState.currentPxW + deltaX;
          newH = dragState.currentPxH - deltaY;
        } else if (dragState.mode === 'resize-nw') {
          newX = dragState.currentPxX + deltaX;
          newY = dragState.currentPxY + deltaY;
          newW = dragState.currentPxW - deltaX;
          newH = dragState.currentPxH - deltaY;
        }

        // Appliquer les limites
        newW = Math.max(minW, Math.min(newW, maxW));
        newH = Math.max(minH, Math.min(newH, maxH));
        newX = Math.max(0, newX);
        newY = Math.max(0, newY);

        setDragState((prev) => prev ? {
          ...prev,
          currentPxX: newX,
          currentPxY: newY,
          currentPxW: newW,
          currentPxH: newH,
          offsetX: pointerX,
          offsetY: pointerY
        } : null);
      }
    };

    const handlePointerUp = () => {
      if (!gridRef.current) {
        setDragState(null);
        return;
      }

      const rect = gridRef.current.getBoundingClientRect();
      const maxCols = Math.floor(rect.width / CELL_SIZE);
      const maxRows = Math.floor(rect.height / CELL_SIZE);

      let newLayout: BlockLayout;

      let gridX = pixelToGrid(dragState.currentPxX);
      let gridY = pixelToGrid(dragState.currentPxY);
      let gridW = Math.round(dragState.currentPxW / CELL_SIZE);
      let gridH = Math.round(dragState.currentPxH / CELL_SIZE);

      gridX = Math.max(0, Math.min(gridX, maxCols - gridW));
      gridY = Math.max(0, Math.min(gridY, maxRows - gridH));
      gridW = Math.max(2, gridW);
      gridH = Math.max(2, gridH);

      newLayout = { x: gridX, y: gridY, w: gridW, h: gridH };

      onMoveBlock(block.id, newLayout);

      setDragState(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragState, blocks, onMoveBlock]);

  const gridColor = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.04)';

  // Calculer les dimensions du rectangle de sélection
  const selectionBox = selectionRect ? {
    left: Math.min(selectionRect.startX, selectionRect.currentX),
    top: Math.min(selectionRect.startY, selectionRect.currentY),
    width: Math.abs(selectionRect.currentX - selectionRect.startX),
    height: Math.abs(selectionRect.currentY - selectionRect.startY),
  } : null;

  return (
    <div
      ref={gridRef}
      className="relative w-full h-full min-h-screen select-none"
      onPointerDown={handleGridPointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ touchAction: 'none' }}
    >
      {/* Quadrillage subtil */}
      {!hideGridLines && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, ${gridColor} 1px, transparent 1px),
              linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)
            `,
            backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
          }}
        />
      )}

      {/* Rectangle de sélection */}
      {selectionBox && selectionBox.width > 5 && selectionBox.height > 5 && (
        <div
          className="absolute border border-dashed border-neutral-400 rounded-[12px] pointer-events-none z-40"
          style={{
            left: selectionBox.left,
            top: selectionBox.top,
            width: selectionBox.width,
            height: selectionBox.height,
          }}
        />
      )}

      {/* Blocs */}
      {blocks.map((block) => {
        // Cacher le bloc s'il est en cours de cross-desktop drag depuis ce desktop
        const isCrossDragging = crossDragState?.block.id === block.id && crossDragState?.sourceDesktopId === desktopId;
        const isAdditionalDragging = crossDragState?.additionalBlocks.some(ab => ab.block.id === block.id) && crossDragState?.sourceDesktopId === desktopId;
        if (isCrossDragging || isAdditionalDragging) return null;

        const isBlockSelected = isSelected(block.id);

        const isDragging = dragState?.blockId === block.id;
        const isResizing = isDragging && dragState.mode.startsWith('resize');

        return (
          <div
            key={block.id}
            data-block
            className={`absolute group ${isDragging ? 'z-50 opacity-90 cursor-grabbing' : 'z-10'} ${isBlockSelected ? 'cursor-grab active:cursor-grabbing' : ''}`}
            style={{
              left: isDragging ? dragState.currentPxX : gridToPixel(block.layout.x),
              top: isDragging ? dragState.currentPxY : gridToPixel(block.layout.y),
              width: isResizing ? dragState.currentPxW : gridSizeToPixel(block.layout.w),
              height: isResizing ? dragState.currentPxH : gridSizeToPixel(block.layout.h),
              transition: isDragging ? 'none' : 'all 150ms',
            }}
          >
            {/* Contenu du bloc */}
            <div
              className="relative w-full h-full"
              onMouseEnter={() => setHoveredBlockId(block.id)}
              onMouseLeave={() => setHoveredBlockId(null)}
              onPointerDown={isBlockSelected ? (e) => handlePointerDown(e, block, 'move') : undefined}
              style={isBlockSelected ? { touchAction: 'none' } : undefined}
            >
              {/* Zones de drag sur les bordures - plus grandes pour le touch */}
              {!dragLocked && !isBlockSelected && (
                <>
                  <div
                    className="absolute inset-x-0 top-0 h-[12px] cursor-grab active:cursor-grabbing z-10"
                    onPointerDown={(e) => handlePointerDown(e, block, 'move')}
                    style={{ touchAction: 'none' }}
                  />
                  <div
                    className="absolute inset-x-0 bottom-0 h-[12px] cursor-grab active:cursor-grabbing z-10"
                    onPointerDown={(e) => handlePointerDown(e, block, 'move')}
                    style={{ touchAction: 'none' }}
                  />
                  <div
                    className="absolute inset-y-0 left-0 w-[12px] cursor-grab active:cursor-grabbing z-10"
                    onPointerDown={(e) => handlePointerDown(e, block, 'move')}
                    style={{ touchAction: 'none' }}
                  />
                  <div
                    className="absolute inset-y-0 right-0 w-[12px] cursor-grab active:cursor-grabbing z-10"
                    onPointerDown={(e) => handlePointerDown(e, block, 'move')}
                    style={{ touchAction: 'none' }}
                  />
                  {/* Indicateur visuel de long press */}
                  {longPressActive === block.id && (
                    <div className="absolute inset-0 rounded-xl border-2 border-[var(--accent-color)] animate-pulse pointer-events-none z-20" />
                  )}
                </>
              )}
              {renderBlock(block, isDragging, hoveredBlockId === block.id, isBlockSelected)}
              {/* Overlay pour bloquer les interactions quand sélectionné */}
              {isBlockSelected && (
                <div className="absolute inset-0 z-30" />
              )}
            </div>

            {/* Bouton supprimer et zone de resize - masqués si verrouillé ou si sélection active */}
            {!dragLocked && !isBlockSelected && (
              <>
                <button
                  className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-5 h-5 flex items-center justify-center rounded z-20 cursor-pointer
                             opacity-0 group-hover:opacity-40 hover:!opacity-100 text-neutral-400 hover:text-neutral-500 transition-all"
                  onClick={(e) => { e.stopPropagation(); onDeleteBlock(block.id); }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {/* Zones de resize aux 4 coins */}
                <div
                  className="absolute top-0 left-0 w-6 h-6 cursor-nw-resize z-20 opacity-0 group-hover:opacity-100 hover:border-l-2 hover:border-t-2 hover:border-neutral-400 rounded-tl-[12px]"
                  onPointerDown={(e) => handlePointerDown(e, block, 'resize-nw')}
                  style={{ touchAction: 'none' }}
                />
                <div
                  className="absolute top-0 right-0 w-6 h-6 cursor-ne-resize z-20 opacity-0 group-hover:opacity-100 hover:border-r-2 hover:border-t-2 hover:border-neutral-400 rounded-tr-[12px]"
                  onPointerDown={(e) => handlePointerDown(e, block, 'resize-ne')}
                  style={{ touchAction: 'none' }}
                />
                <div
                  className="absolute bottom-0 left-0 w-6 h-6 cursor-sw-resize z-20 opacity-0 group-hover:opacity-100 hover:border-l-2 hover:border-b-2 hover:border-neutral-400 rounded-bl-[12px]"
                  onPointerDown={(e) => handlePointerDown(e, block, 'resize-sw')}
                  style={{ touchAction: 'none' }}
                />
                <div
                  className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize z-20 opacity-0 group-hover:opacity-100 hover:border-r-2 hover:border-b-2 hover:border-neutral-400 rounded-br-[12px]"
                  onPointerDown={(e) => handlePointerDown(e, block, 'resize-se')}
                  style={{ touchAction: 'none' }}
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

