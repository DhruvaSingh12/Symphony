"use client";

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { fetchLikedSongs } from '@/lib/api/songs';
import { useUser } from '@/hooks/useUser';

export function useLikedSongs() {
  const { user } = useUser();
  
  return useQuery({
    queryKey: queryKeys.user.likedSongs(user?.id),
    queryFn: () => fetchLikedSongs(),
    // Only fetch if user is logged in
    enabled: !!user,
    // Shorter stale time for frequently changing data
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    // Refetch when tab is focused to get latest likes
    refetchOnWindowFocus: true,
  });
}