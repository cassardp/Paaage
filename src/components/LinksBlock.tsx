import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X, Upload } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type Modifier,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { LinkItem } from '../types/config';
import { generateId } from '../lib/utils';

interface LinksBlockProps {
  blockId: string;
  items: LinkItem[];
  width: number;
  height: number;
  onUpdate: (blockId: string, items: LinkItem[]) => void;
  isDark?: boolean;
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

// Composant lien sortable
interface SortableLinkProps {
  item: LinkItem;
  isDark: boolean;
  onRemove: (id: string) => void;
}

function SortableLink({ item, isDark, onRemove }: SortableLinkProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  };

  const textClass = isDark ? 'text-neutral-400 hover:text-neutral-400' : 'text-neutral-600 hover:text-neutral-400';
  const mutedClass = isDark ? 'text-neutral-500' : 'text-neutral-400';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group/link flex items-center gap-1 flex-shrink-0 px-2 py-0.5 -mx-2 cursor-grab active:cursor-grabbing rounded"
      {...attributes}
      {...listeners}
    >
      <a
        href={item.url}
        onPointerDown={(e) => e.stopPropagation()}
        className={`text-sm leading-none whitespace-nowrap transition-colors cursor-pointer ${textClass}`}
      >
        {item.label}
      </a>
      <button
        onClick={() => onRemove(item.id)}
        onPointerDown={(e) => e.stopPropagation()}
        className={`opacity-0 group-hover/link:opacity-100 p-0.5 cursor-pointer transition-opacity delay-[1000ms] ${mutedClass}`}
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}


export function LinksBlock({ blockId, items, width, height, onUpdate, isDark = true }: LinksBlockProps) {
  const [newUrl, setNewUrl] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [showForm, setShowForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Orientation basée sur le ratio du bloc
  const isHorizontal = width > height * 2;

  // Modifier pour restreindre le mouvement à un seul axe
  const restrictToAxis: Modifier = ({ transform }) => ({
    ...transform,
    x: isHorizontal ? transform.x : 0,
    y: isHorizontal ? 0 : transform.y,
    scaleX: 1,
    scaleY: 1,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      onUpdate(blockId, arrayMove(items, oldIndex, newIndex));
    }
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
  const actions = (
    <div className={`flex-shrink-0 flex items-center gap-1 ${isHorizontal ? '' : 'pt-1'}`}>
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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToAxis]}
      onDragEnd={handleDragEnd}
    >
      <div 
        className={`scrollbar-hide ${isHorizontal ? 'h-full flex items-center gap-4 overflow-x-auto overflow-y-hidden' : 'h-full flex flex-col gap-1 overflow-auto'}`}
      >
        <SortableContext
          items={items.map(item => item.id)}
          strategy={isHorizontal ? horizontalListSortingStrategy : verticalListSortingStrategy}
        >
          {items.map(item => (
            <SortableLink
              key={item.id}
              item={item}
              isDark={isDark}
              onRemove={removeLink}
            />
          ))}
        </SortableContext>
        {actions}
      </div>
    </DndContext>

    {/* Modal formulaire ajout lien - rendu via portal pour être centré sur l'écran */}
    {showForm && createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowForm(false)}>
        <div className={`p-3 rounded-lg border shadow-xl w-72 ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'}`} onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="URL (ex: google.com)"
            autoFocus
            className={`w-full px-3 py-2 mb-2 rounded border text-sm
              ${isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-300 placeholder-neutral-500' : 'bg-white border-neutral-300 text-neutral-700 placeholder-neutral-400'}
              focus:outline-none focus:border-[var(--accent-color)]`}
            onKeyDown={(e) => e.key === 'Enter' && addLink()}
          />
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Name (optional)"
            className={`w-full px-3 py-2 mb-2 rounded border text-sm
              ${isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-300 placeholder-neutral-500' : 'bg-white border-neutral-300 text-neutral-700 placeholder-neutral-400'}
              focus:outline-none focus:border-[var(--accent-color)]`}
            onKeyDown={(e) => e.key === 'Enter' && addLink()}
          />
          <button
            onClick={addLink}
            className="w-full py-2 rounded text-sm cursor-pointer bg-[var(--accent-color)] text-white font-medium"
          >
            Add
          </button>
        </div>
      </div>,
      document.body
    )}
    </>
  );
}
