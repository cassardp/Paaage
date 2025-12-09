import { useRef, useEffect, type ReactNode } from 'react';

interface DesktopCarouselProps {
  children: ReactNode[];
  currentIndex: number;
  onChangeIndex: (index: number) => void;
  isDark: boolean;
}

export function DesktopCarousel({
  children,
  currentIndex,
  onChangeIndex,
  isDark
}: DesktopCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isAnimatingRef = useRef(false);
  const animationIdRef = useRef<number | null>(null);
  const lastIndexRef = useRef(currentIndex);

  // Fonction pour annuler l'animation en cours
  const cancelAnimation = () => {
    if (animationIdRef.current !== null) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }
    if (containerRef.current) {
      containerRef.current.style.scrollSnapType = 'x mandatory';
    }
    isAnimatingRef.current = false;
  };

  // Scroll vers le desktop actuel quand l'index change (via clavier ou dots)
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const targetScroll = currentIndex * container.clientWidth;
    
    // Seulement si le changement vient d'ailleurs (pas du scroll utilisateur)
    if (Math.abs(container.scrollLeft - targetScroll) > 10) {
      // Annuler toute animation précédente
      cancelAnimation();
      
      isAnimatingRef.current = true;
      
      const from = container.scrollLeft;
      const distance = targetScroll - from;
      const duration = 500; // Durée réduite pour plus de réactivité
      const start = performance.now();
      
      // Désactiver le snap pendant l'animation
      container.style.scrollSnapType = 'none';
      
      // Easing ease-out cubic
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      
      const animate = (now: number) => {
        // Vérifier si l'animation a été annulée
        if (!isAnimatingRef.current) return;
        
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        container.scrollLeft = from + distance * easeOutCubic(progress);
        
        if (progress < 1) {
          animationIdRef.current = requestAnimationFrame(animate);
        } else {
          container.scrollLeft = targetScroll;
          container.style.scrollSnapType = 'x mandatory';
          isAnimatingRef.current = false;
          animationIdRef.current = null;
        }
      };
      
      animationIdRef.current = requestAnimationFrame(animate);
    }
    
    lastIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Bloquer le scroll diagonal (biais) et annuler l'animation si l'utilisateur scrolle
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);
      
      // Si l'utilisateur scrolle horizontalement pendant une animation, l'annuler
      if (isAnimatingRef.current && absX > 5) {
        cancelAnimation();
      }
      
      // Si le scroll est trop diagonal ou principalement vertical, bloquer le scroll horizontal
      // Ratio: deltaX doit être au moins 2x plus grand que deltaY pour être considéré horizontal
      if (absY > 5 && absX < absY * 2) {
        e.preventDefault();
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Mettre à jour l'index pendant le scroll (dès qu'on dépasse 50%)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // Ne pas mettre à jour l'index pendant l'animation programmatique
      if (isAnimatingRef.current) return;
      
      const scrollPosition = container.scrollLeft;
      const pageWidth = container.clientWidth;
      const newIndex = Math.round(scrollPosition / pageWidth);
      
      // Mettre à jour l'index si changé
      if (newIndex !== lastIndexRef.current && newIndex >= 0 && newIndex < children.length) {
        lastIndexRef.current = newIndex;
        onChangeIndex(newIndex);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [children.length, onChangeIndex]);

  // Cleanup de l'animation au démontage
  useEffect(() => {
    return () => {
      cancelAnimation();
    };
  }, []);

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
        style={{ width: `${children.length * 100}vw` }}
      >
        {children.map((child, index) => (
          <div
            key={index}
            className="w-screen h-full flex-shrink-0 snap-center"
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
