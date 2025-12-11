"use client";

import React from "react";
import { Song } from "@/types";
import { useRouter } from "next/navigation";
import useLoadImage from "@/hooks/useLoadImage";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Play, MoreHorizontal, PlusCircle, ListPlus, Disc, User, Heart } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import LikeButton from "@/components/LikeButton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import useAuthModal from "@/hooks/useAuthModal";
import { useUser } from "@/hooks/useUser";
import { useLikeSong, useIsLiked } from "@/hooks/mutations/useLikeSong";

interface SongRowProps {
    song: Song;
    index: number;
    onPlay: (id: number) => void;
    onAlbumClick?: (album: string) => void;
    showArtist?: boolean;
    showAlbum?: boolean;
    showDuration?: boolean;
    layout?: 'default' | 'search';
}

const formatTime = (seconds: number | null): string => {
    if (seconds === null || seconds === undefined) return "--:--";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
};

const SongRow: React.FC<SongRowProps> = ({
    song,
    index,
    onPlay,
    onAlbumClick,
    showArtist = true,
    showAlbum = true,
    showDuration = true,
    layout = 'default'
}) => {
    const imageUrl = useLoadImage(song) || "/images/liked.png";
    const initials = (song.title || "?").slice(0, 2).toUpperCase();
    const router = useRouter();
    const artists = song.artist ? (Array.isArray(song.artist) ? song.artist : [song.artist]) : [];

    // Auth & Like Logic
    const authModal = useAuthModal();
    const { user } = useUser();
    const isLiked = useIsLiked(song.id);
    const likeMutation = useLikeSong();

    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) {
            return authModal.onOpen();
        }
        likeMutation.mutate({
            songId: song.id,
            isCurrentlyLiked: isLiked
        });
    };

    const handleArtistClick = (e: React.MouseEvent, artistName: string) => {
        e.stopPropagation();
        router.push(`/artists/${encodeURIComponent(artistName)}`);
    };

    const handleAlbumClick = () => {
        if (song.album && onAlbumClick) {
            onAlbumClick(song.album);
        }
    };

    const gridCols = showAlbum
        ? "md:grid-cols-[auto_auto_minmax(200px,1fr)_minmax(150px,1fr)_80px_minmax(150px,1fr)_auto_auto]"
        : "md:grid-cols-[auto_auto_minmax(200px,1fr)_minmax(150px,1fr)_80px_auto_auto]";

    return (
        <div className={`grid grid-cols-[auto_auto_1fr_auto_auto_auto] ${gridCols} 
        items-center gap-2 md:gap-3 py-3 w-full hover:bg-muted/30 rounded-md transition my-1 p-1 md:p-2 group/row`}>
            {/* Index Column */}
            <div className="flex items-center justify-center w-8 text-xs md:text-sm text-muted-foreground font-medium">
                {index + 1}
            </div>

            {/* Play Button with Avatar */}
            <Button size="icon" variant="ghost" onClick={() => onPlay(song.id)}
                aria-label={`Play ${song.title}`} className="relative group">
                <Avatar className="md:h-12 md:w-12 h-10 w-10 border border-border rounded-full flex-shrink-0">
                    <AvatarImage src={imageUrl} alt={song.title || "Song artwork"} />
                    <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    <Play className="md:h-8 md:w-8 h-6 w-6 text-white fill-white translate-x-0.5" />
                </div>
            </Button>

            {/* Title */}
            <div className="flex flex-col justify-center overflow-hidden">
                <p className="truncate font-semibold text-foreground text-sm md:text-base leading-tight">
                    {song.title || "Untitled"}
                </p>
                {layout === 'search' && (
                    <div className="text-sm text-muted-foreground truncate group/artist">
                        {artists.map((artist, artistIndex) => (
                            <span key={artistIndex}>
                                <span
                                    className="hover:underline cursor-pointer hover:text-foreground transition"
                                    onClick={(e) => handleArtistClick(e, artist)}>
                                    {artist}
                                </span>
                                {artistIndex < artists.length - 1 && ", "}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className={`${showArtist && layout !== 'search' ? 'hidden md:flex' : 'hidden'} flex-col justify-center overflow-hidden`}>
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

            {/* Duration - Always shown now */}
            <div className={`${showDuration ? 'flex' : 'hidden'} items-center justify-center text-xs md:text-sm text-muted-foreground`}>
                {formatTime(song.duration)}
            </div>

            {/* Album - Hidden on mobile, shown on md+ */}
            {showAlbum && (
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
            )}

            {/* Like Button */}
            <div className="flex items-center justify-center">
                <LikeButton songId={song.id} />
            </div>

            {/* More Button */}
            <div className="flex items-center justify-center">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 md:h-8 md:w-8 transition-opacity"
                        >
                            <MoreHorizontal className="md:h-5 md:w-5 h-4 w-4 text-muted-foreground" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="md:w-48 w-42">
                        <DropdownMenuItem onClick={() => console.log('Add to playlist')}>
                            <PlusCircle className="md:mr-2 mr-1 md:h-4 md:w-4 h-3 w-3" />
                            Add to playlist
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => console.log('Add to queue')}>
                            <ListPlus className="md:mr-2 mr-1 md:h-4 md:w-4 h-3 w-3" />
                            Add to Queue
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />

                        {song.album && (
                            <DropdownMenuItem onClick={handleAlbumClick} className="cursor-pointer">
                                <Disc className="md:mr-2 mr-1 md:h-4 md:w-4 h-3 w-3" />
                                Go to album
                            </DropdownMenuItem>
                        )}

                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <User className="md:mr-2 mr-1 md:h-4 md:w-4 h-3 w-3" />
                                Go to artists
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                                {artists.map((artist, i) => (
                                    <DropdownMenuItem
                                        key={i}
                                        onClick={(e) => handleArtistClick(e, artist)}
                                        className="cursor-pointer"
                                    >
                                        <User className="md:mr-2 mr-1 md:h-4 md:w-4 h-3 w-3" />
                                        {artist}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem onClick={handleLike} className="cursor-pointer">
                            <Heart className={`md:mr-2 mr-1 md:h-4 md:w-4 h-3 w-3 ${isLiked ? "fill-primary text-primary" : ""}`} />
                            <span>{isLiked ? "Remove from Liked" : "Add to Liked"}</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};

export default SongRow;