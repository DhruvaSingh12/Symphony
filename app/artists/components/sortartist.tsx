"use client";

import { useState, useEffect } from 'react';
import { Song } from '@/types';

interface ArtistData {
  songs: Song[];
  albums: Set<string>;
}

interface SortArtistProps {
  artists: { [key: string]: ArtistData };
  ContentComponent: React.FC<{ artists: { [key: string]: ArtistData } }>;
}

const SortArtist: React.FC<SortArtistProps> = ({ artists, ContentComponent }) => {
  const [sortedArtists, setSortedArtists] = useState<{ [key: string]: ArtistData }>(artists);
  const [sortOption, setSortOption] = useState<string>('lastUpdated');

  useEffect(() => {
    const sortArtists = (artists: { [key: string]: ArtistData }, option: string) => {
      const artistArray = Object.entries(artists);

      const sortedArray = artistArray.slice().sort(([artistA, dataA], [artistB, dataB]) => {
        switch (option) {
          case 'nameAsc':
            return artistA.localeCompare(artistB);
          case 'nameDesc':
            return artistB.localeCompare(artistA);
          case 'songCountAsc':
            return dataA.songs.length - dataB.songs.length || artistA.localeCompare(artistB);
          case 'songCountDesc':
            return dataB.songs.length - dataA.songs.length || artistA.localeCompare(artistB);
          case 'lastUpdated':
          default:
            return Math.max(...dataB.songs.map(song => new Date(song.updated_at || '').getTime())) -
              Math.max(...dataA.songs.map(song => new Date(song.updated_at || '').getTime()));
        }
      });

      return Object.fromEntries(sortedArray);
    };

    setSortedArtists(sortArtists(artists, sortOption));
  }, [artists, sortOption]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className='pt-4 pl-4'>
          <label htmlFor="sort-options" className="sr-only">Sort by</label>
          <select
            id="sort-options"
            className="bg-neutral-600 text-white p-2 rounded-lg"
            value={sortOption}
            onChange={handleSortChange}
          >
            <option value="lastUpdated">Last Updated</option>
            <option value="nameAsc">Name ↑</option>
            <option value="nameDesc">Name ↓</option>
            <option value="songCountAsc">Number of Songs ↑</option>
            <option value="songCountDesc">Number of Songs ↓</option>
          </select>
        </div>
      </div>
      <ContentComponent artists={sortedArtists} />
    </div>
  );
};

export default SortArtist;
