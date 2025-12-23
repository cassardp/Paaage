import { useRef, useEffect, useCallback, type ReactNode } from 'react';

interface DesktopCarouselProps {
  children: ReactNode[];
  currentIndex: number;
  onChangeIndex: (index: number) => void;
  isDark: boolean;
  lastDesktopEmpty: boolean;
}

const SWIPE_THRESHOLD = 50; // pixels minimum pour déclencher un swipe

export function DesktopCarousel({
  children,
  currentIndex,
  onChangeIndex,
  isDark,
  lastDesktopEmpty
}: DesktopCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const userScrollingRef = useRef(false);

  // Touch/swipe state
  const touchStartRef = useRef<{ x: number; y: number; scrollLeft: number; pointerId: number } | null>(null);
  const isTouchSwipingRef = useRef(false);

  // Scroll vers le desktop actuel quand l'index change (via clavier ou dots)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Ne pas scroller si c'est l'utilisateur qui a déclenché le changement
    if (userScrollingRef.current) {
      userScrollingRef.current = false;
      return;
    }

    const targetScroll = currentIndex * container.clientWidth;
    if (Math.abs(container.scrollLeft - targetScroll) > 10) {
      container.scrollTo({ left: targetScroll, behavior: 'smooth' });
    }
  }, [currentIndex]);

  // Bloquer le scroll diagonal
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);

      // Si le scroll est trop diagonal ou principalement vertical, bloquer
      if (absY > 5 && absX < absY * 2) {
        e.preventDefault();
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Mettre à jour l'index pendant le scroll et forcer le snap à la fin
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scrollTimeout: ReturnType<typeof setTimeout> | null = null;

    const handleScroll = () => {
      const pageWidth = container.clientWidth;
      const scrollPosition = container.scrollLeft;
      const newIndex = Math.round(scrollPosition / pageWidth);

      const maxIndex = lastDesktopEmpty ? children.length - 1 : children.length;
      const clampedIndex = Math.max(0, Math.min(newIndex, maxIndex));

      // Mettre à jour l'index si changé
      if (clampedIndex !== currentIndex) {
        userScrollingRef.current = true;
        onChangeIndex(clampedIndex);
      }

      // Debounce: forcer le snap exact après 100ms d'inactivité
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const targetScroll = clampedIndex * pageWidth;
        if (Math.abs(container.scrollLeft - targetScroll) > 2) {
          container.scrollTo({ left: targetScroll, behavior: 'smooth' });
        }
      }, 100);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [children.length, currentIndex, onChangeIndex, lastDesktopEmpty]);

  // Gestion du swipe tactile (pour iPad/iPhone sans trackpad)
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Seulement pour touch, pas pour souris (le scroll natif gère la souris)
    if (e.pointerType === 'mouse') return;
    const container = containerRef.current;
    if (!container) return;

    // Capturer le pointer pour recevoir tous les événements même hors de l'élément
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    touchStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      scrollLeft: container.scrollLeft,
      pointerId: e.pointerId
    };
    isTouchSwipingRef.current = false;
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!touchStartRef.current || e.pointerType === 'mouse') return;
    const container = containerRef.current;
    if (!container) return;

    const dx = e.clientX - touchStartRef.current.x;
    const dy = e.clientY - touchStartRef.current.y;

    // Dès qu'on détecte un mouvement horizontal, on suit le doigt
    if (Math.abs(dx) > 5) {
      // Si c'est principalement horizontal, activer le swipe
      if (Math.abs(dx) > Math.abs(dy)) {
        isTouchSwipingRef.current = true;
        // Suivi du doigt en temps réel
        container.scrollLeft = touchStartRef.current.scrollLeft - dx;
      }
    }
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!touchStartRef.current || e.pointerType === 'mouse') return;

    const dx = e.clientX - touchStartRef.current.x;
    const dy = e.clientY - touchStartRef.current.y;

    // Swipe horizontal détecté
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      const maxIndex = lastDesktopEmpty ? children.length - 1 : children.length;

      if (dx < 0 && currentIndex < maxIndex) {
        // Swipe vers la gauche = desktop suivant
        userScrollingRef.current = true;
        onChangeIndex(currentIndex + 1);
      } else if (dx > 0 && currentIndex > 0) {
        // Swipe vers la droite = desktop précédent
        userScrollingRef.current = true;
        onChangeIndex(currentIndex - 1);
      }

      // Forcer le scroll vers le bon desktop
      const container = containerRef.current;
      if (container) {
        const targetIndex = dx < 0
          ? Math.min(currentIndex + 1, maxIndex)
          : Math.max(currentIndex - 1, 0);
        container.scrollTo({ left: targetIndex * container.clientWidth, behavior: 'smooth' });
      }
    }

    // Libérer le pointer capture
    if (touchStartRef.current) {
      try {
        (e.target as HTMLElement).releasePointerCapture(touchStartRef.current.pointerId);
      } catch (_) { /* ignore */ }
    }

    touchStartRef.current = null;
    isTouchSwipingRef.current = false;
  }, [children.length, currentIndex, lastDesktopEmpty, onChangeIndex]);

  const handlePointerCancel = useCallback((e: React.PointerEvent) => {
    if (touchStartRef.current) {
      (e.target as HTMLElement).releasePointerCapture(touchStartRef.current.pointerId);
    }
    touchStartRef.current = null;
    isTouchSwipingRef.current = false;
  }, []);

  const bgClass = isDark
    ? 'bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950'
    : 'bg-gradient-to-br from-neutral-100 via-neutral-50 to-white';

  return (
    <div
      ref={containerRef}
      className={`w-full h-screen overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide overscroll-x-none ${bgClass}`}
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        touchAction: 'none', // On gère tout manuellement pour le touch
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      <div
        className="flex h-full"
        style={{ width: `${(children.length + (lastDesktopEmpty ? 0 : 1)) * 100}vw` }}
      >
        {children.map((child, index) => (
          <div
            key={index}
            className="w-screen h-full flex-shrink-0 snap-center"
          >
            {child}
          </div>
        ))}
        {/* Slot virtuel pour créer un nouveau desktop (seulement si le dernier n'est pas vide) */}
        {!lastDesktopEmpty && <div className="w-screen h-full flex-shrink-0 snap-center" />}
      </div>
    </div>
  );
}
