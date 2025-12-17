"use client";

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { fetchSongsByQuery } from '@/lib/api/songs';

export function useSongsByQuery(searchQuery: string) {
  return useQuery({
    queryKey: queryKeys.songs.search(searchQuery),
    queryFn: () => fetchSongsByQuery(searchQuery),
    enabled: searchQuery.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    placeholderData: (previousData) => previousData,
  });
}