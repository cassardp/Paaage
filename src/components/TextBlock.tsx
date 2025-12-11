import { useState, useRef, useEffect } from 'react';
import { LinkifyText } from './LinkifyText';
import type { Config } from '../types/config';

interface TextBlockProps {
    blockId: string;
    content: string;
    onUpdate: (blockId: string, content: string) => void;
    isDark?: boolean;
    isDragging?: boolean;
    isGrabHovering?: boolean;
    isSelected?: boolean;
    config: Config;
}

export function TextBlock({ blockId, content, onUpdate, isDark = true, isDragging = false, isGrabHovering = false, isSelected = false, config }: TextBlockProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(content);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const valueRef = useRef(value);

    // Keep ref up to date
    useEffect(() => {
        valueRef.current = value;
    }, [value]);

    useEffect(() => {
        setValue(content);
    }, [content]);

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
            // Place cursor at end of text instead of selecting all
            const length = textareaRef.current.value.length;
            textareaRef.current.setSelectionRange(length, length);
        }
    }, [isEditing]);

    // Auto-save with debounce
    useEffect(() => {
        if (value === content) return;

        const timeout = setTimeout(() => {
            onUpdate(blockId, value);
        }, 1000);

        return () => clearTimeout(timeout);
    }, [value, blockId, onUpdate, content]);

    const handleBlur = () => {
        setIsEditing(false);
        if (value !== content) {
            onUpdate(blockId, value);
        }
    };

    const handleClick = () => {
        setIsEditing(true);
    };

    const textClass = isDark ? 'text-neutral-400' : 'text-neutral-500';
    const placeholderClass = isDark ? 'placeholder-neutral-500' : 'placeholder-neutral-400';
    const bgClass = isDark ? 'bg-neutral-900/50 backdrop-blur-sm' : 'bg-white/90 backdrop-blur-sm';
    const borderClass = isDark ? 'border-neutral-700' : 'border-neutral-200';
    const shadowClass = (isDragging || isSelected)
        ? (isDark ? 'shadow-2xl shadow-black/50' : 'shadow-2xl shadow-black/20')
        : '';

    // Show wrapper when editing, dragging, hovering, or selected
    const showWrapper = isEditing || isDragging || isGrabHovering || isSelected;

    if (isEditing) {
        return (
            <div className={`w-full h-full p-4 rounded-[12px] border ${bgClass} ${borderClass} ${shadowClass}`}>
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onBlur={handleBlur}
                    placeholder="Enter text..."
                    className={`w-full h-full resize-none bg-transparent border-none outline-none text-sm ${textClass} ${placeholderClass}`}
                />
            </div>
        );
    }

    // Read mode with wrapper (when hovering/dragging/selected)
    if (showWrapper) {
        return (
            <div
                onClick={handleClick}
                className={`w-full h-full p-4 rounded-[12px] border ${bgClass} ${borderClass} ${shadowClass} cursor-pointer text-sm overflow-hidden whitespace-pre-wrap ${textClass}`}
            >
                {value ? (
                    <LinkifyText text={value} isDark={isDark} config={config} />
                ) : (
                    <span className={isDark ? 'text-neutral-500' : 'text-neutral-400'}>
                        Click to add text
                    </span>
                )}
            </div>
        );
    }

    // Read mode without wrapper (idle state)
    return (
        <div
            onClick={handleClick}
            className={`w-full h-full p-4 cursor-pointer text-sm rounded-[12px] border border-transparent overflow-hidden whitespace-pre-wrap ${textClass}`}
        >
            {value ? (
                <LinkifyText text={value} isDark={isDark} config={config} />
            ) : (
                <span className={isDark ? 'text-neutral-500' : 'text-neutral-400'}>
                    Click to add text
                </span>
            )}
        </div>
    );
}
