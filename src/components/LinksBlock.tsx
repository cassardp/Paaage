import { useState, useRef } from 'react';
import { Plus, X, Upload } from 'lucide-react';
import { FormModal } from './FormModal';
import type { LinkItem, Config } from '../types/config';
import { generateId } from '../lib/utils';
import { getLinkTarget } from '../constants/links';

interface LinksBlockProps {
  blockId: string;
  items: LinkItem[];
  width: number;
  height: number;
  onUpdate: (blockId: string, items: LinkItem[]) => void;
  isDark?: boolean;
  config: Config;
}

// Parser HTML bookmarks (Safari/Chrome export)
function parseBookmarksHtml(html: string): LinkItem[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const links = doc.querySelectorAll('a[href]');
  return Array.from(links)
    .filter(a => {
      const href = a.getAttribute('href');
      return href && (href.startsWith('http://') || href.startsWith('https://'));
    })
    .map(a => ({
      id: generateId(),
      label: a.textContent?.trim() || new URL(a.getAttribute('href')!).hostname,
      url: a.getAttribute('href')!,
    }));
}

// Helper pour réordonner un tableau
function arrayMove<T>(array: T[], from: number, to: number): T[] {
  const newArray = [...array];
  const [item] = newArray.splice(from, 1);
  newArray.splice(to, 0, item);
  return newArray;
}

