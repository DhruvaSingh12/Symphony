"use client";

import React, { useEffect, useState } from 'react';
import { useSupabaseClient } from '@/providers/SupabaseProvider';
import { Song } from '@/types';
import SortArtist from './sortartist';
import ArtistModal from '@/components/ArtistModal';
import ArtistSearch from './ArtistSearch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Music } from 'lucide-react';

const ArtistContent = () => {
    const [artists, setArtists] = useState<{ [key: string]: { songs: Song[]; albums: Set<string> } }>({});
    const [filteredArtists, setFilteredArtists] = useState<{ [key: string]: { songs: Song[]; albums: Set<string> } }>({});
    const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
    const supabase = useSupabaseClient();

    useEffect(() => {
        const fetchArtists = async () => {
            const { data: songs, error } = await supabase
                .from('songs')
                .select('*');

            if (error) {
                console.error(error);
                return;
            }

            const artistData: { [key: string]: { songs: Song[]; albums: Set<string> } } = {};
            const typedSongs = (songs as unknown as Song[]) || [];

            typedSongs.forEach((song) => {
                (song.artist || []).forEach((artist: string) => {
                    if (!artistData[artist]) {
                        artistData[artist] = { songs: [], albums: new Set() };
                    }
                    artistData[artist].songs.push(song);
                    artistData[artist].albums.add(song.album);
                });
            });

            setArtists(artistData);
            setFilteredArtists(artistData);
        };

        fetchArtists();
    }, [supabase]);

    const openArtistModal = (artist: string) => {
        setSelectedArtist(artist);
    };

    const closeArtistModal = () => {
        setSelectedArtist(null);
    };

    const handleSearch = (searchTerm: string) => {
        if (searchTerm === '') {
            setFilteredArtists(artists);
        } else {
            const filtered = Object.keys(artists).filter(artist => 
                artist.toLowerCase().includes(searchTerm.toLowerCase())
            ).reduce((obj, key) => {
                obj[key] = artists[key];
                return obj;
            }, {} as { [key: string]: { songs: Song[]; albums: Set<string> } });
            setFilteredArtists(filtered);
        }
    };

    return (
        <div className="p-4">
            <div className='mb-4'><ArtistSearch onSearch={handleSearch} /></div>
            <SortArtist
                artists={filteredArtists}
                ContentComponent={({ artists }) => (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {Object.keys(artists).map((artist) => {
                            const songCount = artists[artist].songs.length;
                            return (
                                <Card
                                    key={artist}
                                    className="bg-card hover:bg-accent/80 cursor-pointer transition-all border-border"
                                    onClick={() => openArtistModal(artist)}
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center gap-2">
                                            <Music className="h-5 w-5 text-muted-foreground" />
                                            <CardTitle className="text-lg">{artist}</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription>
                                            {songCount} {songCount === 1 ? 'song' : 'songs'}
                                        </CardDescription>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            />

            {selectedArtist && (
                <ArtistModal
                    artist={selectedArtist}
                    artistData={artists[selectedArtist]}
                    onClose={closeArtistModal}
                />
            )}
        </div>
    );
};

export default ArtistContent;
