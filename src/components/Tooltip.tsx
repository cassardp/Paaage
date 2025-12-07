import { useState, useEffect, useRef } from 'react';

interface TooltipProps {
    text: string;
    visible: boolean;
    x: number;
    y: number;
    isDark?: boolean;
    delay?: number;
}

export function Tooltip({ text, visible, x, y, isDark = true, delay = 500 }: TooltipProps) {
    const [show, setShow] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (visible) {
            timeoutRef.current = setTimeout(() => setShow(true), delay);
        } else {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setShow(false);
        }
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [visible, delay]);

    if (!show) return null;

    return (
        <div
            className={`fixed z-50 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap pointer-events-none transition-opacity duration-200 backdrop-blur-sm ${isDark
                    ? 'bg-neutral-900/80 text-neutral-200 border border-neutral-700'
                    : 'bg-white/90 text-neutral-700 border border-neutral-200 shadow-lg'
                }`}
            style={{
                left: x,
                top: y,
                transform: 'translate(-50%, -100%) translateY(-8px)',
            }}
        >
            {text}
        </div>
    );
}
