import type { ReactNode } from 'react';

interface BlockWrapperProps {
  children: ReactNode;
  isDragging?: boolean;
  isGrabHovering?: boolean;
  isDark?: boolean;
  compact?: boolean;
  overflowVisible?: boolean;
}

export function BlockWrapper({ children, isDragging, isGrabHovering, isDark = true, compact = false, overflowVisible = false }: BlockWrapperProps) {
  const bgClass = isDark ? 'bg-neutral-900/50 backdrop-blur-sm' : 'bg-white/90 backdrop-blur-sm';
  const isHighlighted = isDragging || isGrabHovering;
  const borderClass = isDark 
    ? (isHighlighted ? 'border-neutral-600' : 'border-neutral-700')
    : (isHighlighted ? 'border-neutral-300' : 'border-neutral-200');
  const textClass = isDark ? 'text-neutral-200' : 'text-neutral-700';
  const shadowClass = isDragging 
    ? (isDark ? 'shadow-2xl shadow-black/50' : 'shadow-2xl shadow-black/20') 
    : '';
  const paddingClass = compact ? 'py-1 px-4' : 'p-4';

  return (
    <div
      className={`relative w-full h-full ${paddingClass} rounded-[12px] transition-all duration-200
                 border ${bgClass} ${borderClass} ${shadowClass}`}
    >
      <div className={`h-full ${overflowVisible ? 'overflow-visible' : 'overflow-hidden'} ${textClass}`}>
        {children}
      </div>
    </div>
  );
}
