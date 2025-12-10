import type { Desktop } from '../types/config';

interface DesktopNavigatorProps {
    desktops: Desktop[];
    currentDesktopId: string;
    onSwitchDesktop: (desktopId: string) => void;
    onAddDesktop: () => void;
    isDark: boolean;
    lastDesktopEmpty: boolean;
}

export function DesktopNavigator({
    desktops,
    currentDesktopId,
    onSwitchDesktop,
    onAddDesktop,
    isDark,
    lastDesktopEmpty,
}: DesktopNavigatorProps) {
    const currentIndex = desktops.findIndex(d => d.id === currentDesktopId);

    const handleDotClick = (index: number) => {
        if (index < desktops.length) {
            // Switch to existing desktop
            onSwitchDesktop(desktops[index].id);
        } else {
            // Create new desktop (clicking on the "+" dot)
            onAddDesktop();
        }
    };

    // Show current desktops + one extra dot for creating new desktop (only if last is not empty)
    const totalDots = desktops.length + (lastDesktopEmpty ? 0 : 1);

    return (
        <div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2"
        >
            {Array.from({ length: totalDots }).map((_, index) => {
                const isLast = index === desktops.length;
                const isCurrent = index === currentIndex;
                const hasContent = !isLast && desktops[index]?.blocks.length > 0;

                return (
                    <button
                        key={index}
                        onClick={() => handleDotClick(index)}
                        className={`rounded-full transition-all cursor-pointer ${isLast
                                ? // "+" dot for creating new desktop - always gray
                                isDark
                                    ? 'w-2 h-2 bg-neutral-600 hover:bg-neutral-500 hover:scale-125'
                                    : 'w-2 h-2 bg-neutral-400 hover:bg-neutral-500 hover:scale-125'
                                : isCurrent
                                    ? // Current desktop - elongated, black/white if has content, gray if empty
                                    hasContent
                                        ? isDark
                                            ? 'w-6 h-2 bg-neutral-300'
                                            : 'w-6 h-2 bg-neutral-900'
                                        : isDark
                                            ? 'w-6 h-2 bg-neutral-600'
                                            : 'w-6 h-2 bg-neutral-400'
                                    : // Other desktops - black/white if has content, gray if empty
                                    hasContent
                                        ? isDark
                                            ? 'w-2 h-2 bg-neutral-300 hover:bg-neutral-400 hover:scale-125'
                                            : 'w-2 h-2 bg-neutral-900 hover:bg-neutral-800 hover:scale-125'
                                        : isDark
                                            ? 'w-2 h-2 bg-neutral-600 hover:bg-neutral-500 hover:scale-125'
                                            : 'w-2 h-2 bg-neutral-400 hover:bg-neutral-500 hover:scale-125'
                            }`}
                        title={isLast ? 'New desktop' : `Desktop ${index + 1}`}
                    />
                );
            })}
        </div>
    );
}
