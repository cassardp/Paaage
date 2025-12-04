import type { ReactNode } from 'react';
import type { Block } from '../types/config';
import { CELL_SIZE } from '../lib/defaultConfig';

interface MobileLayoutProps {
  blocks: Block[];
  renderBlock: (block: Block) => ReactNode;
  isDark?: boolean;
}

export function MobileLayout({ blocks, renderBlock, isDark = true }: MobileLayoutProps) {
  // Trier les blocs par position Y puis X
  const sortedBlocks = [...blocks].sort((a, b) => {
    if (a.layout.y !== b.layout.y) return a.layout.y - b.layout.y;
    return a.layout.x - b.layout.x;
  });

  const bgClass = isDark ? 'bg-neutral-950' : 'bg-neutral-100';

  return (
    <div className={`min-h-screen ${bgClass} p-4`}>
      <div className="flex flex-col gap-4">
        {sortedBlocks.map((block) => {
          // Garder la hauteur basée sur la grille
          const height = block.layout.h * CELL_SIZE;
          
          return (
            <div
              key={block.id}
              style={{ height, minHeight: height }}
              className="w-full"
            >
              {renderBlock(block)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
