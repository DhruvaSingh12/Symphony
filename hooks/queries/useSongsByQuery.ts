"use client";

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { fetchSongsByQuery } from '@/lib/api/songs';

export function useSongsByQuery(searchQuery: string) {
  return useQuery({
    queryKey: queryKeys.songs.search(searchQuery),
    queryFn: () => fetchSongsByQuery(searchQuery),
    // Only fetch if we have a query or want all songs (empty query)
    enabled: true,
    // Keep previous data while fetching new results for smooth UX
    placeholderData: (previousData) => previousData,
  });
}
