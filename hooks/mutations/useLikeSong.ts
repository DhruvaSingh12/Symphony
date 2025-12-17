"use client";

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSupabaseClient } from '@/providers/SupabaseProvider';
import { useUser } from '@/hooks/useUser';
import { queryKeys } from '@/lib/queryKeys';
import { Song } from '@/types';
import toast from 'react-hot-toast';

interface LikeSongParams {
  songId: number;
  isCurrentlyLiked: boolean;
}

export function useLikeSong() {
  const supabaseClient = useSupabaseClient();
  const { user } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ songId, isCurrentlyLiked }: LikeSongParams) => {
      if (!user) throw new Error('User not authenticated');

      if (isCurrentlyLiked) {
        // Unlike
        const { error } = await supabaseClient
          .from('liked_songs')
          .delete()
          .eq('user_id', user.id)
          .eq('song_id', songId);

        if (error) throw error;
        return { action: 'unlike', songId };
      } 
      else {
        const { data: existingLike } = await supabaseClient
            .from('liked_songs')
            .select('*')
            .eq('user_id', user.id)
            .eq('song_id', songId)
            .single();

        if (existingLike) {
            return { action: 'like', songId };
        }

        const { error } = await supabaseClient
          .from('liked_songs')
          .insert({
            user_id: user.id,
            song_id: songId
          });

        if (error) throw error;
        return { action: 'like', songId };
      }
    },
    // Optimistic update for instant UI feedback
    onMutate: async ({ songId, isCurrentlyLiked }) => {
      // Cancel any outgoing refetches for both query types
      await queryClient.cancelQueries({ queryKey: queryKeys.user.likedSongs(user?.id) });
      await queryClient.cancelQueries({ queryKey: queryKeys.songs.liked(user?.id) });

      // Snapshot the previous values
      const previousLikedSongs = queryClient.getQueryData<Song[]>(
        queryKeys.user.likedSongs(user?.id)
      );

      const previousInfiniteData = queryClient.getQueryData<{
        pages: Song[][];
        pageParams: unknown[];
      }>(queryKeys.songs.liked(user?.id));

      // Optimistically update the regular query
      if (previousLikedSongs && isCurrentlyLiked) {
        queryClient.setQueryData<Song[]>(
          queryKeys.user.likedSongs(user?.id),
          previousLikedSongs.filter((song) => song.id !== songId)
        );
      }

      // Optimistically update the infinite query
      if (previousInfiniteData && isCurrentlyLiked) {
        queryClient.setQueryData(
          queryKeys.songs.liked(user?.id),
          {
            ...previousInfiniteData,
            pages: previousInfiniteData.pages.map(page =>
              page.filter(song => song.id !== songId)
            ),
          }
        );
      }

      // Return context with the previous values
      return { previousLikedSongs, previousInfiniteData };
    },
    onSuccess: (data) => {
      // Show success message
      if (data.action === 'like') {
        toast.success('Added to Liked Songs!');
      } else {
        toast.success('Removed from Liked Songs');
      }

      // Invalidate and refetch both liked songs queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.user.likedSongs(user?.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.songs.liked(user?.id) });
    },
   onError: (err: Error, variables, context) => {
      // Rollback on error - restore both queries
      if (context?.previousLikedSongs) {
        queryClient.setQueryData(
          queryKeys.user.likedSongs(user?.id),
          context.previousLikedSongs
        );
      }
      if (context?.previousInfiniteData) {
        queryClient.setQueryData(
          queryKeys.songs.liked(user?.id),
          context.previousInfiniteData
        );
      }
      toast.error(err?.message || 'Something went wrong');
    },
  });
}

// Hook to check if a song is liked
export function useIsLiked(songId: number) {
  const { user } = useUser();
  const queryClient = useQueryClient();

  // Check the regular liked songs query (used by LikeButton for initial hydration)
  const likedSongs = queryClient.getQueryData<Song[]>(
    queryKeys.user.likedSongs(user?.id)
  );

  if (likedSongs?.some((song) => song.id === songId)) {
    return true;
  }

  // Also check infinite query data structure (used by liked page infinite scroll)
  const infiniteData = queryClient.getQueryData<{
    pages: Song[][];
    pageParams: unknown[];
  }>(queryKeys.songs.liked(user?.id));

  if (infiniteData?.pages) {
    const allSongs = infiniteData.pages.flat();
    return allSongs.some((song) => song.id === songId);
  }

  return false;
}