export function LinksBlock({ blockId, items, width, height, onUpdate, isDark = true, config }: LinksBlockProps) {
  const [newUrl, setNewUrl] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const startPosRef = useRef({ x: 0, y: 0 });
  const itemRectsRef = useRef<DOMRect[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingClickRef = useRef<{ url: string; target: string } | null>(null);
  const DRAG_THRESHOLD = 5;

  // Orientation basée sur le ratio du bloc
  const isHorizontal = width > height * 2;

  const handlePointerDown = (e: React.PointerEvent, index: number, url: string) => {
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    
    // Stocker l'URL pour un potentiel clic
    pendingClickRef.current = { url, target: getLinkTarget(config) };
    
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    
    if (containerRef.current) {
      const itemEls = containerRef.current.querySelectorAll('[data-link-index]');
      itemRectsRef.current = Array.from(itemEls).map(el => el.getBoundingClientRect());
    }
    
    startPosRef.current = { x: e.clientX, y: e.clientY };
    setDragOffset({ x: 0, y: 0 });
    setDragIndex(index);
    setHoverIndex(index);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragIndex === null) return;
    
    const offsetX = e.clientX - startPosRef.current.x;
    const offsetY = e.clientY - startPosRef.current.y;
    const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
    
    // Si on a bougé au-delà du seuil, c'est un drag, pas un clic
    if (distance > DRAG_THRESHOLD) {
      pendingClickRef.current = null;
      setIsDragging(true);
    }
    
    if (!isDragging && distance <= DRAG_THRESHOLD) return;
    
    setDragOffset({ x: offsetX, y: offsetY });
    
    // Trouver la nouvelle position basée sur les rects capturés
    const rects = itemRectsRef.current;
    if (rects.length === 0) return;
    
    let newHoverIndex = dragIndex;
    
    if (isHorizontal) {
      // Position actuelle du centre de l'élément draggé
      const dragRect = rects[dragIndex];
      const currentCenter = dragRect.left + dragRect.width / 2 + offsetX;
      
      for (let i = 0; i < rects.length; i++) {
        const rect = rects[i];
        const center = rect.left + rect.width / 2;
        if (i < dragIndex && currentCenter < center) {
          newHoverIndex = i;
          break;
        } else if (i > dragIndex && currentCenter > center) {
          newHoverIndex = i;
        }
      }
    } else {
      const dragRect = rects[dragIndex];
      const currentCenter = dragRect.top + dragRect.height / 2 + offsetY;
      
      for (let i = 0; i < rects.length; i++) {
        const rect = rects[i];
        const center = rect.top + rect.height / 2;
        if (i < dragIndex && currentCenter < center) {
          newHoverIndex = i;
          break;
        } else if (i > dragIndex && currentCenter > center) {
          newHoverIndex = i;
        }
      }
    }
    
    if (newHoverIndex !== hoverIndex) {
      setHoverIndex(newHoverIndex);
    }
  };

  const handlePointerUp = () => {
    // Si c'était un clic (pas de drag), ouvrir le lien
    if (pendingClickRef.current && !isDragging) {
      const { url, target } = pendingClickRef.current;
      window.open(url, target, 'noopener,noreferrer');
    }
    
    // Si c'était un drag, appliquer le réordonnement
    if (isDragging && dragIndex !== null && hoverIndex !== null && dragIndex !== hoverIndex) {
      onUpdate(blockId, arrayMove(items, dragIndex, hoverIndex));
    }
    
    pendingClickRef.current = null;
    setDragIndex(null);
    setHoverIndex(null);
    setDragOffset({ x: 0, y: 0 });
    itemRectsRef.current = [];
    setTimeout(() => setIsDragging(false), 50);
  };

  // Calcule le décalage visuel pour chaque élément
  const getTransform = (index: number): string => {
    if (dragIndex === null) return '';
    
    // L'élément draggé suit le curseur
    if (index === dragIndex) {
      return isHorizontal 
        ? `translateX(${dragOffset.x}px)` 
        : `translateY(${dragOffset.y}px)`;
    }
    
    if (hoverIndex === null || dragIndex === hoverIndex) return '';
    
    // Calculer l'offset basé sur la taille de l'élément draggé
    const dragRect = itemRectsRef.current[dragIndex];
    const offset = dragRect ? (isHorizontal ? dragRect.width + 16 : dragRect.height + 6) : 0;
    
    if (dragIndex < hoverIndex) {
      if (index > dragIndex && index <= hoverIndex) {
        return isHorizontal ? `translateX(-${offset}px)` : `translateY(-${offset}px)`;
      }
    } else {
      if (index >= hoverIndex && index < dragIndex) {
        return isHorizontal ? `translateX(${offset}px)` : `translateY(${offset}px)`;
      }
    }
    return '';
  };

  const addLink = () => {
    if (!newUrl.trim()) return;
    let url = newUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    const label = newLabel.trim() || new URL(url).hostname;
    const newItem: LinkItem = { id: generateId(), label, url };
    onUpdate(blockId, [...items, newItem]);
    setNewUrl('');
    setNewLabel('');
    setShowForm(false);
  };

  const removeLink = (itemId: string) => {
    onUpdate(blockId, items.filter(item => item.id !== itemId));
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const html = await file.text();
    const imported = parseBookmarksHtml(html);
    onUpdate(blockId, [...items, ...imported]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const mutedClass = isDark ? 'text-neutral-500' : 'text-neutral-400';

  // Actions (à la fin de la ligne/colonne)
  const borderClass = isDark ? 'border-neutral-700' : 'border-neutral-200';
  const actions = (
    <div className={`flex-shrink-0 flex items-center gap-1 ${borderClass} ${isHorizontal ? 'pl-6 border-l' : 'pt-2 mt-1 border-t'}`}>
      <button
        onClick={() => setShowForm(true)}
        className={`p-0.5 cursor-pointer ${mutedClass} hover:text-[var(--accent-color)]`}
        title="Add link"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => fileInputRef.current?.click()}
        className={`p-0.5 cursor-pointer ${mutedClass} hover:text-[var(--accent-color)]`}
        title="Import bookmarks (HTML)"
      >
        <Upload className="w-3.5 h-3.5" />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".html,.htm"
        onChange={handleImport}
        className="hidden"
      />
    </div>
  );

  return (
    <>
      <div
        ref={containerRef}
        className={`scrollbar-hide ${isHorizontal ? 'h-full flex items-center gap-4 overflow-x-auto overflow-y-hidden' : 'h-full flex flex-col gap-1.5 overflow-auto'}`}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {items.map((item, index) => {
          const isItemDragging = dragIndex === index;
          const textClass = isDark 
            ? `text-neutral-500 ${!isDragging ? 'hover:text-neutral-200' : ''}` 
            : `text-neutral-500 ${!isDragging ? 'hover:text-neutral-400' : ''}`;
          const mutedClass = isDark ? 'text-neutral-500' : 'text-neutral-400';
          
          return (
            <div
              key={item.id}
              data-link-index={index}
              onPointerDown={(e) => handlePointerDown(e, index, item.url)}
              style={{ 
                cursor: isItemDragging ? 'grabbing' : 'pointer',
                opacity: isItemDragging ? 0.5 : 1,
                touchAction: 'none',
                transform: getTransform(index),
                transition: isItemDragging ? 'none' : (dragIndex !== null ? 'transform 150ms ease' : 'none'),
                zIndex: isItemDragging ? 10 : 'auto',
              }}
              className="group/link relative flex items-center gap-1 flex-shrink-0 px-2 py-0.5 -mx-2 rounded select-none"
            >
              <span
                style={{ cursor: 'inherit' }}
                className={`text-sm leading-none whitespace-nowrap transition-colors ${textClass}`}
              >
                {item.label}
              </span>
              <button
                onClick={() => removeLink(item.id)}
                className={`opacity-0 group-hover/link:opacity-100 p-0.5 cursor-pointer transition-opacity delay-[1000ms] ${mutedClass}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
        {actions}
      </div>

      <FormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={addLink}
        submitLabel="Add Link"
        isDark={isDark}
        fields={[
          {
            label: 'URL',
            value: newUrl,
            onChange: setNewUrl,
            placeholder: 'google.com',
            autoFocus: true,
          },
          {
            label: 'Name',
            value: newLabel,
            onChange: setNewLabel,
            placeholder: 'My Link',
            optional: true,
          },
        ]}
      />
    </>
  );
}
