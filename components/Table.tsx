"use client";

import React, { useState, useMemo } from 'react';
import { Song } from '@/types';
import LikeButton from '@/components/LikeButton';
import AlbumModal from './AlbumModal';
import useLoadImage from '@/hooks/useLoadImage';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Play, MoreHorizontal, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useInView } from 'react-intersection-observer';

interface TableProps {
    songs: Song[];
    onPlay: (id: number) => void;
}

type SortField = 'title' | 'artist' | 'album' | 'duration' | null;
type SortDirection = 'asc' | 'desc';

const items_per_page = 50;

const formatTime = (seconds: number | null): string => {
    if (seconds === null || seconds === undefined) return "--:--";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
};

interface SongRowProps {
    song: Song;
    index: number;
    onPlay: (id: number) => void;
    onAlbumClick: (album: string) => void;
}

const SongRow: React.FC<SongRowProps> = ({ song, index, onPlay, onAlbumClick }) => {
    const imageUrl = useLoadImage(song) || "/images/liked.png";
    const initials = (song.title || "?").slice(0, 2).toUpperCase();
    const router = useRouter();
    const artists = song.artist ? (Array.isArray(song.artist) ? song.artist : [song.artist]) : [];

    const handleArtistClick = (e: React.MouseEvent, artistName: string) => {
        e.stopPropagation();
        router.push(`/artists/${encodeURIComponent(artistName)}`);
    };

    const handleAlbumClick = () => {
        if (song.album) {
            onAlbumClick(song.album);
        }
    };

    return (
        <div className="grid grid-cols-[auto_auto_1fr_auto_auto] md:grid-cols-[auto_auto_minmax(200px,1fr)_minmax(150px,1fr)_80px_minmax(150px,1fr)_auto_auto] items-center gap-3 py-3 w-full hover:bg-neutral-800/10 rounded-md transition my-1 p-2 group/row">
            {/* Index Column */}
            <div className="flex items-center justify-center w-8 text-sm text-muted-foreground font-medium">
                {index + 1}
            </div>

            {/* Play Button with Avatar */}
            <Button size="icon" variant="ghost" onClick={() => onPlay(song.id)}
                aria-label={`Play ${song.title}`} className="relative group">
                <Avatar className="h-12 w-12 border border-border rounded-full flex-shrink-0">
                    <AvatarImage src={imageUrl} alt={song.title || "Song artwork"} />
                    <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    <Play className="h-8 w-8 text-white fill-white translate-x-0.5" />
                </div>
            </Button>

            {/* Title */}
            <div className="flex flex-col justify-center overflow-hidden">
                <p className="truncate font-semibold text-foreground text-base leading-tight">
                    {song.title || "Untitled"}
                </p>
            </div>

            {/* Artist - Hidden on mobile, shown on md+ */}
            <div className="hidden md:flex flex-col justify-center overflow-hidden">
                <div className="text-sm text-muted-foreground truncate">
                    {artists.map((artist, artistIndex) => (
                        <TooltipProvider key={artistIndex}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span>
                                        <span
                                            className="hover:underline cursor-pointer hover:text-foreground transition"
                                            onClick={(e) => handleArtistClick(e, artist)}>
                                            {artist}
                                        </span>
                                        {artistIndex < artists.length - 1 && ", "}
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs">View more by {artist}.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ))}
                </div>
            </div>

            {/* Duration - Hidden on mobile, shown on md+ */}
            <div className="hidden md:flex items-center justify-center text-sm text-muted-foreground">
                {formatTime(song.duration)}
            </div>

            {/* Album - Hidden on mobile, shown on md+ */}
            <div className="hidden md:flex items-center overflow-hidden">
                {song.album ? (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div
                                    className="text-sm text-muted-foreground hover:text-foreground hover:underline cursor-pointer truncate"
                                    onClick={handleAlbumClick}
                                >
                                    {song.album}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{song.album}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                )}
            </div>

            {/* Like Button */}
            <div className="flex items-center justify-center">
                <LikeButton songId={song.id} />
            </div>

            {/* More Button */}
            <div className="flex items-center justify-center">
                <div className="hidden md:block">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 opacity-0 group-hover/row:opacity-100 transition-opacity"
                        onClick={() => {
                            // TODO: Implement playlist and share functionality
                            console.log('More options for:', song.title);
                        }}
                    >
                        <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                    </Button>
                </div>
                <div className="block md:hidden">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                            >
                                <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem disabled className="text-xs font-semibold">
                                {artists.join(", ")}
                            </DropdownMenuItem>
                            {song.album && (
                                <DropdownMenuItem onClick={handleAlbumClick}>
                                    {song.album}
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                                {formatTime(song.duration)}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
};

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

const Table: React.FC<TableProps> = ({ songs, onPlay }) => {
    const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
    const [albumData, setAlbumData] = useState<{ songs: Song[] } | null>(null);

    const storageKey = typeof window !== 'undefined' ? window.location.pathname.includes('liked') ? 'liked-table-state' : 'library-table-state' : 'table-state';

    // Initialize state from sessionStorage
    const [sortField, setSortField] = useState<SortField>(() => {
        if (typeof window === 'undefined') return null;
        const saved = sessionStorage.getItem(`${storageKey}-sort-field`);
        return saved as SortField || null;
    });

    const [sortDirection, setSortDirection] = useState<SortDirection>(() => {
        if (typeof window === 'undefined') return 'asc';
        const saved = sessionStorage.getItem(`${storageKey}-sort-direction`);
        return (saved as SortDirection) || 'asc';
    });

    const [displayCount, setDisplayCount] = useState(() => {
        if (typeof window === 'undefined') return items_per_page;
        const saved = sessionStorage.getItem(`${storageKey}-display-count`);
        return saved ? parseInt(saved, 10) : items_per_page;
    });

    const { ref: loadMoreRef, inView } = useInView({
        threshold: 0,
        rootMargin: '100px',
    });

    const handleAlbumClick = (album: string) => {
        const filteredSongs = songs.filter(song => song.album === album);
        setAlbumData({ songs: filteredSongs });
        setSelectedAlbum(album);
    };

    const closeAlbumModal = () => {
        setSelectedAlbum(null);
        setAlbumData(null);
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            setSortDirection(newDirection);
            sessionStorage.setItem(`${storageKey}-sort-direction`, newDirection);
        }
        else {
            setSortField(field);
            setSortDirection('asc');
            sessionStorage.setItem(`${storageKey}-sort-field`, field || '');
            sessionStorage.setItem(`${storageKey}-sort-direction`, 'asc');
        }
        setDisplayCount(items_per_page);
        sessionStorage.setItem(`${storageKey}-display-count`, items_per_page.toString());
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
                sessionStorage.setItem(`${storageKey}-display-count`, newCount.toString());
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [inView, hasMore, sortedSongs.length, displayCount, storageKey]);

    return (
        <div className="w-full">
            <div>
                <Card className="bg-card/60 border-border">
                    <CardContent className="p-0">
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
                        <div className="h-full px-6">
                            {displayedSongs.map((song, index) => (
                                <div key={song.id} className="border-b border-border last:border-b-0">
                                    <SongRow song={song} index={index} onPlay={onPlay} onAlbumClick={handleAlbumClick} />
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
            {selectedAlbum && albumData && (
                <AlbumModal
                    album={selectedAlbum}
                    albumData={albumData}
                    onClose={closeAlbumModal}
                />
            )}
        </div>
    );
};

export default Table;