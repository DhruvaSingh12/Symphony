import React, { useState } from 'react';
import { Song } from '@/types';
import useLoadImage from '@/hooks/useLoadImage';
import LikeButton from '@/components/LikeButton';
import Image from 'next/image';
import { BsFillPlayFill } from 'react-icons/bs';
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

    const handleArtistClick = (artist: string) => {
        const filteredSongs = songs.filter(song => song.artist.includes(artist));
        const albums = new Set(filteredSongs.map(song => song.album));
        setArtistData({ songs: filteredSongs, albums });
        setSelectedArtist(artist);
    };

    const handleAlbumClick = (album: string) => {
        const filteredSongs = songs.filter(song => song.album === album);
        setAlbumData({ songs: filteredSongs });
        setSelectedAlbum(album);
    };

    const closeArtistModal = () => {
        setSelectedArtist(null);
        setArtistData(null);
    };

    const closeAlbumModal = () => {
        setSelectedAlbum(null);
        setAlbumData(null);
    };

    return (
        <div className="w-full px-2">
            <table className="w-full text-left table-auto border-collapse">
                <thead className="bg-neutral-800 text-neutral-400">
                    <tr>
                        <th className="hidden sm:table-cell py-3 pl-3 pr-2 border-b border-neutral-700">#</th>
                        <th className="py-3 px-2 border-b border-neutral-700">Cover</th>
                        <th className="py-3 px-2 border-b border-neutral-700">Title</th>
                        <th className="py-3 px-2 border-b border-neutral-700">Artist</th>
                        <th className="hidden md:table-cell py-3 px-2 border-b border-neutral-700">Album</th>
                        <th className="hidden xl:table-cell py-3 px-2 border-b border-neutral-700">Date Added</th>
                        <th className="py-3 pl-2 pr-1 border-b border-neutral-700">Like</th>
                    </tr>
                </thead>
                <tbody className="bg-neutral-900 text-neutral-200">
                    {songs.map((song, index) => {
                        const imageUrl = useLoadImage(song);

                        return (
                            <tr key={song.id} className="border-b border-neutral-800 hover:bg-neutral-800 transition-all duration-200">
                                <td className="hidden sm:table-cell py-3 pl-4 pr-3">{index + 1}</td>
                                <td className="py-3 px-1">
                                    <div className="relative w-[48px] h-[48px]">
                                        <Image
                                            fill
                                            src={imageUrl || '/images/liked.png'}
                                            alt={`${song.title} cover`}
                                            className="object-cover rounded-md"
                                        />
                                        <button
                                            onClick={() => onPlay(song.id)}
                                            className="
                                                absolute
                                                inset-0
                                                flex
                                                items-center
                                                justify-center
                                                bg-black bg-opacity-50
                                                text-white
                                                opacity-0
                                                hover:opacity-100
                                                transition
                                                rounded-md
                                            "
                                            aria-label={`Play ${song.title}`}
                                        >
                                            <BsFillPlayFill size={30} />
                                        </button>
                                    </div>
                                </td>
                                <td className="py-3 px-2">{song.title}</td>
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
                                        onClick={() => handleAlbumClick(song.album)}
                                    >
                                        {song.album}
                                    </span>
                                </td>
                                <td className="hidden xl:table-cell py-3 px-2">{formatDate(song.created_at)}</td>
                                <td className="py-3 px-2">
                                    <LikeButton songId={song.id} />
                                </td>
                            </tr>
                        );
                    })}
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
