import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Song } from '@/types';
import LikeButton from '@/components/LikeButton';
import MediaItem from '@/components/MediaItem';
import ArtistModal from './ArtistModal';
import AlbumModal from './AlbumModal';

interface TableProps {
    songs: Song[];
    onPlay: (id: string) => void;
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
};

const Table: React.FC<TableProps> = ({ songs, onPlay }) => {
    const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
    const [artistData, setArtistData] = useState<{ songs: Song[]; albums: Set<string> } | null>(null);
    const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
    const [albumData, setAlbumData] = useState<{ songs: Song[] } | null>(null);
    const [dropdownVisible, setDropdownVisible] = useState<Record<string, boolean>>({});

    const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            for (const key in dropdownRefs.current) {
                if (dropdownRefs.current[key] && !dropdownRefs.current[key]?.contains(target)) {
                    setDropdownVisible(prev => ({ ...prev, [key]: false }));
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleArtistClick = (artist: string) => {
        const filteredSongs = songs.filter(song => song.artist.includes(artist));
        const albums = new Set(filteredSongs.map(song => song.album));
        setArtistData({ songs: filteredSongs, albums });
        setSelectedArtist(artist);
    };

    const handleAlbumClick = (album: string, id: string) => {
        const filteredSongs = songs.filter(song => song.album === album);
        setAlbumData({ songs: filteredSongs });
        setSelectedAlbum(album);
        setDropdownVisible(prev => ({ ...prev, [id]: false }));
    };

    const closeArtistModal = () => {
        setSelectedArtist(null);
        setArtistData(null);
    };

    const closeAlbumModal = () => {
        setSelectedAlbum(null);
        setAlbumData(null);
    };

    const toggleDropdown = (id: string) => {
        setDropdownVisible(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const memoizedSongs = useMemo(() => songs, [songs]);

    return (
        <div className="w-full px-2">
            <table className="w-full text-left table-auto border-collapse">
                <thead className="bg-neutral-800 text-neutral-400">
                    <tr>
                        <th className="hidden sm:table-cell py-3 pl-3 pr-2 border-b border-neutral-700">#</th>
                        <th className="py-3 pl-2 border-b border-neutral-700"></th>
                        <th className="py-3 pl-0 pr-2 border-b border-neutral-700">Media</th>
                        <th className="py-3 px-2 border-b border-neutral-700">Artist</th>
                        <th className="hidden md:table-cell py-3 px-2 border-b border-neutral-700">Album</th>
                        <th className="hidden xl:table-cell py-3 px-2 border-b border-neutral-700">Date Added</th>
                        <th className="py-3 pl-1 pr-2 border-b border-neutral-700">Like</th>
                        <th className='py-3 border-b border-neutral-700'></th>
                    </tr>
                </thead>
                <tbody className="bg-neutral-900 text-neutral-200">
                    {memoizedSongs.map((song, index) => (
                        <tr key={song.id} className="border-b border-neutral-800 hover:bg-neutral-800 transition-all duration-200">
                            <td className="hidden sm:table-cell py-3 pl-4 pr-2">{index + 1}</td>
                            <td className="py-3 mb-3 px-1 flex">
                                <div className="w-[48px] h-[48px]">
                                    <MediaItem
                                        data={song}
                                        onClick={onPlay}
                                    />
                                </div>
                            </td>
                            <td className="py-3 px-3">{song.title}</td>
                            <td className="py-3 px-2">
                                {song.artist.map((artist, i) => (
                                    <span
                                        key={artist}
                                        className="text-white cursor-pointer hover:text-purple-500"
                                        onClick={() => handleArtistClick(artist)}
                                    >
                                        {i > 0 && ', '}
                                        {artist}
                                    </span>
                                ))}
                            </td>
                            <td className="hidden md:table-cell py-3 px-2">
                                <span
                                    className="text-white cursor-pointer hover:text-purple-500"
                                    onClick={() => handleAlbumClick(song.album, song.id)}
                                >
                                    {song.album}
                                </span>
                            </td>
                            <td className="hidden xl:table-cell py-3 px-2">{formatDate(song.created_at)}</td>
                            <td className="py-3 pl-1 pr-2">
                                <LikeButton songId={song.id} />
                            </td>
                            <td className="px-2 pt-1 pb-1 block md:hidden relative">
                                <button
                                    className="text-white text-xl hover:text-purple-500"
                                    onClick={() => toggleDropdown(song.id)}
                                    aria-haspopup="true"
                                    aria-expanded={dropdownVisible[song.id]}
                                >
                                    &#x22EE;
                                </button>
                                {dropdownVisible[song.id] && (
                                    <div
                                        ref={ref => {
                                            if (ref) {
                                                dropdownRefs.current[song.id] = ref;
                                            }
                                        }}
                                        className="absolute bg-neutral-700 p-2 mt-1 rounded shadow-lg z-10 right-0"
                                    >
                                        <div className="py-1">
                                            <span
                                                className="block text-white cursor-pointer border-b hover:text-purple-500"
                                                onClick={() => handleAlbumClick(song.album, song.id)}
                                            >
                                                {song.album}
                                            </span>
                                        </div>
                                        <div className="py-1">
                                            <span className="block text-white">
                                                {formatDate(song.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {selectedArtist && artistData && (
                <ArtistModal
                    artist={selectedArtist}
                    artistData={artistData}
                    onClose={closeArtistModal}
                />
            )}
            {selectedAlbum && albumData && (
                <AlbumModal
                    album={selectedAlbum}
                    albumData={albumData}
                    onClose={closeAlbumModal}
                />
            )}
        </div>
    );
};

export default Table;