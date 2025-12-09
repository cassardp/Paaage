import { useState, useEffect } from 'react';

// Breakpoint constants
export const MOBILE_MAX = 768;
export const TABLET_MAX = 1024;

// Base cell size for desktop
const BASE_CELL_SIZE = 16;

export interface ResponsiveState {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    width: number;
    height: number;
    cellSize: number;
    gridColumns: number;
}

/**
 * Calculate responsive cell size based on viewport width
 * Mobile: larger cells for better touch targets
 * Tablet: medium cells
 * Desktop: base cell size
 */
function getResponsiveCellSize(width: number): number {
    if (width < MOBILE_MAX) {
        // Mobile: larger cells (20px) for better touch
        return 20;
    } else if (width < TABLET_MAX) {
        // Tablet: medium cells (18px)
        return 18;
    }
    // Desktop: base size
    return BASE_CELL_SIZE;
}

/**
 * Calculate number of grid columns based on viewport width and cell size
 */
function getGridColumns(width: number, cellSize: number): number {
    return Math.floor(width / cellSize);
}

/**
 * Hook to detect responsive breakpoints and provide responsive utilities
 */
export function useResponsive(): ResponsiveState {
    const [state, setState] = useState<ResponsiveState>(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const cellSize = getResponsiveCellSize(width);

        return {
            isMobile: width < MOBILE_MAX,
            isTablet: width >= MOBILE_MAX && width < TABLET_MAX,
            isDesktop: width >= TABLET_MAX,
            width,
            height,
            cellSize,
            gridColumns: getGridColumns(width, cellSize),
        };
    });

    useEffect(() => {
        let timeoutId: number;

        const handleResize = () => {
            // Debounce resize events
            clearTimeout(timeoutId);
            timeoutId = window.setTimeout(() => {
                const width = window.innerWidth;
                const height = window.innerHeight;
                const cellSize = getResponsiveCellSize(width);

                setState({
                    isMobile: width < MOBILE_MAX,
                    isTablet: width >= MOBILE_MAX && width < TABLET_MAX,
                    isDesktop: width >= TABLET_MAX,
                    width,
                    height,
                    cellSize,
                    gridColumns: getGridColumns(width, cellSize),
                });
            }, 150);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return state;
}
