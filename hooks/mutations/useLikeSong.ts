"use client";

import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useSupabaseClient } from '@/providers/SupabaseProvider';
import { useUser } from '@/hooks/auth/useUser';
import { queryKeys } from '@/lib/queryKeys';
import { Song } from '@/types';
import toast from 'react-hot-toast';

interface LikeSongParams {
  songId: number;
  isCurrentlyLiked: boolean;
  song?: Song; // Optional song object for optimistic additions
}

export function useLikeSong() {
  const supabaseClient = useSupabaseClient();
  const { user } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ songId, isCurrentlyLiked }: LikeSongParams) => {
      if (!user) throw new Error('User not authenticated');

      if (isCurrentlyLiked) {
        const { error } = await supabaseClient
          .from('liked_songs')
          .delete()
          .eq('user_id', user.id)
          .eq('song_id', songId);

        if (error) throw error;
        return { action: 'unlike', songId };
      } 
      else {
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
    onMutate: async ({ songId, isCurrentlyLiked, song }) => {
      const userId = user?.id;
      if (!userId) return;

      const likedListKey = queryKeys.songs.liked(userId);
      const statusKey = queryKeys.songs.likeStatus(userId, songId);

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: likedListKey });
      await queryClient.cancelQueries({ queryKey: statusKey });

      // Snapshot values
      const previousInfiniteData = queryClient.getQueryData(likedListKey);
      const previousStatus = queryClient.getQueryData(statusKey);

      // 1. Optimistically update individual status
      queryClient.setQueryData(statusKey, !isCurrentlyLiked);

      // 2. Optimistically update infinite query data structure
      if (previousInfiniteData) {
        queryClient.setQueryData(
          likedListKey,
          (old: any) => {
            if (!old) return old;
            
            if (isCurrentlyLiked) {
              // Unlike: Remove from ALL pages
              return {
                ...old,
                pages: old.pages.map((page: Song[]) =>
                  page.filter(item => item.id !== songId)
                ),
              };
            } else if (song) {
              // Like: Add to FIRST page if it doesn't exist
              const alreadyExists = old.pages.some((page: Song[]) => 
                page.some(item => item.id === songId)
              );
              
              if (alreadyExists) return old;

              const newPages = [...old.pages];
              newPages[0] = [song, ...newPages[0]];
              
              return {
                ...old,
                pages: newPages,
              };
            }
            return old;
          }
        );
      }

      return { previousInfiniteData, previousStatus, userId, songId };
    },
    onSuccess: (data) => {
      if (data.action === 'like') {
        toast.success('Added to Liked Songs!');
      } else {
        toast.success('Removed from Liked Songs');
      }
    },
    onError: (err: Error, variables, context) => {
      if (context) {
        queryClient.setQueryData(queryKeys.songs.liked(context.userId), context.previousInfiniteData);
        queryClient.setQueryData(queryKeys.songs.likeStatus(context.userId, context.songId), context.previousStatus);
      }
      toast.error(err?.message || 'Something went wrong');
    },
    onSettled: (data, error, variables, context) => {
      if (context?.userId) {
        // Use exact: false to catch any variations
        queryClient.invalidateQueries({ queryKey: queryKeys.songs.liked(context.userId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.songs.likeStatus(context.userId, variables.songId) });
      }
    }
  });
}

/**
 * Hook to check if a song is liked.
 * Reactive and uses multiple cache layers for efficiency.
 */
export function useIsLiked(songId: number) {
  const { user } = useUser();
  const supabaseClient = useSupabaseClient();
  const queryClient = useQueryClient();

  const userId = user?.id;

  return useQuery({
    queryKey: queryKeys.songs.likeStatus(userId, songId),
    queryFn: async () => {
      if (!userId || !songId) return false;

      // 1. Check infinite data cache first
      const infiniteData = queryClient.getQueryData<{ pages: Song[][] }>(
        queryKeys.songs.liked(userId)
      );
      
      if (infiniteData?.pages) {
        const found = infiniteData.pages.some(page => 
          page.some(song => song.id === songId)
        );
        if (found) return true;
      }

      // 2. Fallback to direct DB check
      const { data, error } = await supabaseClient
        .from('liked_songs')
        .select('id')
        .eq('user_id', userId)
        .eq('song_id', songId)
        .maybeSingle();

      if (error) {
        console.error('Error checking like status:', error);
        return false;
      }

      return !!data;
    },
    enabled: !!userId && !!songId,
    staleTime: 1000 * 60 * 5, // 5 minutes standard stale time
  });
}