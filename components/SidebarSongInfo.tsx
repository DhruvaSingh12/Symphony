"use client";

import React, { useState } from "react";
import usePlayer from "@/hooks/ui/usePlayer";
import useGetSongById from "@/hooks/data/useGetSongById";
import useLoadImage from "@/hooks/data/useLoadImage";
import { Loader2, Quote, ChevronLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useAlbumModal from "@/hooks/ui/useAlbumModal";
import { useLyrics } from "@/hooks/data/useLyrics";
import LyricsDisplay from "./LyricsDisplay";

const SidebarSongInfo = () => {
    const player = usePlayer();
    const [showLyrics, setShowLyrics] = useState(false);

    const { song, isloading } = useGetSongById(player.activeId?.toString());
    const imageUrl = useLoadImage(song!);
    const { data: lyrics } = useLyrics(song?.lyrics_path || null);

    const allArtists = song?.artists || [];
    const displayedArtists = allArtists.slice(0, 2);

    const router = useRouter();
    const albumModal = useAlbumModal();

    const handleArtistClick = (e: React.MouseEvent, artistName: string) => {
        e.stopPropagation();
        sessionStorage.setItem("keep-search-persistence", "true");
        router.push(`/artists/${encodeURIComponent(artistName)}`);
    };

    const handleAlbumClick = () => {
        if (!song?.album?.title) return;
        albumModal.onOpen(song.album.title);
    };

    if (!player.activeId) {
        return (
            <div className="flex-1 rounded-lg bg-card border border-border overflow-hidden flex items-center justify-center p-4">
                <div className="flex flex-col items-center gap-2 opacity-50">
                    <div className="flex gap-1 items-end h-6">
                        <div className="w-1 h-2 bg-border rounded-full" />
                        <div className="w-1 h-3 bg-border rounded-full" />
                        <div className="w-1 h-2 bg-border rounded-full" />
                    </div>
                    <p className="text-xs font-medium tracking-wider uppercase">Not Playing</p>
                </div>
            </div>
        );
    }

    if (isloading || !song) {
        return (
            <div className="flex-1 rounded-lg bg-card border border-border overflow-hidden flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-border" />
            </div>
        );
    }

    return (
        <div className="flex-1 relative rounded-lg overflow-hidden group border border-border">
            {/* Dynamic Background */}
            <div className="absolute inset-0">
                <Image
                    src={imageUrl || "/images/liked.png"}
                    alt="Background"
                    fill
                    className="object-cover blur-xl opacity-40 scale-125 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/60" />
            </div>

            {/* Toggle Button */}
            {!showLyrics && song.lyrics_path && (
                <button
                    onClick={() => setShowLyrics(true)}
                    className="absolute bottom-2 right-2 z-20 p-2 rounded-full bg-background transition-all text-muted-foreground hover:text-foreground"
                >
                    <Quote size={14} />
                </button>
            )}

            {/* Content Container */}
            <div className="relative h-full flex flex-col min-h-0">
                {showLyrics ? (
                    <div className="flex-1 flex flex-col min-h-0 animate-in fade-in duration-300">
                        {/* Lyrics Header */}
                        <div className="p-3 flex items-center justify-between border-b border-border/10 bg-background/20 backdrop-blur-md shrink-0">
                            <button
                                onClick={() => setShowLyrics(false)}
                                className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition outline-none"
                            >
                                <ChevronLeft size={12} /> Back
                            </button>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/80">Lyrics</span>
                        </div>

                        {/* Lyrics Display */}
                        <div className="flex-1 min-h-0">
                            <LyricsDisplay
                                lyrics={lyrics || []}
                                currentTime={player.currentTime}
                                isPlaying={player.isPlaying}
                                compact={true}
                                className="py-6 scrollbar-hide"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="relative h-full flex flex-col p-3 xl:p-4 overflow-y-auto scrollbar-hide animate-in fade-in duration-300">
                        {/* Artwork */}
                        <div className="relative aspect-square w-full shadow-2xl rounded-md overflow-hidden mb-3 xl:mb-4 ring-1 ring-white/10 mx-auto max-w-[240px]">
                            <Image
                                src={imageUrl || "/images/liked.png"}
                                alt={song.title || "Artwork"}
                                fill
                                className="object-cover"
                            />
                        </div>

                        {/* Info */}
                        <div className="flex flex-col gap-0.5 xl:gap-1 text-center items-center w-full">
                            <h2 className="text-base xl:text-xl font-bold text-foreground leading-tight drop-shadow-md line-clamp-2 w-full">
                                {song.title}
                            </h2>
                            <div className="text-muted-foreground text-xs w-full truncate">
                                {displayedArtists.map((artist, index) => (
                                    <span key={index}>
                                        <span
                                            className="cursor-pointer hover:text-foreground transition"
                                            onClick={(e) => handleArtistClick(e, artist.name)}
                                        >
                                            {artist.name}
                                        </span>
                                        {index < displayedArtists.length - 1 && ", "}
                                    </span>
                                ))}
                            </div>
                            {song.album?.title && (
                                <div
                                    className="text-xs xl:text-sm text-muted-foreground hover:text-foreground cursor-pointer truncate w-full"
                                    onClick={handleAlbumClick}
                                >
                                    {song.album.title}
                                </div>
                            )}
                        </div>

                        {/* Animated Equalizer */}
                        <div className="mt-auto pt-4 flex justify-center gap-1 opacity-70">
                            <div className="w-1 h-3 bg-foreground rounded-full animate-[bounce_1s_infinite]" style={{ animationDelay: '0ms', animationPlayState: player.isPlaying ? 'running' : 'paused' }} />
                            <div className="w-1 h-5 bg-foreground rounded-full animate-[bounce_1.2s_infinite]" style={{ animationDelay: '200ms', animationPlayState: player.isPlaying ? 'running' : 'paused' }} />
                            <div className="w-1 h-4 bg-foreground rounded-full animate-[bounce_0.8s_infinite]" style={{ animationDelay: '400ms', animationPlayState: player.isPlaying ? 'running' : 'paused' }} />
                            <div className="w-1 h-3 bg-foreground rounded-full animate-[bounce_1.1s_infinite]" style={{ animationDelay: '100ms', animationPlayState: player.isPlaying ? 'running' : 'paused' }} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SidebarSongInfo;
