"use client";

import React, { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Song } from '@/types';
import SortArtist from './sortartist';
import ArtistModal from '@/components/ArtistModal';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';

const ArtistContent = () => {
    const [artists, setArtists] = useState<{ [key: string]: { songs: Song[]; albums: Set<string> } }>({});
    const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
    const supabase = useSupabaseClient();
    const router = useRouter();
    const { isLoading, user } = useUser();

    useEffect(() => {
        if (!isLoading && !user) {
            router.replace("/");
        }
    }, [isLoading, user, router]);

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

            songs.forEach((song) => {
                song.artist.forEach((artist: string) => {
                    if (!artistData[artist]) {
                        artistData[artist] = { songs: [], albums: new Set() };
                    }
                    artistData[artist].songs.push(song);
                    artistData[artist].albums.add(song.album);
                });
            });

            setArtists(artistData);
        };

        fetchArtists();
    }, [supabase]);

    const openArtistModal = (artist: string) => {
        setSelectedArtist(artist);
    };

    const closeArtistModal = () => {
        setSelectedArtist(null);
    };

    return (
        <div>
            <SortArtist
                artists={artists}
                ContentComponent={({ artists }) => (
                    <div className="bg-neutral-900 p-4 rounded-lg">
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {Object.keys(artists).map((artist, index) => (
                                <div
                                    key={artist}
                                    className="p-4 rounded-lg bg-neutral-800 hover:bg-neutral-700 cursor-pointer flex flex-col justify-between items-start"
                                    onClick={() => openArtistModal(artist)}
                                >
                                    <div className="flex items-baseline ">
                                 
                                        <h2 className="text-lg font-bold text-white">{artist}</h2>
                                    </div>
                                    <div className="text-sm text-neutral-400">{artists[artist].songs.length} song(s)</div>
                                </div>
                            ))}
                        </div>
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
