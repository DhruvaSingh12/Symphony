import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { Song } from "@/types";
import { SONG_RELATIONAL_SELECT, mapRelationalSong, RawSongData } from "@/lib/api/songs";
import { queryKeys } from "@/lib/queryKeys";

export function useInfiniteSongs(
    table: 'songs' | 'liked_songs' | 'user_songs', 
    initialSongs: Song[], 
    limit: number = 20,
    userId?: string
) {
    const supabaseClient = useSupabaseClient();
    const queryClient = useQueryClient();

    const fetchSongs = async ({ pageParam = 0 }: { pageParam: number }) => {
        let query;
        
        if (table === 'liked_songs') {
            query = supabaseClient
                .from('liked_songs')
                .select(`
                    *,
                    songs (
                        ${SONG_RELATIONAL_SELECT}
                    )
                `);
        } else {
            query = supabaseClient
                .from('songs')
                .select(SONG_RELATIONAL_SELECT);
        }

        if ((table === 'liked_songs' || table === 'user_songs') && userId) {
            query = query.eq('user_id', userId);
        }

        const { data, error } = await query
            .range(pageParam, pageParam + limit - 1)
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (table === 'liked_songs') {
            if (!data) return [];
            const songsRaw = (data as unknown as Array<{ songs: RawSongData }>)
                .map(item => item.songs)
                .filter(Boolean);
            
            return songsRaw.map(mapRelationalSong).filter((s): s is Song => !!s);
        }
        
        const songsRaw = (data as unknown as RawSongData[]) || [];
        return songsRaw.map(mapRelationalSong).filter((s): s is Song => !!s);
    };

    const queryKey = table === 'liked_songs' 
        ? queryKeys.songs.liked(userId) 
        : table === 'user_songs' 
            ? queryKeys.user.songs(userId) 
            : queryKeys.songs.all;

    const result = useInfiniteQuery({
        queryKey,
        queryFn: fetchSongs,
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length >= limit ? allPages.length * limit : undefined;
        },
        initialData: {
            pages: [initialSongs],
            pageParams: [0],
        },
    });

    // Prefetch next page when we have more data
    useEffect(() => {
        if (result.hasNextPage && !result.isFetchingNextPage) {
            const pagesCount = result.data?.pages.length || 0;
            if (pagesCount > 0) {
                queryClient.prefetchInfiniteQuery({
                    queryKey,
                    queryFn: fetchSongs,
                    initialPageParam: pagesCount * limit,
                });
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [result.hasNextPage, result.isFetchingNextPage, result.data?.pages.length]);

    return result;
}