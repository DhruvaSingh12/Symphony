"use client";

import { useState, useEffect } from 'react';
import { Song } from '@/types';

interface SortProps<T> {
  songs: Song[];
  ContentComponent: React.FC<{ songs: Song[] }>;
}

const Sort = <T extends { songs: Song[] }>({ songs, ContentComponent }: SortProps<T>) => {
  const [sortedSongs, setSortedSongs] = useState<Song[]>(songs);
  const [sortOption, setSortOption] = useState<string>('lastUpdated');

  useEffect(() => {
    const sortSongs = (songs: Song[], option: string) => {
      return songs.slice().sort((a, b) => {
        switch (option) {
          case 'titleAsc':
            return a.title.localeCompare(b.title);
          case 'titleDesc':
            return b.title.localeCompare(a.title);
          case 'authorAsc':
            return a.artist[0].localeCompare(b.artist[0]) || a.title.localeCompare(b.title);
          case 'authorDesc':
            return b.artist[0].localeCompare(a.artist[0]) || b.title.localeCompare(a.title);
          case 'albumAsc':
            return a.album.localeCompare(b.album) || a.title.localeCompare(b.title);
          case 'albumDesc':
            return b.album.localeCompare(a.album) || b.title.localeCompare(a.title);
          case 'dateAddedAsc':
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          case 'dateAddedDesc':
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          case 'lastUpdated':
          default:
            return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        }
      });
    };

    setSortedSongs(sortSongs(songs, sortOption));
  }, [songs, sortOption]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-white text-2xl font-semibold mt-4">Discover Music</h1>
        <div className='mt-4'>
          <label htmlFor="sort-options" className="sr-only">Sort by</label>
          <select
            id="sort-options"
            className="bg-neutral-500 text-white p-2 rounded-lg"
            value={sortOption}
            onChange={handleSortChange}
          >
            <option value="lastUpdated">Last Updated</option>
            <option value="dateAddedAsc">Date Added ↑</option>
            <option value="dateAddedDesc">Date Added ↓</option>
            <option value="titleAsc">Name ↑</option>
            <option value="titleDesc">Name ↓</option>
            <option value="authorAsc">Artist ↑</option>
            <option value="authorDesc">Artist ↓</option>
            <option value="albumAsc">Album ↑</option>
            <option value="albumDesc">Album ↓</option>
          </select>
        </div>
      </div>
      <ContentComponent songs={sortedSongs} />
    </div>
  );
};

export default Sort;
