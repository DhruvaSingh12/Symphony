import React from 'react';
import { Song } from '@/types';
import MediaItem from './MediaItem';
import LikeButton from './LikeButton';

interface AlbumModalProps {
    album: string;
    albumData: { songs: Song[] };
    onClose: () => void;
}

const AlbumModal: React.FC<AlbumModalProps> = ({ album, albumData, onClose }) => {
    const songCount = albumData.songs.length;

    return (
        <div className="fixed inset-0 mx-2 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-neutral-900 p-6 rounded-lg shadow-lg max-w-3xl w-full max-h-[75vh] overflow-y-auto relative">
                <button
                    type="button"
                    className="absolute top-4 right-4 text-white text-2xl"
                    onClick={onClose}
                >
                    &times;
                </button>
                <div className="flex flex-row gap-x-6 items-center">
                    <h2 className="text-2xl font-bold text-white">{album}</h2>
                    <h4 className="text-neutral-500">
                        {songCount} {songCount === 1 ? 'song' : 'songs'}
                    </h4>
                </div>
                <div className="mt-4">
                    <ul className="space-y-2">
                        {albumData.songs.map((song) => (
                            <li key={song.id} className="flex items-center space-x-4">
                                <MediaItem data={song} />
                                <LikeButton songId={song.id} />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AlbumModal;
