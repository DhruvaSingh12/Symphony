"use client";

import React, { useState, useMemo } from 'react';
import { Song } from '@/types';
import useOnPlay from '@/hooks/useOnPlay';
import { useRouter } from "next/navigation";
import Box from '@/components/Box';
import SongRow from '@/components/SongRow';
import AlbumCard from '@/app/artists/components/AlbumCard';
import { Disc } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SearchContentProps {
    songs: Song[];
    query: string;
    isLoading: boolean;
}

const SearchContent: React.FC<SearchContentProps> = ({ songs, query }) => {
    const onPlay = useOnPlay(songs, 'search');
    const [expandedSongs, setExpandedSongs] = useState(false);
    const [expandedAlbums, setExpandedAlbums] = useState(false);
    const [expandedArtists, setExpandedArtists] = useState(false);
    const router = useRouter();

    const calculateMatchScore = (text: string, query: string) => {
        const t = text.toLowerCase();
        const q = query.toLowerCase();
        if (t === q) return 3;
        if (t.startsWith(q)) return 2;
        if (t.includes(q)) return 1;
        return 0;
    };

    const matchingArtists = useMemo(() => {
        const artistsSet = new Set<string>();
        songs.forEach(song => {
            if (song.artist) {
                const songArtists = Array.isArray(song.artist) ? song.artist : [song.artist];
                songArtists.forEach(a => {
                    if (a.toLowerCase().includes(query.toLowerCase())) {
                        artistsSet.add(a);
                    }
                });
            }
        });
        return Array.from(artistsSet).sort((a, b) => {
            return calculateMatchScore(b, query) - calculateMatchScore(a, query);
        });
    }, [songs, query]);

    // Extract unique albums
    const matchingAlbums = useMemo(() => {
        const groups: Record<string, Song[]> = {};
        songs.forEach(song => {
            if (song.album) {
                if (!groups[song.album]) {
                    groups[song.album] = [];
                }
                groups[song.album].push(song);
            }
        });
        return groups;
    }, [songs]);

    const sortedSongs = useMemo(() => {
        return [...songs].sort((a, b) => {
            const scoreA = calculateMatchScore(a.title || "", query);
            const scoreB = calculateMatchScore(b.title || "", query);
            return scoreB - scoreA;
        });
    }, [songs, query]);

    const displayedSongs = useMemo(() => {
        return expandedSongs ? sortedSongs : sortedSongs.slice(0, 10);
    }, [sortedSongs, expandedSongs]);

    const displayedAlbums = useMemo(() => {
        const entries = Object.entries(matchingAlbums).sort(([aName], [bName]) => {
            const scoreA = calculateMatchScore(aName, query);
            const scoreB = calculateMatchScore(bName, query);
            return scoreB - scoreA;
        });
        return expandedAlbums ? entries : entries.slice(0, 6);
    }, [matchingAlbums, query, expandedAlbums]);

    const displayedArtists = useMemo(() => {
        return expandedArtists ? matchingArtists : matchingArtists.slice(0, 6);
    }, [matchingArtists, expandedArtists]);

    if (songs.length === 0) {
        return (
            <Box className="bg-card/60 border-border">
                <div className="flex flex-col gap-1 p-4 items-center justify-center">
                    <h1 className="text-2xl font-semibold text-foreground">No results found</h1>
                    <p className="text-muted-foreground">Try adjusting your search or check back soon.</p>
                </div>
            </Box>
        );
    }

    return (
        <div className="w-full h-full flex flex-col gap-6 px-4">
            {/* Songs Section */}
            <div className="w-full">
                <div className="flex flex-col w-full">
                    {displayedSongs.map((song, index) => (
                        <div key={song.id} className="border-b border-border/50 last:border-b-0">
                            <SongRow
                                song={song}
                                index={index}
                                onPlay={onPlay}
                                layout="search"
                            />
                        </div>
                    ))}
                    {songs.length > 10 && (
                        <div className="flex justify-center mt-2">
                            <button
                                onClick={() => setExpandedSongs(!expandedSongs)}
                                className="text-sm text-muted-foreground hover:text-foreground hover:underline transition"
                            >
                                {expandedSongs ? "Show Less" : "View More"}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Albums Section */}
            {Object.keys(matchingAlbums).length > 0 && (
                <div className="w-full">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 px-2">
                        {displayedAlbums.map(([albumName, albumSongs]) => (
                            <AlbumCard
                                key={albumName}
                                albumName={albumName}
                                songs={albumSongs}
                            />
                        ))}
                    </div>
                    {Object.keys(matchingAlbums).length > 6 && (
                        <div className="flex justify-center mt-2">
                            <button
                                onClick={() => setExpandedAlbums(!expandedAlbums)}
                                className="text-sm text-muted-foreground hover:text-foreground hover:underline transition"
                            >
                                {expandedAlbums ? "Show Less" : "View More"}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Artists Section */}
            {matchingArtists.length > 0 && (
                <div className="w-full">
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-3 md:gap-2">
                        {displayedArtists.map((artist) => (
                            <div
                                key={artist}
                                className="flex flex-col items-center gap-2 group cursor-pointer"
                                onClick={() => {
                                    sessionStorage.setItem("keep-search-persistence", "true");
                                    router.push(`/artists/${encodeURIComponent(artist)}`);
                                }}
                            >
                                <div className="relative h-20 w-20 md:h-28 md:w-28 border border-border bg-secondary rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition transform duration-300">
                                    <Disc className="w-8 h-8 md:w-14 md:h-14 text-background" />
                                </div>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="text-center text-foreground truncate w-28 md:w-32 px-1">
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
                    {matchingArtists.length > 6 && (
                        <div className="flex justify-center mt-4 mb-10">
                            <button
                                onClick={() => setExpandedArtists(!expandedArtists)}
                                className="text-sm text-muted-foreground hover:text-foreground hover:underline transition"
                            >
                                {expandedArtists ? "Show Less" : "View More"}
                            </button>
                        </div>
                    )}
                </div>
            )}


        </div>
    );
};

export default SearchContent;