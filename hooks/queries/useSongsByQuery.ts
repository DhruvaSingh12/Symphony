"use client";

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { fetchSongsByQuery } from '@/lib/api/songs';

export function useSongsByQuery(searchQuery: string) {
  return useQuery({
    queryKey: queryKeys.songs.search(searchQuery),
    queryFn: () => fetchSongsByQuery(searchQuery),
    enabled: searchQuery.length > 0,
    placeholderData: (previousData) => previousData,
  });
}
