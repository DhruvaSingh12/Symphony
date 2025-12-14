"use client";

import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Song } from "@/types";
import { useSongsByArtist } from "@/hooks/queries/useSongsByArtist";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import AlbumCard from "../components/AlbumCard";
import useOnPlay from "@/hooks/useOnPlay";
import SongRow from "@/components/SongRow";
import { Disc, Play, Pause } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import usePlayer from "@/hooks/usePlayer";

const ArtistPage = () => {
    const params = useParams();
    const router = useRouter();
    const artistName = decodeURIComponent(params.name as string);

    const { data: songs, error } = useSongsByArtist(artistName);
    const [isMobile, setIsMobile] = useState(false);
    const [showAllAlbums, setShowAllAlbums] = useState(false);
    const [showAllArtists, setShowAllArtists] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const relatedArtists = useMemo(() => {
        if (!songs) return [];
        const artistsSet = new Set<string>();
        songs.forEach((song) => {
            if (song.artist) {
                const songArtists = Array.isArray(song.artist) ? song.artist : [song.artist];
                songArtists.forEach((a) => {
                    if (a !== artistName) {
                        artistsSet.add(a);
                    }
                });
            }
        });
        return Array.from(artistsSet);
    }, [songs, artistName]);

    const albums = useMemo(() => {
        if (!songs) return {};
        const groups: Record<string, Song[]> = {};
        songs.forEach(song => {
            const albumName = song.album || "Singles";
            if (!groups[albumName]) {
                groups[albumName] = [];
            }
            groups[albumName].push(song);
        });
        return groups;
    }, [songs]);

    const topSongs = useMemo(() => {
        if (!songs) return [];
        return songs.slice(0, 5);
    }, [songs]);

    const onPlay = useOnPlay(songs || [], 'artist', artistName);
    const player = usePlayer();

    const isContextPlaying = player.playContext === 'artist' && player.playContextId === artistName && player.isPlaying;



    const displayedAlbums = useMemo(() => {
        const entries = Object.entries(albums);
        if (isMobile && !showAllAlbums) {
            return entries.slice(0, 3);
        }
        return entries;
    }, [albums, isMobile, showAllAlbums]);

    const displayedRelatedArtists = useMemo(() => {
        if (isMobile && !showAllArtists) {
            return relatedArtists.slice(0, 4);
        }
        return relatedArtists;
    }, [relatedArtists, isMobile, showAllArtists]);

    return (
        <div className="h-full w-full flex flex-col overflow-hidden">
            <div className="flex-none px-2 md:px-0 md:pr-2 pt-2">
                <Header>
                    <div className="flex flex-col">
                        <div className="flex items-center mt-3 justify-between">
                            <h1 className="text-2xl md:text-5xl lg:text-6xl font-bold text-foreground">
                                {artistName}
                            </h1>
                            {songs && songs.length > 0 && (
                                <Button
                                    onClick={() => {
                                        if (isContextPlaying) {
                                            player.togglePlayPause();
                                        } else if (player.activeId && songs.some(s => s.id === player.activeId)) {
                                            player.togglePlayPause();
                                        } else {
                                            onPlay(songs[0].id);
                                        }
                                    }}
                                    size="icon"
                                    className="rounded-full bg-foreground hover:bg-primary/90 transition w-10 h-10 md:w-12 md:h-12"
                                >
                                    {isContextPlaying ? (
                                        <Pause className="text-background fill-background w-8 h-8 md:w-12 md:h-12" />
                                    ) : (
                                        <Play className="text-background fill-background w-8 h-8 md:w-12 md:h-12" />
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </Header>
            </div>
            <div className="flex-1 min-h-0 mt-2 px-2 md:px-0 md:pr-2 pb-2">
                <Card className="border-border h-full flex flex-col overflow-hidden relative">
                    <div className="h-full w-full overflow-auto scrollbar-hide">
                        {error ? (
                            <CardContent className="p-4">
                                <p className="text-center text-muted-foreground">
                                    Error loading songs. Please try again.
                                </p>
                            </CardContent>
                        ) : (
                            <div className="p-4">
                                <div>
                                    <h2 className="text-2xl font-bold ml-2 mb-2">Top Songs</h2>
                                    <div className="flex flex-col w-full">
                                        {topSongs.map((song, index) => (
                                            <div key={song.id} className="border-b border-border/50 last:border-b-0">
                                                <SongRow
                                                    song={song}
                                                    index={index}
                                                    onPlay={onPlay}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {songs && songs.length === 0 && (
                                    <div className="text-muted-foreground text-center p-4">
                                        No songs found.
                                    </div>
                                )}

                                {Object.keys(albums).length > 0 && (
                                    <div className="w-full py-2 min-w-0">
                                        <h2 className="text-2xl font-bold ml-2 mb-2">Albums</h2>
                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                                            {displayedAlbums.map(([albumName, albumSongs]) => (
                                                <AlbumCard
                                                    key={albumName}
                                                    albumName={albumName}
                                                    songs={albumSongs}
                                                />
                                            ))}
                                        </div>
                                        {isMobile && Object.keys(albums).length > 3 && (
                                            <div className="flex justify-center mt-4">
                                                <button
                                                    onClick={() => setShowAllAlbums(!showAllAlbums)}
                                                    className="text-sm text-muted-foreground hover:text-foreground hover:underline transition"
                                                >
                                                    {showAllAlbums ? "Show Less" : "View More"}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {relatedArtists.length > 0 && (
                                    <div className="w-full pt-2 pb-4 min-w-0">
                                        <h2 className="text-2xl font-bold ml-2 mb-4">Related Artists</h2>
                                        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-3 md:gap-2">
                                            {displayedRelatedArtists.map((artist) => (
                                                <div
                                                    key={artist}
                                                    className="flex flex-col items-center group cursor-pointer gap-y-2"
                                                    onClick={() => router.push(`/artists/${encodeURIComponent(artist)}`)}
                                                >
                                                    <div className="relative h-20 w-20 md:h-28 md:w-28 border border-border bg-secondary rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition transform duration-300">
                                                        <Disc className="w-8 h-8 md:w-14 md:h-14 text-background" />
                                                    </div>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <div className="text-center text-foreground truncate text-sm md:text-base px-1">
                                                                    {artist}
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>{artist}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            ))}
                                        </div>
                                        {isMobile && relatedArtists.length > 4 && (
                                            <div className="flex justify-center mt-4">
                                                <button
                                                    onClick={() => setShowAllArtists(!showAllArtists)}
                                                    className="text-sm text-muted-foreground hover:text-foreground hover:underline transition"
                                                >
                                                    {showAllArtists ? "Show Less" : "View More"}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>


                </Card>
            </div>
        </div>
    );
};

export default ArtistPage;