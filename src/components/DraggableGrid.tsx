import { useState, useRef, useEffect, type ReactNode } from 'react';
import { CELL_SIZE } from '../lib/defaultConfig';
import { gridToPixel, gridSizeToPixel, pixelToGrid } from './Grid';
import type { Block, BlockLayout } from '../types/config';

// Limites de taille par type de bloc (en cellules)
const BLOCK_SIZE_LIMITS: Record<string, { minW: number; minH: number; maxW: number; maxH: number }> = {
  search: { minW: 10, minH: 2, maxW: 60, maxH: 4 },
  bookmark: { minW: 4, minH: 2, maxW: 30, maxH: 4 },
  note: { minW: 4, minH: 1, maxW: 40, maxH: 20 },
  station: { minW: 6, minH: 2, maxW: 20, maxH: 4 },
  weather: { minW: 8, minH: 3, maxW: 25, maxH: 8 },
  stock: { minW: 6, minH: 2, maxW: 20, maxH: 6 },
  radio: { minW: 10, minH: 6, maxW: 30, maxH: 20 },
  default: { minW: 4, minH: 2, maxW: 40, maxH: 30 },
};

interface DraggableGridProps {
  blocks: Block[];
  onMoveBlock: (blockId: string, layout: BlockLayout) => void;
  onDeleteBlock: (blockId: string) => void;
  renderBlock: (block: Block, isDragging: boolean) => ReactNode;
  toolbar?: ReactNode;
  isDark?: boolean;
}

type DragMode = 'move' | 'resize';

export function DraggableGrid({ blocks, onMoveBlock, onDeleteBlock, renderBlock, toolbar, isDark = true }: DraggableGridProps) {
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
      offsetX: mouseX - (mode === 'move' ? blockPxX : blockPxW),
      offsetY: mouseY - (mode === 'move' ? blockPxY : blockPxH),
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

      if (dragState.mode === 'move') {
        let pxX = e.clientX - rect.left - dragState.offsetX;
        let pxY = e.clientY - rect.top - dragState.offsetY;

        const maxPxX = rect.width - dragState.currentPxW;
        const maxPxY = rect.height - dragState.currentPxH;
        pxX = Math.max(0, Math.min(pxX, maxPxX));
        pxY = Math.max(0, Math.min(pxY, maxPxY));

        setDragState((prev) => prev ? { ...prev, currentPxX: pxX, currentPxY: pxY } : null);
      } else {
        // Resize
        let pxW = e.clientX - rect.left - dragState.currentPxX;
        let pxH = e.clientY - rect.top - dragState.currentPxY;

        // Limites selon le type de bloc
        const limits = BLOCK_SIZE_LIMITS[block.type] || BLOCK_SIZE_LIMITS.default;
        const minW = CELL_SIZE * limits.minW;
        const minH = CELL_SIZE * limits.minH;
        const maxW = CELL_SIZE * limits.maxW;
        const maxH = CELL_SIZE * limits.maxH;
        
        pxW = Math.max(minW, Math.min(pxW, maxW));
        pxH = Math.max(minH, Math.min(pxH, maxH));

        setDragState((prev) => prev ? { ...prev, currentPxW: pxW, currentPxH: pxH } : null);
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

      if (dragState.mode === 'move') {
        let gridX = pixelToGrid(dragState.currentPxX);
        let gridY = pixelToGrid(dragState.currentPxY);
        gridX = Math.max(0, Math.min(gridX, maxCols - block.layout.w));
        gridY = Math.max(0, Math.min(gridY, maxRows - block.layout.h));
        newLayout = { ...block.layout, x: gridX, y: gridY };
      } else {
        let gridW = Math.round(dragState.currentPxW / CELL_SIZE);
        let gridH = Math.round(dragState.currentPxH / CELL_SIZE);
        gridW = Math.max(2, Math.min(gridW, maxCols - block.layout.x));
        gridH = Math.max(2, Math.min(gridH, maxRows - block.layout.y));
        newLayout = { ...block.layout, w: gridW, h: gridH };
      }

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

      {/* Toolbar */}
      {toolbar && (
        <div className="absolute top-3 right-3 z-50">
          {toolbar}
        </div>
      )}

      {/* Blocs */}
      {blocks.map((block) => {
        const isDragging = dragState?.blockId === block.id;
        const isMoving = isDragging && dragState.mode === 'move';
        const isResizing = isDragging && dragState.mode === 'resize';

        return (
          <div
            key={block.id}
            className={`absolute group ${isDragging ? 'z-50 opacity-90' : 'z-0'}`}
            style={{
              left: isMoving ? dragState.currentPxX : gridToPixel(block.layout.x),
              top: isMoving ? dragState.currentPxY : gridToPixel(block.layout.y),
              width: isResizing ? dragState.currentPxW : gridSizeToPixel(block.layout.w),
              height: isResizing ? dragState.currentPxH : gridSizeToPixel(block.layout.h),
              transition: isDragging ? 'none' : 'all 150ms',
            }}
          >
            {/* Contenu du bloc */}
            <div 
              className="relative w-full h-full cursor-grab active:cursor-grabbing"
              onMouseDown={(e) => {
                // Ne pas drag si on clique sur un élément interactif
                const target = e.target as HTMLElement;
                if (target.closest('input, textarea, button, a, select')) return;
                startDrag(e, block, 'move');
              }}
            >
              {renderBlock(block, isDragging)}
            </div>
            
            {/* Bouton supprimer sous le bloc, centré */}
            <button
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-5 h-5 flex items-center justify-center rounded z-20 cursor-pointer
                         opacity-0 group-hover:opacity-40 hover:!opacity-100 text-neutral-400 hover:text-neutral-600 transition-all"
              onClick={(e) => { e.stopPropagation(); onDeleteBlock(block.id); }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Zone de resize - coin bas-droit */}
            <div
              className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-20"
              onMouseDown={(e) => startDrag(e, block, 'resize')}
            />
          </div>
        );
      })}
    </div>
  );
}

