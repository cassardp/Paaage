import { useState, useRef, useEffect, type ReactNode } from 'react';
import { CELL_SIZE } from '../lib/defaultConfig';
import { gridToPixel, gridSizeToPixel, pixelToGrid } from './Grid';
import type { Block, BlockLayout } from '../types/config';

// Limites de taille par type de bloc (en cellules)
const BLOCK_SIZE_LIMITS: Record<string, { minW: number; minH: number; maxW: number; maxH: number }> = {
  search: { minW: 20, minH: 4, maxW: 60, maxH: 4 },
  bookmark: { minW: 4, minH: 2, maxW: 20, maxH: 4 },
  note: { minW: 4, minH: 1, maxW: 40, maxH: 40 },
  station: { minW: 6, minH: 2, maxW: 20, maxH: 4 },
  weather: { minW: 6, minH: 5, maxW: 25, maxH: 8 },
  stock: { minW: 6, minH: 5, maxW: 20, maxH: 6 },
  radio: { minW: 10, minH: 6, maxW: 30, maxH: 20 },
  todo: { minW: 8, minH: 4, maxW: 30, maxH: 40 },
  clock: { minW: 9, minH: 6, maxW: 20, maxH: 6 },
  news: { minW: 14, minH: 5, maxW: 30, maxH: 40 },
  default: { minW: 4, minH: 2, maxW: 40, maxH: 30 },
};

interface DraggableGridProps {
  blocks: Block[];
  onMoveBlock: (blockId: string, layout: BlockLayout) => void;
  onDeleteBlock: (blockId: string) => void;
  renderBlock: (block: Block, isDragging: boolean) => ReactNode;
  isDark?: boolean;
  dragLocked?: boolean;
}

type DragMode = 'move' | 'resize-nw' | 'resize-ne' | 'resize-sw' | 'resize-se';

export function DraggableGrid({ blocks, onMoveBlock, onDeleteBlock, renderBlock, isDark = true, dragLocked = false }: DraggableGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
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

  const startDrag = (e: React.MouseEvent, block: Block, mode: DragMode) => {
    e.preventDefault();
    e.stopPropagation();
    if (!gridRef.current) return;
    
    const rect = gridRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const blockPxX = gridToPixel(block.layout.x);
    const blockPxY = gridToPixel(block.layout.y);
    const blockPxW = gridSizeToPixel(block.layout.w);
    const blockPxH = gridSizeToPixel(block.layout.h);

    setDragState({
      blockId: block.id,
      mode,
      offsetX: mouseX,
      offsetY: mouseY,
      currentPxX: blockPxX,
      currentPxY: blockPxY,
      currentPxW: blockPxW,
      currentPxH: blockPxH,
    });
  };

  useEffect(() => {
    if (!dragState) return;

    const block = blocks.find((b) => b.id === dragState.blockId);
    if (!block) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!gridRef.current) return;
      const rect = gridRef.current.getBoundingClientRect();

      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const deltaX = mouseX - dragState.offsetX;
      const deltaY = mouseY - dragState.offsetY;

      if (dragState.mode === 'move') {
        let pxX = dragState.currentPxX + deltaX;
        let pxY = dragState.currentPxY + deltaY;

        const maxPxX = rect.width - dragState.currentPxW;
        const maxPxY = rect.height - dragState.currentPxH;
        pxX = Math.max(0, Math.min(pxX, maxPxX));
        pxY = Math.max(0, Math.min(pxY, maxPxY));

        setDragState((prev) => prev ? { ...prev, currentPxX: pxX, currentPxY: pxY, offsetX: mouseX, offsetY: mouseY } : null);
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
          offsetX: mouseX, 
          offsetY: mouseY 
        } : null);
      }
    };

    const handleMouseUp = () => {
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

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, blocks, onMoveBlock]);

  const gridColor = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.04)';
  const bgClass = isDark 
    ? 'bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950' 
    : 'bg-gradient-to-br from-neutral-100 via-neutral-50 to-white';

  return (
    <div
      ref={gridRef}
      className={`relative w-full min-h-screen select-none ${bgClass}`}
    >
      {/* Quadrillage subtil */}
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

      {/* Blocs */}
      {blocks.map((block) => {
        const isDragging = dragState?.blockId === block.id;
        const isResizing = isDragging && dragState.mode.startsWith('resize');

        return (
          <div
            key={block.id}
            className={`absolute group ${isDragging ? 'z-50 opacity-90' : 'z-0'}`}
            style={{
              left: isDragging ? dragState.currentPxX : gridToPixel(block.layout.x),
              top: isDragging ? dragState.currentPxY : gridToPixel(block.layout.y),
              width: isResizing ? dragState.currentPxW : gridSizeToPixel(block.layout.w),
              height: isResizing ? dragState.currentPxH : gridSizeToPixel(block.layout.h),
              transition: isDragging ? 'none' : 'all 150ms',
            }}
          >
            {/* Contenu du bloc */}
            <div className="relative w-full h-full">
              {/* Zones de drag sur les bordures (5px) */}
              {!dragLocked && (
                <>
                  <div 
                    className="absolute inset-x-0 top-0 h-[5px] cursor-grab active:cursor-grabbing z-10"
                    onMouseDown={(e) => startDrag(e, block, 'move')}
                  />
                  <div 
                    className="absolute inset-x-0 bottom-0 h-[5px] cursor-grab active:cursor-grabbing z-10"
                    onMouseDown={(e) => startDrag(e, block, 'move')}
                  />
                  <div 
                    className="absolute inset-y-0 left-0 w-[5px] cursor-grab active:cursor-grabbing z-10"
                    onMouseDown={(e) => startDrag(e, block, 'move')}
                  />
                  <div 
                    className="absolute inset-y-0 right-0 w-[5px] cursor-grab active:cursor-grabbing z-10"
                    onMouseDown={(e) => startDrag(e, block, 'move')}
                  />
                </>
              )}
              {renderBlock(block, isDragging)}
            </div>
            
            {/* Bouton supprimer et zone de resize - masqués si verrouillé */}
            {!dragLocked && (
              <>
                <button
                  className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-5 h-5 flex items-center justify-center rounded z-20 cursor-pointer
                             opacity-0 group-hover:opacity-40 hover:!opacity-100 text-neutral-400 hover:text-neutral-600 transition-all"
                  onClick={(e) => { e.stopPropagation(); onDeleteBlock(block.id); }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {/* Zones de resize aux 4 coins */}
                <div
                  className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize z-20 opacity-0 group-hover:opacity-100 hover:border-l-2 hover:border-t-2 hover:border-neutral-400 rounded-tl-[12px]"
                  onMouseDown={(e) => startDrag(e, block, 'resize-nw')}
                />
                <div
                  className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize z-20 opacity-0 group-hover:opacity-100 hover:border-r-2 hover:border-t-2 hover:border-neutral-400 rounded-tr-[12px]"
                  onMouseDown={(e) => startDrag(e, block, 'resize-ne')}
                />
                <div
                  className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize z-20 opacity-0 group-hover:opacity-100 hover:border-l-2 hover:border-b-2 hover:border-neutral-400 rounded-bl-[12px]"
                  onMouseDown={(e) => startDrag(e, block, 'resize-sw')}
                />
                <div
                  className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-20 opacity-0 group-hover:opacity-100 hover:border-r-2 hover:border-b-2 hover:border-neutral-400 rounded-br-[12px]"
                  onMouseDown={(e) => startDrag(e, block, 'resize-se')}
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

