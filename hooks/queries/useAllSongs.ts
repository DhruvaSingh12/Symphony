"use client";

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { fetchAllSongs } from '@/lib/api/songs';
import { Song } from '@/types';

export function useAllSongs() {
  return useQuery<Song[]>({
    queryKey: queryKeys.songs.all,
    queryFn: fetchAllSongs,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}
