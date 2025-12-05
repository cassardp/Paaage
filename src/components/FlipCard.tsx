import { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';

interface FlipCardProps {
  children: ReactNode | ((onFlip: () => void) => ReactNode);
  editValue: string;
  onSave: (value: string) => void;
  validate?: (value: string) => Promise<boolean>;
  isDark?: boolean;
  placeholder?: string;
}

export function FlipCard({ 
  children, 
  editValue: initialValue, 
  onSave, 
  validate,
  isDark = true,
  placeholder = ''
}: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [editValue, setEditValue] = useState(initialValue);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(initialValue);
  }, [initialValue]);

  const handleFlip = () => {
    setIsFlipped(true);
    setEditValue(initialValue);
    setError(false);
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  const handleSave = async () => {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === initialValue) {
      setIsFlipped(false);
      return;
    }

    if (validate) {
      setValidating(true);
      setError(false);
      
      try {
        const isValid = await validate(trimmed);
        if (isValid) {
          onSave(trimmed);
          setIsFlipped(false);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setValidating(false);
      }
    } else {
      onSave(trimmed);
      setIsFlipped(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') setIsFlipped(false);
  };

  return (
    <div className="h-full [perspective:1000px]">
      <div 
        className={`relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
      >
        {/* Face avant */}
        <div className="absolute inset-0 [backface-visibility:hidden]">
          {typeof children === 'function' ? children(handleFlip) : children}
        </div>

        {/* Face arrière */}
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="h-full flex items-center justify-center">
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => { setEditValue(e.target.value); setError(false); }}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              disabled={validating}
              className={`bg-transparent border-none outline-none text-sm text-center ${error ? 'text-neutral-500' : isDark ? 'text-neutral-400' : 'text-neutral-500'}`}
              placeholder={placeholder}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
