import type { ReactNode } from 'react';

interface BlockWrapperProps {
  children: ReactNode;
  isDragging?: boolean;
  isDark?: boolean;
}

export function BlockWrapper({ children, isDragging, isDark = true }: BlockWrapperProps) {
  const bgClass = isDark ? 'bg-neutral-900/50' : 'bg-white/90';
  const borderClass = isDark 
    ? 'border-neutral-700 hover:border-neutral-600' 
    : 'border-neutral-200 hover:border-neutral-300';
  const textClass = isDark ? 'text-neutral-200' : 'text-neutral-800';
  const shadowClass = isDragging 
    ? (isDark ? 'shadow-2xl shadow-black/50' : 'shadow-2xl shadow-black/20') 
    : '';

  return (
    <div
      className={`relative w-full h-full p-4 backdrop-blur-sm rounded-[12px] transition-all duration-200
                 border ${bgClass} ${borderClass} ${shadowClass}`}
    >
      <div className={`h-full overflow-hidden ${textClass}`}>
        {children}
      </div>
    </div>
  );
}
