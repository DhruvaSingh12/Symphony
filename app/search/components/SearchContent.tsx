"use client";

import React from 'react';
import { Song } from '@/types';
import useOnPlay from '@/hooks/useOnPlay';
import useLoadImage from '@/hooks/useLoadImage';
import LikeButton from "@/components/LikeButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Play } from "lucide-react";

interface SearchContentProps {
    songs: Song[];
}

const SongRow: React.FC<{ song: Song; onPlay: (id: string) => void }> = ({ song, onPlay }) => {
    const imageUrl = useLoadImage(song) || "/images/liked.png";
    const initials = (song.title || "?").slice(0, 2).toUpperCase();
    const artists = Array.isArray(song.artist) ? song.artist.join(", ") : song.artist;

    return (
        <div className="flex items-center my-1 gap-3 py-3 w-full hover:bg-neutral-800/10 rounded-md transition p-2">
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

            <div className="flex-1 flex flex-col min-w-0 justify-center">
                <p className="truncate font-semibold text-foreground text-base leading-tight">
                    {song.title || "Untitled"}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                    {artists}
                </p>
            </div>

            {song.album && (
                <div className="hidden md:flex flex-none items-center justify-end w-[200px] mr-4 text-sm text-muted-foreground truncate">
                    {song.album}
                </div>
            )}

            <div className="flex items-center gap-x-3">
                <LikeButton songId={song.id} />
            </div>
        </div>
    );
};

const SearchContent: React.FC<SearchContentProps> = ({ songs }) => {
    const onPlay = useOnPlay(songs);

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
                                    <SongRow song={song} onPlay={onPlay} />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SearchContent;