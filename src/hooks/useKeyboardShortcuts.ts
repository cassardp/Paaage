import { useEffect } from 'react';

interface KeyboardShortcutsProps {
  onToggleLock: () => void;
  onToggleHidden: () => void;
  onUndo: () => void;
}

export function useKeyboardShortcuts({ onToggleLock, onToggleHidden, onUndo }: KeyboardShortcutsProps) {
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
      } else if (e.shiftKey && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        onUndo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleLock, onToggleHidden, onUndo]);
}
