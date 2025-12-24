"use client";

import React, { useRef, useEffect } from "react";
import { Song } from "@/types";
import usePlayerModal from "@/hooks/ui/usePlayerModal";
import usePlaylistModal from "@/hooks/ui/usePlaylistModal";
import usePlayer from "@/hooks/ui/usePlayer";
import { ChevronDown, Shuffle, SkipBack, Play, Pause, SkipForward, Repeat, ListMusic, Volume2, VolumeX, FastForward, Rewind, PlusCircle, ChevronLeft } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import useLoadImage from "@/hooks/data/useLoadImage";
import LikeButton from "@/components/LikeButton";
import { cn } from "@/lib/utils";
import useQueueModal from "@/hooks/ui/useQueueModal";
import usePlaybackSettings from "@/hooks/data/usePlaybackSettings";
import { useRouter } from "next/navigation";
import { useLyrics } from "@/hooks/data/useLyrics";
import LyricsDisplay from "../../LyricsDisplay";

interface FullScreenPlayerProps {
    song: Song;
    songUrl: string;
    currentTime: number;
    duration: number | null;
    audioRef: React.RefObject<HTMLAudioElement | null>;
    togglePlayPause: () => void;
    onPlayNext: () => void;
    onPlayPrevious: () => void;
    formatTime: (time: number) => string;
}

