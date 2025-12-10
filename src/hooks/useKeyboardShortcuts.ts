import { useEffect } from 'react';

interface KeyboardShortcutsProps {
  onToggleLock: () => void;
  onToggleHidden: () => void;
  onToggleGrid: () => void;
  onUndo: () => void;
  onNavigateLeft?: () => void;
  onNavigateRight?: () => void;
}

export function useKeyboardShortcuts({
  onToggleLock,
  onToggleHidden,
  onToggleGrid,
  onUndo,
  onNavigateLeft,
  onNavigateRight
}: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorer si on est dans un input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        onToggleLock();
      } else if (e.shiftKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        onToggleHidden();
      } else if (e.shiftKey && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        onToggleGrid();
      } else if (e.shiftKey && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        onUndo();
      } else if (e.key === 'ArrowLeft' && onNavigateLeft) {
        e.preventDefault();
        onNavigateLeft();
      } else if (e.key === 'ArrowRight' && onNavigateRight) {
        e.preventDefault();
        onNavigateRight();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleLock, onToggleHidden, onToggleGrid, onUndo, onNavigateLeft, onNavigateRight]);
}
