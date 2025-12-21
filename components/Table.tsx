import React, { useRef } from 'react';
import { Song, UserDetails } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import useScrollPersistence from '@/hooks/ui/useScrollPersistence';
import { useSort, SortDirection } from '@/hooks/data/useSort';
import SongRow from './SongRow';

interface TableProps {
    songs: Song[];
    onPlay: (id: number) => void;
    persistenceKey?: string;
    playlistId?: string;
    isOwner?: boolean;
    onLoadMore?: () => void;
    hasMore?: boolean;
}

type SortField = 'title' | 'artist' | 'album' | 'duration';

interface SortHeaderProps {
    label: string;
    field: SortField;
    currentSortField: SortField;
    sortDirection: SortDirection;
    onSort: (field: SortField) => void;
    className?: string;
}

const SortHeader: React.FC<SortHeaderProps> = ({ label, field, currentSortField, sortDirection, onSort, className = "" }) => {
    const isActive = currentSortField === field;

    return (
        <button
            onClick={() => onSort(field as SortField)}
            className={`flex items-center gap-1 hover:text-foreground transition-colors ${isActive ? 'text-foreground' : 'text-muted-foreground'} ${className}`}
        >
            <span className="font-medium text-sm">{label}</span>
            {isActive ? (
                sortDirection === 'asc' ? (
                    <ArrowUp className="h-4 w-4" />
                ) : (
                    <ArrowDown className="h-4 w-4" />
                )
            ) : ("")}
        </button>
    );
};

const Table: React.FC<TableProps> = ({
    songs,
    onPlay,
    persistenceKey,
    playlistId,
    isOwner = true,
    onLoadMore,
    hasMore: propsHasMore
}) => {
    const {
        sortField,
        sortDirection,
        handleSort,
        sortedData: sortedSongs
    } = useSort<Song>({
        data: songs,
        initialField: null
    });

    const loadingMoreRef = useRef(false);
    const onLoadMoreRef = useRef(onLoadMore);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    useScrollPersistence(persistenceKey || "", scrollContainerRef, !!persistenceKey);

    // Virtual scrolling
    const rowVirtualizer = useVirtualizer({
        count: sortedSongs.length,
        getScrollElement: () => scrollContainerRef.current,
        estimateSize: () => 64, // Approximate row height
        overscan: 10, // Render 10 extra items above and below viewport
    });

    const virtualItems = rowVirtualizer.getVirtualItems();

    // Trigger load more when scrolling near the end using scroll event
    React.useEffect(() => {
        if (!propsHasMore) return;

        const scrollElement = scrollContainerRef.current;
        if (!scrollElement) return;

        const handleScroll = () => {
            if (loadingMoreRef.current || !onLoadMoreRef.current) return;

            const { scrollTop, scrollHeight, clientHeight } = scrollElement;
            const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

            // Load more when scrolled 80% through the content
            if (scrollPercentage > 0.8) {
                loadingMoreRef.current = true;
                onLoadMoreRef.current();
                // Reset loading flag after a delay to allow for next load
                setTimeout(() => {
                    loadingMoreRef.current = false;
                }, 1000);
            }
        };

        scrollElement.addEventListener('scroll', handleScroll, { passive: true });
        return () => scrollElement.removeEventListener('scroll', handleScroll);
    }, [propsHasMore]);

    return (
        <div className="h-full w-full">
            <div className="h-full">
                <Card className="bg-card/60 border-border h-full flex flex-col">
                    <CardContent ref={scrollContainerRef} className="p-0 flex-1 scrollbar-hide overflow-auto">
                        {/* Sticky Sort Headers */}
                        <div className="sticky top-0 z-10 rounded-lg grid grid-cols-[auto_auto_1fr_auto_auto] md:grid-cols-[auto_auto_minmax(200px,1fr)_minmax(170px,1fr)_90px_minmax(150px,1fr)_auto_auto] items-center gap-3 px-6 py-3 border-b border-border bg-card backdrop-blur-sm">
                            <div className="text-start">
                                <span className="text-xs text-muted-foreground font-medium">#</span>
                            </div>
                            <div className="w-[52px]"></div>
                            <SortHeader
                                label="Track"
                                field="title"
                                currentSortField={sortField as SortField}
                                sortDirection={sortDirection}
                                onSort={handleSort as (field: string | null) => void}
                            />
                            <SortHeader
                                label="Artist"
                                field="artist"
                                currentSortField={sortField as SortField}
                                sortDirection={sortDirection}
                                onSort={handleSort as (field: string | null) => void}
                                className="hidden md:flex"
                            />
                            <SortHeader
                                label="Duration"
                                field="duration"
                                currentSortField={sortField as SortField}
                                sortDirection={sortDirection}
                                onSort={handleSort as (field: string | null) => void}
                                className="hidden md:flex justify-center"
                            />
                            <SortHeader
                                label="Album"
                                field="album"
                                currentSortField={sortField as SortField}
                                sortDirection={sortDirection}
                                onSort={handleSort as (field: string | null) => void}
                                className="hidden md:flex"
                            />
                            <div className="w-8"></div>
                            <div className="w-8"></div>
                        </div>

                        {/* Virtual Song Rows */}
                        <div
                            className="relative px-3 md:px-5"
                            style={{
                                height: `${rowVirtualizer.getTotalSize()}px`,
                            }}
                        >
                            {virtualItems.map((virtualRow) => {
                                const song = sortedSongs[virtualRow.index];
                                return (
                                    <div
                                        key={virtualRow.key}
                                        className="border-b border-border last:border-b-0 px-1 absolute top-0 left-0 w-full"
                                        style={{
                                            height: `${virtualRow.size}px`,
                                            transform: `translateY(${virtualRow.start}px)`,
                                        }}
                                    >
                                        <SongRow
                                            song={song}
                                            index={virtualRow.index}
                                            onPlay={onPlay}
                                            playlistId={playlistId}
                                            isOwner={isOwner}
                                            addedBy={(song as Song & { added_by_user?: UserDetails }).added_by_user}
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        {/* Loading Indicator */}
                        {propsHasMore && onLoadMore && (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                <span className="ml-2 text-sm text-muted-foreground">Loading more songs...</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Table;