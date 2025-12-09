"use client";

import React, { useState } from 'react';
import { Song } from '@/types';
import useOnPlay from '@/hooks/useOnPlay';
import useLoadImage from '@/hooks/useLoadImage';
import LikeButton from "@/components/LikeButton";
import AlbumModal from "@/components/AlbumModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Play, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

interface SearchContentProps {
    songs: Song[];
}

const formatTime = (seconds: number | null): string => {
    if (seconds === null || seconds === undefined) return "--:--";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
};

interface SongRowProps {
    song: Song;
    onPlay: (id: number) => void;
    onAlbumClick: (album: string) => void;
}

const SongRow: React.FC<SongRowProps> = ({ song, onPlay, onAlbumClick }) => {
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
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] md:grid-cols-[auto_1fr_60px_180px_auto_auto] items-center gap-3 py-3 w-full hover:bg-neutral-800/10 rounded-md transition my-1 p-2 group/row">
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

            <div className="flex flex-col justify-center overflow-hidden">
                <p className="truncate font-semibold text-foreground text-base leading-tight">
                    <span className="lg:hidden">
                        {(song.title || "Untitled").length > 20 ? (song.title || "Untitled").substring(0, 20) + "..." : (song.title || "Untitled")}
                    </span>
                    <span className="hidden lg:inline">
                        {song.title || "Untitled"}
                    </span>
                </p>
                <div className="text-sm text-muted-foreground whitespace-nowrap overflow-hidden relative w-full group/artist">
                    <div className="lg:hidden inline-block w-full">
                        {artists.map((artist, index) => (
                            <span key={artist + index}>
                                <span
                                    className={`hover:underline cursor-pointer ${(artists.join(", ").length > 20) ? "group-hover/row:animate-marquee inline-block" : ""}`}
                                    onClick={(e) => handleArtistClick(e, artist)}>
                                    {artist}
                                </span>
                                {index < artists.length - 1 && <span>, </span>}
                            </span>
                        ))}
                    </div>

                    <div className="hidden lg:block truncate">
                        {artists.map((artist, index) => (
                            <span key={index}>
                                <span
                                    className="hover:underline cursor-pointer hover:text-foreground transition"
                                    onClick={(e) => handleArtistClick(e, artist)}>
                                    {artist}
                                </span>
                                {index < artists.length - 1 && ", "}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="hidden md:flex items-center justify-center text-sm text-muted-foreground">
                {formatTime(song.duration)}
            </div>

            {song.album && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div
                                className="hidden md:block text-sm text-muted-foreground hover:text-foreground hover:underline cursor-pointer truncate text-left px-2"
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
            )}
            {!song.album && <div className="hidden md:block w-[180px]"></div>}

            <div className="flex items-center justify-center">
                <LikeButton songId={song.id} />
            </div>

            {/* More Button - Desktop: simple button, Mobile: dropdown with album */}
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
                            {song.album && (
                                <DropdownMenuItem onClick={handleAlbumClick}>
                                    {song.album}
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                                More options coming soon
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
};

const SearchContent: React.FC<SearchContentProps> = ({ songs }) => {
    const onPlay = useOnPlay(songs);
    const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
    const [albumData, setAlbumData] = useState<{ songs: Song[] } | null>(null);

    const handleAlbumClick = (album: string) => {
        const filteredSongs = songs.filter(song => song.album === album);
        setAlbumData({ songs: filteredSongs });
        setSelectedAlbum(album);
    };

    const closeAlbumModal = () => {
        setSelectedAlbum(null);
        setAlbumData(null);
    };

    if (songs.length === 0) {
        return (
            <Card className="bg-card/60 border-border">
                <CardHeader>
                    <CardTitle>No results found</CardTitle>
                    <CardDescription>Try adjusting your search or check back soon.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="w-full">
            <div>
                <Card className="bg-card/60 border-border">
                    <CardContent className="p-0">
                        <div className="h-full px-6">
                            {songs.map((song) => (
                                <div key={song.id} className="border-b border-border last:border-b-0">
                                    <SongRow song={song} onPlay={onPlay} onAlbumClick={handleAlbumClick} />
                                </div>
                            ))}
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

export default SearchContent;