"use client";

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { fetchSongsByArtist } from '@/lib/api/songs';

export function useSongsByArtist(artistName: string) {
  return useQuery({
    queryKey: queryKeys.artists.songs(artistName),
    queryFn: () => fetchSongsByArtist(artistName),
    // Only fetch if we have an artist name
    enabled: !!artistName,
    // Keep data fresh for 5 minutes
    staleTime: 5 * 60 * 1000,
  });
}
