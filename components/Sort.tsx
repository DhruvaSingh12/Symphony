"use client";

import { useState, useEffect } from 'react';
import { Song } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-foreground">Discover Music</h1>
        <Select value={sortOption} onValueChange={setSortOption}>
          <SelectTrigger className="w-[180px] bg-background border-border">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lastUpdated">Last Updated</SelectItem>
            <SelectItem value="dateAddedAsc">Date Added ↑</SelectItem>
            <SelectItem value="dateAddedDesc">Date Added ↓</SelectItem>
            <SelectItem value="titleAsc">Name ↑</SelectItem>
            <SelectItem value="titleDesc">Name ↓</SelectItem>
            <SelectItem value="authorAsc">Artist ↑</SelectItem>
            <SelectItem value="authorDesc">Artist ↓</SelectItem>
            <SelectItem value="albumAsc">Album ↑</SelectItem>
            <SelectItem value="albumDesc">Album ↓</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ContentComponent songs={sortedSongs} />
    </div>
  );
};

export default Sort;
