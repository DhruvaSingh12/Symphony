"use client";

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { fetchUserSongs } from '@/lib/api/songs';
import { useUser } from '@/hooks/useUser';

export function useUserSongs() {
  const { user } = useUser();
  
  return useQuery({
    queryKey: queryKeys.user.songs(user?.id),
    queryFn: () => fetchUserSongs(),
    // Only fetch if user is logged in
    enabled: !!user,
    // Refetch when tab is focused
    refetchOnWindowFocus: true,
  });
}