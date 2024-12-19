"use client";

import React, { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Song } from '@/types';
import SortArtist from './sortartist';
import ArtistModal from '@/components/ArtistModal';
import ArtistSearch from './ArtistSearch';

const ArtistContent = () => {
    const [artists, setArtists] = useState<{ [key: string]: { songs: Song[]; albums: Set<string> } }>({});
    const [filteredArtists, setFilteredArtists] = useState<{ [key: string]: { songs: Song[]; albums: Set<string> } }>({});
    const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
    const supabase = useSupabaseClient();

    const colorClasses = [
        { base: 'bg-purple-500', hover: 'hover:bg-purple-800' },
        { base: 'bg-blue-500', hover: 'hover:bg-blue-800' },
        { base: 'bg-green-500', hover: 'hover:bg-green-800' },
        { base: 'bg-red-500', hover: 'hover:bg-red-800' },
        { base: 'bg-yellow-500', hover: 'hover:bg-yellow-800' },
        { base: 'bg-pink-500', hover: 'hover:bg-pink-800' },
        { base: 'bg-indigo-500', hover: 'hover:bg-indigo-800' },
        { base: 'bg-teal-500', hover: 'hover:bg-teal-800' },
        { base: 'bg-orange-500', hover: 'hover:bg-orange-800' },
        { base: 'bg-lime-500', hover: 'hover:bg-lime-800' },
        { base: 'bg-cyan-500', hover: 'hover:bg-cyan-800' },
        { base: 'bg-amber-500', hover: 'hover:bg-amber-800' },
        { base: 'bg-fuchsia-500', hover: 'hover:bg-fuchsia-800' },
        { base: 'bg-rose-500', hover: 'hover:bg-rose-800' },
    ];


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
        <div>
            <div className='px-4 mt-4'><ArtistSearch onSearch={handleSearch} /></div>
            <SortArtist
                artists={filteredArtists}
                ContentComponent={({ artists }) => (
                    <div className="bg-neutral-900 p-4 rounded-lg">
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {Object.keys(artists).map((artist) => {
                                const randomColor = colorClasses[Math.floor(Math.random() * colorClasses.length)];
                                const songCount = artists[artist].songs.length;
                                return (
                                    <div
                                        key={artist}
                                        className={`p-4 rounded-lg ${randomColor.base} ${randomColor.hover} cursor-pointer flex flex-col justify-between items-start`}
                                        onClick={() => openArtistModal(artist)}
                                    >
                                        <div className="flex items-baseline">
                                            <h2 className="text-lg font-bold text-black">{artist}</h2>
                                        </div>
                                        <div className="text-sm text-black">
                                            {songCount} {songCount === 1 ? 'song' : 'songs'}
                                        </div>
                                    </div>
                                );
                            })}
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
