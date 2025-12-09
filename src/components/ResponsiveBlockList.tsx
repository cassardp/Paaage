import { Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import type { Block } from '../types/config';
import { BlockContent } from './BlockContent';
import type { Config } from '../types/config';

interface ResponsiveBlockListProps {
    blocks: Block[];
    onMoveBlock: (blockId: string, direction: 'up' | 'down') => void;
    onDeleteBlock: (blockId: string) => void;
    isDark: boolean;
    config: Config;
    onUpdateNote: (blockId: string, content: string) => void;
    onUpdateNoteTitle: (blockId: string, title: string) => void;
    onUpdateTodo: (blockId: string, items: any[]) => void;
    onUpdateTodoTitle: (blockId: string, title: string) => void;
    onUpdateWeatherCity: (blockId: string, city: string) => void;
    onUpdateClockCity: (blockId: string, city: string, timezone: string) => void;
    onUpdateStockSymbol: (blockId: string, symbol: string) => void;
    onUpdateStationUrl: (blockId: string, name: string, streamUrl: string) => void;
    onUpdateRssFeedUrl: (blockId: string, feedUrl: string) => void;
    onUpdateLinks: (blockId: string, items: any[]) => void;
    focusedNoteId: string | null;
    onNoteFocused: () => void;
}

export function ResponsiveBlockList({
    blocks,
    onMoveBlock,
    onDeleteBlock,
    isDark,
    config,
    onUpdateNote,
    onUpdateNoteTitle,
    onUpdateTodo,
    onUpdateTodoTitle,
    onUpdateWeatherCity,
    onUpdateClockCity,
    onUpdateStockSymbol,
    onUpdateStationUrl,
    onUpdateRssFeedUrl,
    onUpdateLinks,
    focusedNoteId,
    onNoteFocused,
}: ResponsiveBlockListProps) {
    const canMoveUp = (index: number) => index > 0;
    const canMoveDown = (index: number) => index < blocks.length - 1;

    return (
        <div className={`min-h-screen p-4 pb-32 ${isDark ? 'bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950' : 'bg-gradient-to-br from-neutral-100 via-neutral-50 to-white'}`}>
            <div className="max-w-2xl mx-auto space-y-3">
                {blocks.map((block, index) => {
                    const isCompact = block.type === 'bookmark' || block.type === 'station';

                    return (
                        <div
                            key={block.id}
                            className={`relative ${isDark ? 'bg-neutral-800/50' : 'bg-white/80'} backdrop-blur-sm rounded-2xl border ${isDark ? 'border-neutral-700' : 'border-neutral-200'} overflow-hidden`}
                        >
                            {/* Block Controls */}
                            <div className={`flex items-center gap-2 px-3 py-2 border-b ${isDark ? 'border-neutral-700' : 'border-neutral-200'}`}>
                                <div className="flex-1 flex items-center gap-2">
                                    <button
                                        onClick={() => onMoveBlock(block.id, 'up')}
                                        disabled={!canMoveUp(index)}
                                        className={`p-1 rounded ${canMoveUp(index)
                                            ? `${isDark ? 'hover:bg-neutral-700 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-500'} cursor-pointer`
                                            : 'opacity-30 cursor-not-allowed'
                                            }`}
                                    >
                                        <ChevronUp className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={() => onMoveBlock(block.id, 'down')}
                                        disabled={!canMoveDown(index)}
                                        className={`p-1 rounded ${canMoveDown(index)
                                            ? `${isDark ? 'hover:bg-neutral-700 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-500'} cursor-pointer`
                                            : 'opacity-30 cursor-not-allowed'
                                            }`}
                                    >
                                        <ChevronDown className="w-4 h-4" />
                                    </button>
                                </div>

                                <button
                                    onClick={() => onDeleteBlock(block.id)}
                                    className={`p-1 rounded ${isDark ? 'hover:bg-neutral-700 text-neutral-400 hover:text-red-400' : 'hover:bg-neutral-100 text-neutral-500 hover:text-red-500'} cursor-pointer`}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>


                            {/* Block Content */}
                            <div className={`${isCompact ? 'p-3 min-h-[80px]' : 'p-4 min-h-[120px]'} ${isDark ? 'bg-neutral-900/50 backdrop-blur-sm border-neutral-700' : 'bg-white/90 backdrop-blur-sm border-neutral-200'} rounded-xl overflow-x-auto`}>
                                <div className={`${isDark ? 'text-neutral-200' : 'text-neutral-800'}`}>
                                    <BlockContent
                                        block={block}
                                        searchEngine={config.settings.searchEngine}
                                        onUpdateNote={onUpdateNote}
                                        onUpdateNoteTitle={onUpdateNoteTitle}
                                        onUpdateTodo={onUpdateTodo}
                                        onUpdateTodoTitle={onUpdateTodoTitle}
                                        onUpdateWeatherCity={onUpdateWeatherCity}
                                        onUpdateClockCity={onUpdateClockCity}
                                        onUpdateStockSymbol={onUpdateStockSymbol}
                                        onUpdateStationUrl={onUpdateStationUrl}
                                        onUpdateRssFeedUrl={onUpdateRssFeedUrl}
                                        onUpdateLinks={onUpdateLinks}
                                        isDark={isDark}
                                        focusedNoteId={focusedNoteId}
                                        onNoteFocused={onNoteFocused}
                                        config={config}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}

                {blocks.length === 0 && (
                    <div className={`text-center py-12 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                        <p className="text-sm">No blocks yet</p>
                        <p className="text-xs mt-1">Tap the + button to add one</p>
                    </div>
                )}  </div>
        </div>
    );
}
