import React, { useState, useMemo, useRef } from 'react';
import { Song } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import useScrollPersistence from '@/hooks/useScrollPersistence';
import SongRow from './SongRow';

interface TableProps {
    songs: Song[];
    onPlay: (id: number) => void;
    persistenceKey?: string;
    playlistId?: string;
}

type SortField = 'title' | 'artist' | 'album' | 'duration' | null;
type SortDirection = 'asc' | 'desc';

const items_per_page = 50;

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
            onClick={() => onSort(field)}
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

const Table: React.FC<TableProps> = ({ songs, onPlay, persistenceKey, playlistId }) => {
    const [sortField, setSortField] = useState<SortField>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    // Initialize displayCount with persisted value if available
    const [displayCount, setDisplayCount] = useState(() => {
        if (typeof window !== 'undefined' && persistenceKey) {
            const savedCount = sessionStorage.getItem(`count-${persistenceKey}`);
            if (savedCount) {
                return parseInt(savedCount, 10);
            }
        }
        return items_per_page;
    });

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    useScrollPersistence(persistenceKey || "", scrollContainerRef, !!persistenceKey);

    // Persist displayCount changes
    React.useEffect(() => {
        if (persistenceKey) {
            sessionStorage.setItem(`count-${persistenceKey}`, displayCount.toString());
        }
    }, [displayCount, persistenceKey]);

    const { ref: loadMoreRef, inView } = useInView({
        threshold: 0,
        rootMargin: '100px',
    });

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            setSortDirection(newDirection);
        }
        else {
            setSortField(field);
            setSortDirection('asc');
        }
        setDisplayCount(items_per_page);
    };

    const sortedSongs = useMemo(() => {
        if (!sortField) return songs;

        return [...songs].sort((a, b) => {
            let comparison = 0;

            switch (sortField) {
                case 'title':
                    comparison = (a.title || '').localeCompare(b.title || '');
                    break;
                case 'artist':
                    const artistA = a.artist?.[0] || '';
                    const artistB = b.artist?.[0] || '';
                    comparison = artistA.localeCompare(artistB);
                    break;
                case 'album':
                    comparison = (a.album || '').localeCompare(b.album || '');
                    break;
                case 'duration':
                    comparison = (a.duration || 0) - (b.duration || 0);
                    break;
            }

            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [songs, sortField, sortDirection]);

    const displayedSongs = useMemo(() => {
        return sortedSongs.slice(0, displayCount);
    }, [sortedSongs, displayCount]);

    const hasMore = displayCount < sortedSongs.length;

    React.useEffect(() => {
        if (inView && hasMore) {
            const timer = setTimeout(() => {
                const newCount = Math.min(displayCount + items_per_page, sortedSongs.length);
                setDisplayCount(newCount);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [inView, hasMore, sortedSongs.length, displayCount]);

    return (
        <div className="h-full w-full">
            <div className="h-full">
                <Card className="bg-card/60 border-border h-full flex flex-col">
                    <CardContent ref={scrollContainerRef} className="p-0 flex-1 scrollbar-hide overflow-auto">
                        {/* Sticky Sort Headers */}
                        <div className="sticky top-0 z-10 rounded-lg grid grid-cols-[auto_auto_1fr_auto_auto] md:grid-cols-[auto_auto_minmax(200px,1fr)_minmax(150px,1fr)_80px_minmax(150px,1fr)_auto_auto] items-center gap-3 px-8 py-3 border-b border-border bg-card backdrop-blur-sm">
                            <div className="w-8 text-center">
                                <span className="text-xs text-muted-foreground font-medium">#</span>
                            </div>
                            <div className="w-12"></div>
                            <SortHeader
                                label="Title"
                                field="title"
                                currentSortField={sortField}
                                sortDirection={sortDirection}
                                onSort={handleSort}
                            />
                            <SortHeader
                                label="Artist"
                                field="artist"
                                currentSortField={sortField}
                                sortDirection={sortDirection}
                                onSort={handleSort}
                                className="hidden md:flex"
                            />
                            <SortHeader
                                label="Duration"
                                field="duration"
                                currentSortField={sortField}
                                sortDirection={sortDirection}
                                onSort={handleSort}
                                className="hidden md:flex justify-center"
                            />
                            <SortHeader
                                label="Album"
                                field="album"
                                currentSortField={sortField}
                                sortDirection={sortDirection}
                                onSort={handleSort}
                                className="hidden md:flex"
                            />
                            <div className="w-8"></div>
                            <div className="w-8"></div>
                        </div>

                        {/* Song Rows */}
                        <div className="flex-1 overflow-y-auto px-3 md:px-5">
                            {displayedSongs.map((song, index) => (
                                <div key={song.id} className="border-b border-border last:border-b-0">
                                    <SongRow song={song} index={index} onPlay={onPlay} playlistId={playlistId} />
                                </div>
                            ))}

                            {/* Loading Sentinel */}
                            {hasMore && (
                                <div
                                    ref={loadMoreRef}
                                    className="flex items-center justify-center py-8"
                                >
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                    <span className="ml-2 text-sm text-muted-foreground">Loading more songs...</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
};

export default Table;