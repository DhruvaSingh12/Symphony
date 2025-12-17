"use client";

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { fetchAllSongs } from '@/lib/api/songs';
import { Song } from '@/types';

export function useAllSongs() {
  return useQuery<Song[]>({
    queryKey: queryKeys.songs.all,
    queryFn: () => fetchAllSongs(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}