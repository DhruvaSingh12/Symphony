"use client";

import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Song } from "@/types";
import { useSongsByArtist } from "@/hooks/queries/useSongsByArtist";
import { useParams } from "next/navigation";
import Box from "@/components/Box";
import { BounceLoader } from "react-spinners";
import { useMemo, useState } from "react";
import AlbumCard from "../components/AlbumCard";
import AlbumModal from "@/components/AlbumModal";
import useOnPlay from "@/hooks/useOnPlay";
import SongRow from "@/components/SongRow";

const ArtistPage = () => {
    const params = useParams();
    const artistName = decodeURIComponent(params.name as string);

    const { data: songs, isLoading, error } = useSongsByArtist(artistName);
    const songCount = songs?.length || 0;

    const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
    const [albumData, setAlbumData] = useState<{ songs: Song[] } | null>(null);

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

    const onPlay = useOnPlay(songs || []);

    const handleAlbumClick = (albumName: string, albumSongs?: Song[]) => {
        setSelectedAlbum(albumName);
        if (albumSongs) {
            setAlbumData({ songs: albumSongs });
        } else if (songs) {
            const filtered = songs.filter(s => s.album === albumName);
            setAlbumData({ songs: filtered });
        }
    };

    const closeAlbumModal = () => {
        setSelectedAlbum(null);
        setAlbumData(null);
    };

    return (
        <div className="h-full w-full flex flex-col overflow-hidden">
            <div className="flex-none px-2 md:px-0 md:pr-2 pt-2">
                <Header>
                    <div className="flex flex-col gap-y-2">
                        <h1 className="text-2xl md:text-5xl lg:text-6xl font-bold text-foreground">
                            {artistName}
                        </h1>
                    </div>
                </Header>
            </div>
            <div className="flex-1 min-h-0 mt-2 px-2 md:px-0 md:pr-2 pb-2">
                <Card className="border-border h-full flex flex-col overflow-hidden relative">
                    <ScrollArea className="h-full w-full">
                        {error ? (
                            <CardContent className="p-4">
                                <p className="text-center text-muted-foreground">
                                    Error loading songs. Please try again.
                                </p>
                            </CardContent>
                        ) : (
                            <div className="p-4">
                                <div className="px-4">
                                    <h2 className="text-2xl font-bold mb-2">Top Songs</h2>
                                    <div className="flex flex-col w-full">
                                        {topSongs.map((song, index) => (
                                            <div key={song.id} className="border-b border-border/50 last:border-b-0">
                                                <SongRow
                                                    song={song}
                                                    index={index}
                                                    onPlay={onPlay}
                                                    onAlbumClick={(album) => handleAlbumClick(album)}
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
                                    <div className="w-full px-4 py-2 min-w-0">
                                        <h2 className="text-2xl font-bold mb-2">Albums</h2>
                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                                            {Object.entries(albums).map(([albumName, albumSongs]) => (
                                                <AlbumCard
                                                    key={albumName}
                                                    albumName={albumName}
                                                    songs={albumSongs}
                                                    onClick={() => handleAlbumClick(albumName, albumSongs)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </ScrollArea>

                    {selectedAlbum && albumData && (
                        <AlbumModal
                            album={selectedAlbum}
                            albumData={albumData}
                            onClose={closeAlbumModal}
                        />
                    )}
                </Card>
            </div>
        </div>
    );
};

export default ArtistPage;