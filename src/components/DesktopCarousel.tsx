import { useRef, useEffect, type ReactNode } from 'react';

interface DesktopCarouselProps {
  children: ReactNode[];
  currentIndex: number;
  onChangeIndex: (index: number) => void;
  isDark: boolean;
  lastDesktopEmpty: boolean;
}

export function DesktopCarousel({
  children,
  currentIndex,
  onChangeIndex,
  isDark,
  lastDesktopEmpty
}: DesktopCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastIndexRef = useRef(currentIndex);

  // Mettre à jour lastIndexRef quand currentIndex change
  useEffect(() => {
    lastIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Scroll vers le desktop actuel quand l'index change (via clavier ou dots)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
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
      
      // Mettre à jour l'index immédiatement
      if (clampedIndex !== lastIndexRef.current) {
        lastIndexRef.current = clampedIndex;
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
  }, [children.length, onChangeIndex, lastDesktopEmpty]);

  const bgClass = isDark
    ? 'bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950'
    : 'bg-gradient-to-br from-neutral-100 via-neutral-50 to-white';

  return (
    <div
      ref={containerRef}
      className={`w-full h-screen overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide ${bgClass}`}
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
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
