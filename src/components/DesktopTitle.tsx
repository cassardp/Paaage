import { useState, useRef, useEffect } from 'react';

const CELL_SIZE = 16; // Same as grid cell size

interface DesktopTitleProps {
    title?: string;
    onUpdateTitle: (title: string) => void;
    isDark: boolean;
}

export function DesktopTitle({ title, onUpdateTitle, isDark }: DesktopTitleProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(title || '');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleSave = () => {
        const trimmedValue = editValue.trim();
        onUpdateTitle(trimmedValue);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setEditValue(title || '');
            setIsEditing(false);
        }
    };

    const handleClick = () => {
        setEditValue(title || '');
        setIsEditing(true);
    };

    // Block-like styling
    const bgClass = isDark ? 'bg-neutral-900/50 backdrop-blur-sm' : 'bg-white/90 backdrop-blur-sm';
    const borderClass = isDark ? 'border-neutral-700' : 'border-neutral-200';
    const textClass = isDark ? 'text-neutral-400' : 'text-neutral-500';
    const placeholderClass = isDark ? 'placeholder-neutral-500' : 'placeholder-neutral-400';

    if (isEditing) {
        return (
            <div
                className="absolute z-0 left-1/2 -translate-x-1/2"
                style={{
                    top: `${CELL_SIZE}px`,
                    height: `${2 * CELL_SIZE}px`,
                }}
            >
                <div className={`${bgClass} border ${borderClass} rounded-[12px] h-full flex items-center justify-center px-4`}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={handleKeyDown}
                        placeholder="Desktop title"
                        className={`bg-transparent outline-none text-sm font-medium text-center uppercase tracking-wide whitespace-nowrap ${textClass} ${placeholderClass}`}
                        maxLength={50}
                        size={Math.max(10, editValue.length || 15)}
                    />
                </div>
            </div>
        );
    }

    return (
        <div
            className="absolute z-0 left-1/2 -translate-x-1/2"
            style={{
                top: `${CELL_SIZE}px`,
                height: `${2 * CELL_SIZE}px`,
            }}
        >
            <button
                onClick={handleClick}
                className={`h-full px-4 flex items-center justify-center text-sm font-medium uppercase tracking-wide whitespace-nowrap rounded-lg transition-all cursor-pointer ${textClass}`}
            >
                {title || 'Untitled Desktop'}
            </button>
        </div>
    );
}
