import { useEffect, useRef } from 'react';
import { useCrossDesktopDrag } from '../contexts/CrossDesktopDragContext';

interface DragOverlayProps {
  renderBlock: (block: any, isDragging: boolean, isGrabHovering: boolean) => React.ReactNode;
  desktopCount: number;
  currentDesktopIndex: number;
  onScrollToDesktop: (index: number) => void;
  lastDesktopEmpty: boolean;
}

const EDGE_SCROLL_ZONE = 80; // pixels depuis le bord pour déclencher le scroll
const SCROLL_DELAY = 400; // ms avant de scroller vers un autre desktop

export function DragOverlay({
  renderBlock,
  desktopCount,
  currentDesktopIndex,
  onScrollToDesktop,
  lastDesktopEmpty,
}: DragOverlayProps) {
  const { dragState, updateDragPosition } = useCrossDesktopDrag();
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrollDirection = useRef<'left' | 'right' | null>(null);

  // Gestion du mouvement de souris pendant le drag
  useEffect(() => {
    if (!dragState) return;

    const handlePointerMove = (e: PointerEvent) => {
      updateDragPosition(e.clientX, e.clientY);

      // Détection des bords pour scroll automatique
      const windowWidth = window.innerWidth;
      const maxIndex = lastDesktopEmpty ? desktopCount - 1 : desktopCount;

      if (e.clientX < EDGE_SCROLL_ZONE && currentDesktopIndex > 0) {
        // Bord gauche - scroll vers desktop précédent
        if (lastScrollDirection.current !== 'left') {
          lastScrollDirection.current = 'left';
          if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
          scrollTimerRef.current = setTimeout(() => {
            onScrollToDesktop(currentDesktopIndex - 1);
            lastScrollDirection.current = null;
          }, SCROLL_DELAY);
        }
      } else if (e.clientX > windowWidth - EDGE_SCROLL_ZONE && currentDesktopIndex < maxIndex) {
        // Bord droit - scroll vers desktop suivant
        if (lastScrollDirection.current !== 'right') {
          lastScrollDirection.current = 'right';
          if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
          scrollTimerRef.current = setTimeout(() => {
            onScrollToDesktop(currentDesktopIndex + 1);
            lastScrollDirection.current = null;
          }, SCROLL_DELAY);
        }
      } else {
        // Hors des zones de bord - annuler le timer
        if (scrollTimerRef.current) {
          clearTimeout(scrollTimerRef.current);
          scrollTimerRef.current = null;
        }
        lastScrollDirection.current = null;
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
    };
  }, [dragState, updateDragPosition, currentDesktopIndex, desktopCount, onScrollToDesktop, lastDesktopEmpty]);

  if (!dragState) return null;

  const { block, clientX, clientY, offsetX, offsetY, width, height, additionalBlocks } = dragState;
  const baseX = clientX - offsetX;
  const baseY = clientY - offsetY;

  return (
    <>
      {/* Curseur grabbing global pendant le drag */}
      <style>{`body { cursor: grabbing !important; }`}</style>
      {/* Block principal */}
      <div
        className="fixed z-[9999] pointer-events-none"
        style={{
          left: baseX,
          top: baseY,
          width,
          height,
          opacity: 0.9,
          transform: 'scale(1.02)',
          transition: 'transform 100ms, opacity 100ms',
        }}
      >
        {renderBlock(block, true, false)}
      </div>
      {/* Blocks additionnels sélectionnés */}
      {additionalBlocks.map((ab) => (
        <div
          key={ab.block.id}
          className="fixed z-[9998] pointer-events-none"
          style={{
            left: baseX + ab.relativeX,
            top: baseY + ab.relativeY,
            width: ab.width,
            height: ab.height,
            opacity: 0.9,
            transform: 'scale(1.02)',
            transition: 'transform 100ms, opacity 100ms',
          }}
        >
          {renderBlock(ab.block, true, false)}
        </div>
      ))}
    </>
  );
}
