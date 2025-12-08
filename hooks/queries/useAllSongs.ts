"use client";

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { fetchAllSongs } from '@/lib/api/songs';

export function useAllSongs() {
  return useQuery({
    queryKey: queryKeys.songs.lists(),
    queryFn: fetchAllSongs,
    // Keep data fresh for 5 minutes
    staleTime: 5 * 60 * 1000,
  });
}
