import { useEffect, useRef } from 'react';

interface UseSwipeOptions {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    minSwipeDistance?: number;
}

export function useSwipe({
    onSwipeLeft,
    onSwipeRight,
    minSwipeDistance = 50
}: UseSwipeOptions) {
    const touchStartX = useRef<number>(0);
    const touchEndX = useRef<number>(0);

    useEffect(() => {
        const handleTouchStart = (e: TouchEvent) => {
            touchStartX.current = e.touches[0].clientX;
        };

        const handleTouchMove = (e: TouchEvent) => {
            touchEndX.current = e.touches[0].clientX;
        };

        const handleTouchEnd = () => {
            const distance = touchStartX.current - touchEndX.current;
            const absDistance = Math.abs(distance);

            if (absDistance > minSwipeDistance) {
                if (distance > 0) {
                    // Swipe left
                    onSwipeLeft?.();
                } else {
                    // Swipe right
                    onSwipeRight?.();
                }
            }
        };

        // Mouse/trackpad support
        let mouseStartX = 0;
        let isMouseDown = false;

        const handleMouseDown = (e: MouseEvent) => {
            isMouseDown = true;
            mouseStartX = e.clientX;
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!isMouseDown) return;

            const distance = mouseStartX - e.clientX;
            const absDistance = Math.abs(distance);

            // Provide visual feedback during drag (optional)
            if (absDistance > minSwipeDistance) {
                // Could add visual feedback here
            }
        };

        const handleMouseUp = (e: MouseEvent) => {
            if (!isMouseDown) return;
            isMouseDown = false;

            const distance = mouseStartX - e.clientX;
            const absDistance = Math.abs(distance);

            if (absDistance > minSwipeDistance) {
                if (distance > 0) {
                    onSwipeLeft?.();
                } else {
                    onSwipeRight?.();
                }
            }
        };

        // Add event listeners
        document.addEventListener('touchstart', handleTouchStart);
        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('touchend', handleTouchEnd);
        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [onSwipeLeft, onSwipeRight, minSwipeDistance]);
}
