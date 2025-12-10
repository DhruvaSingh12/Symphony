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
        const { data: existingLike, error: checkError } = await supabaseClient
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
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.user.likedSongs(user?.id) });

      // Snapshot the previous value
      const previousLikedSongs = queryClient.getQueryData<Song[]>(
        queryKeys.user.likedSongs(user?.id)
      );

      // Optimistically update to the new value
      if (previousLikedSongs) {
        if (isCurrentlyLiked) {
          // Remove song from liked songs
          queryClient.setQueryData<Song[]>(
            queryKeys.user.likedSongs(user?.id),
            previousLikedSongs.filter((song) => song.id !== songId)
          );
        } else {
          // We can't add to the list optimistically because we don't have the full song data here
          // Just invalidate to refetch
        }
      }

      // Return context with the previous value
      return { previousLikedSongs };
    },
    onSuccess: (data) => {
      // Show success message
      if (data.action === 'like') {
        toast.success('Added to Liked Songs!');
      } else {
        toast.success('Removed from Liked Songs');
      }

      // Invalidate and refetch liked songs to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.user.likedSongs(user?.id) });
    },
   onError: (err: any, variables, context) => {
      // Rollback on error
      if (context?.previousLikedSongs) {
        queryClient.setQueryData(
          queryKeys.user.likedSongs(user?.id),
          context.previousLikedSongs
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

  const likedSongs = queryClient.getQueryData<Song[]>(
    queryKeys.user.likedSongs(user?.id)
  );

  return likedSongs?.some((song) => song.id === songId) ?? false;
}