const FullScreenPlayer: React.FC<FullScreenPlayerProps> = ({
    song,
    currentTime,
    duration,
    audioRef,
    togglePlayPause,
    onPlayNext,
    onPlayPrevious,
    formatTime
}) => {
    const playerModal = usePlayerModal();
    const playlistModal = usePlaylistModal();
    const player = usePlayer();
    const queueModal = useQueueModal();
    const { volume, setVolume } = usePlaybackSettings();
    const imageUrl = useLoadImage(song);
    const router = useRouter();
    const { data: lyrics } = useLyrics(song.lyrics_path || null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Reset scroll to top when player opens
    useEffect(() => {
        if (playerModal.isOpen) {
            scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'instant' });
        }
    }, [playerModal.isOpen]);

    const VolumeIcon = volume === 0 ? VolumeX : Volume2;

    const toggleMute = () => {
        if (volume === 0) {
            setVolume(1);
        } else {
            setVolume(0);
        }
    };

    const artists = song.artists || [];

    // Additional skip controls
    const skipForward = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = Math.min(currentTime + 10, duration || currentTime);
        }
    };

    const skipBackward = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = Math.max(currentTime - 10, 0);
        }
    };

    const onSliderChange = (value: number[]) => {
        const newTime = value[0];
        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
        }
    };

    const handleArtistClick = (e: React.MouseEvent, artistName: string) => {
        e.stopPropagation();
        // Close modal before navigating
        playerModal.onClose();
        sessionStorage.setItem("keep-search-persistence", "true");
        router.push(`/artists/${encodeURIComponent(artistName)}`);
    };

    if (!playerModal.isOpen) return null;

    return (
        <div
            ref={scrollContainerRef}
            className="fixed inset-0 bg-background z-[100] md:hidden overflow-y-auto snap-y snap-mandatory scrollbar-hide scroll-smooth"
        >
            {/* Main Player (100vh) */}
            <div className="flex flex-col h-[100dvh] w-full shrink-0 snap-start animate-in slide-in-from-bottom duration-300">
                {/* Header */}
                <div className="flex items-center justify-center pt-[env(safe-area-inset-top,24px)] pb-2 px-6 shrink-0">
                    <Button variant="ghost" size="icon" onClick={playerModal.onClose} className="text-foreground rounded-full hover:bg-white/10">
                        <ChevronDown className="h-6 w-6" />
                    </Button>
                </div>

                {/* Content Container */}
                <div className="flex-1 flex flex-col justify-between px-6 pb-6 gap-y-4 min-h-0 overflow-hidden">
                    {/* Artwork - flexible sizing */}
                    <div className="flex-1 flex items-center justify-center min-h-0">
                        <div className="w-full aspect-square relative shadow-2xl rounded-2xl overflow-hidden max-w-[300px] max-h-full">
                            <Image
                                src={imageUrl || "/images/liked.png"}
                                alt={song.title || "Album Art"}
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>

                    {/* Song Info */}
                    <div className="flex items-center justify-between w-full shrink-0">
                        <div className="flex flex-col gap-y-1 overflow-hidden pr-4">
                            <h1 className="text-2xl font-bold text-foreground truncate drop-shadow-sm">
                                {song.title}
                            </h1>
                            <p className="text-lg text-muted-foreground truncate font-medium flex gap-1">
                                {artists.length > 0 ? (
                                    artists.map((artist, artistIndex) => (
                                        <span key={artistIndex} className="inline-flex">
                                            <span
                                                className="hover:text-foreground transition cursor-pointer hover:underline"
                                                onClick={(e) => handleArtistClick(e, artist.name)}
                                            >
                                                {artist.name}
                                            </span>
                                            {artistIndex < artists.length - 1 && <span>, </span>}
                                        </span>
                                    ))
                                ) : (
                                    <span>Unknown Artist</span>
                                )}
                            </p>
                        </div>
                        <div className="flex items-center gap-x-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => playlistModal.onOpen(song.id)}
                                className="hover:text-foreground rounded-full transition"
                            >
                                <PlusCircle className="h-7 w-7" />
                            </Button>
                            <LikeButton songId={song.id} />
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex flex-col gap-2 w-full shrink-0">
                        <Slider
                            value={[currentTime]}
                            max={duration || 100}
                            step={0.1}
                            onValueChange={onSliderChange}
                            className="w-full cursor-pointer [&_[data-radix-slider-track]]:h-1.5 [&_[data-radix-slider-track]]:bg-white/20 [&_[data-radix-slider-range]]:bg-primary [&_[data-radix-slider-thumb]]:h-3 [&_[data-radix-slider-thumb]]:w-3 [&_[data-radix-slider-thumb]]:bg-primary [&_[data-radix-slider-thumb]]:border-background [&_[data-radix-slider-thumb]]:shadow-sm"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground font-medium tabular-nums">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration || 0)}</span>
                        </div>
                    </div>

                    {/* Main Controls - Single Line */}
                    <div className="flex items-center justify-between w-full shrink-0">
                        {/* Shuffle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={player.toggleShuffle}
                            className={cn("text-muted-foreground hover:text-foreground transition rounded-full h-8 w-8", player.isShuffle && "text-primary")}
                        >
                            <Shuffle className="h-4 w-4" />
                        </Button>

                        {/* Rewind */}
                        <Button variant="ghost" size="icon" onClick={skipBackward} className="text-muted-foreground hover:text-foreground rounded-full transition h-10 w-10">
                            <Rewind className="h-5 w-5" />
                        </Button>

                        {/* Previous */}
                        <Button variant="ghost" size="icon" onClick={onPlayPrevious} className="text-foreground hover:scale-110 transition rounded-full h-12 w-12">
                            <SkipBack className="h-7 w-7 fill-current" />
                        </Button>

                        {/* Play/Pause */}
                        <Button
                            size="icon"
                            onClick={togglePlayPause}
                            className="h-12 w-12 bg-primary text-primary-foreground rounded-full hover:scale-105 transition shadow-lg flex items-center justify-center p-0"
                        >
                            {player.isPlaying ? (
                                <Pause className="h-10 w-10 fill-current" />
                            ) : (
                                <Play className="h-10 w-10 fill-current" />
                            )}
                        </Button>

                        {/* Next */}
                        <Button variant="ghost" size="icon" onClick={onPlayNext} className="text-foreground hover:scale-110 transition rounded-full h-12 w-12">
                            <SkipForward className="h-7 w-7 fill-current" />
                        </Button>

                        {/* Fast Forward */}
                        <Button variant="ghost" size="icon" onClick={skipForward} className="text-muted-foreground hover:text-foreground rounded-full transition h-10 w-10">
                            <FastForward className="h-5 w-5" />
                        </Button>

                        {/* Repeat */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={player.toggleRepeat}
                            className={cn("text-muted-foreground hover:text-foreground transition rounded-full h-8 w-8", player.isRepeat && "text-primary")}
                        >
                            <Repeat className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between px-6 pb-[max(env(safe-area-inset-bottom,24px),24px)] w-full shrink-0">
                    <div className="flex items-center gap-3 flex-1">
                        <Button variant="ghost" size="icon" onClick={toggleMute} className="text-muted-foreground hover:text-foreground rounded-full transition h-8 w-8 shrink-0">
                            <VolumeIcon className="h-5 w-5" />
                        </Button>
                        <Slider
                            value={[volume]}
                            max={1}
                            step={0.01}
                            onValueChange={(value) => setVolume(value[0])}
                            className="w-24 cursor-pointer [&_[data-radix-slider-track]]:h-1.5 [&_[data-radix-slider-track]]:bg-muted/30 [&_[data-radix-slider-track]]:rounded-full [&_[data-radix-slider-range]]:bg-gradient-to-r [&_[data-radix-slider-range]]:from-violet-500 [&_[data-radix-slider-range]]:to-purple-400 [&_[data-radix-slider-thumb]]:h-3 [&_[data-radix-slider-thumb]]:w-3 [&_[data-radix-slider-thumb]]:bg-white [&_[data-radix-slider-thumb]]:border-violet-500 [&_[data-radix-slider-thumb]]:shadow-sm"
                        />
                        <span className="text-xs text-muted-foreground w-6 tabular-nums">
                            {Math.round(volume * 100)}
                        </span>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            playerModal.onClose();
                            queueModal.onOpen();
                        }}
                        className="text-muted-foreground hover:text-foreground rounded-full"
                    >
                        <ListMusic className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Section 2: Lyrics Section (100vh) */}
            {song.lyrics_path && (
                <div className="h-[100dvh] w-full shrink-0 snap-start flex flex-col p-4">
                    <div className="flex-1 relative rounded-lg overflow-hidden group border border-border flex flex-col">
                        {/* Dynamic Background (Sidebar Aesthetic) */}
                        <div className="absolute inset-0">
                            <Image
                                src={imageUrl || "/images/liked.png"}
                                alt="Background"
                                fill
                                className="object-cover blur-xl opacity-40 scale-125 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/60" />
                        </div>

                        {/* Content */}
                        <div className="relative h-full flex flex-col min-h-0">
                            {/* Header */}
                            <div className="p-3 flex items-center justify-between border-b border-border/10 bg-background/20 backdrop-blur-md shrink-0">
                                <button
                                    onClick={() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
                                    className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition outline-none"
                                >
                                    <ChevronLeft size={12} /> Back
                                </button>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/80">Lyrics</span>
                            </div>

                            {/* Lyrics Information */}
                            <div className="p-6 text-center shrink-0">
                                <h2 className="text-xl font-bold text-foreground leading-tight drop-shadow-md line-clamp-2 mb-1">
                                    {song.title}
                                </h2>
                                <p className="text-muted-foreground text-xs uppercase tracking-widest font-medium">
                                    {artists[0]?.name || "Unknown Artist"}
                                </p>
                            </div>

                            {/* Lyrics Display */}
                            <div className="flex-1 min-h-0">
                                <LyricsDisplay
                                    lyrics={lyrics || []}
                                    currentTime={currentTime}
                                    isPlaying={player.isPlaying}
                                    compact={true}
                                    className="py-6 px-4 scrollbar-hide"
                                    onSeek={(time) => player.setSeekTo(time)}
                                />
                            </div>

                            {/* Pull-down hint */}
                            <div className="pb-4 flex justify-center opacity-30 shrink-0">
                                <div className="w-10 h-1 bg-border rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FullScreenPlayer;