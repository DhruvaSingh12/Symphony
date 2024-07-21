"use client";

import React from 'react';
import { Song } from '@/types';
import MediaItem from './MediaItem';
import LikeButton from './LikeButton';

interface ArtistModalProps {
  artist: string;
  artistData: { songs: Song[]; albums: Set<string> };
  onClose: () => void;
}

const ArtistModal: React.FC<ArtistModalProps> = ({ artist, artistData, onClose }) => {
  return (
    <div className="fixed inset-0 mx-1 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-neutral-900 p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[70vh] overflow-y-auto relative">
        <button
          type="button"
          className="absolute top-4 right-4 text-white text-3xl"
          onClick={onClose}
        >
          &times;
        </button>
        <div className='flex flex-row gap-x-5 items-center'>
          <h2 className="text-2xl font-bold text-white">
            {artist}
          </h2>
          <h4 className='text-neutral-500'>{artistData.songs.length} song(s)</h4>
        </div>
        {Array.from(artistData.albums).map((album) => (
          <div key={album} className="mt-4">
            <h3 className="text-l font-semibold text-white">{album}</h3>
            <ul className="mt-2 space-y-2">
              {artistData.songs
                .filter((song) => song.album === album)
                .map((song) => (
                  <li key={song.id} className="flex items-center space-x-2 mx-2">
                    <MediaItem data={song} />
                    <LikeButton songId={song.id} />
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArtistModal;
