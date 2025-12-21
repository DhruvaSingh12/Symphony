import { useInfiniteQuery } from "@tanstack/react-query";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { Song } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function useInfiniteSongs(
    table: 'songs' | 'liked_songs' | 'user_songs', 
    initialSongs: Song[], 
    limit: number = 20,
    userId?: string
) {
    const supabaseClient = useSupabaseClient();
    const queryClient = useQueryClient();

    const fetchSongs = async ({ pageParam = 0 }: { pageParam: number }) => {
        let query = supabaseClient.from(table === 'user_songs' ? 'songs' : table).select(
            table === 'liked_songs' ? '*, songs(*)' : '*'
        );

        if (table === 'liked_songs' && userId) {
            query = query.eq('user_id', userId);
        } else if (table === 'user_songs' && userId) {
            query = query.eq('user_id', userId);
        }

        const { data, error } = await query
            .range(pageParam, pageParam + limit - 1)
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (table === 'liked_songs') {
            if (!data) return [];
            return (data as unknown as Array<{ songs: Song }>)
                .map(item => item.songs)
                .filter((song): song is Song => song !== null && typeof song === 'object');
        }
        
        return ((data as unknown) as Song[]) || [];
    };

    const result = useInfiniteQuery({
        queryKey: [table, userId],
        queryFn: fetchSongs,
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length === limit ? allPages.length * limit : undefined;
        },
        initialData: {
            pages: [initialSongs],
            pageParams: [0],
        },
    });

    // Prefetch next page when we have more data
    useEffect(() => {
        if (result.hasNextPage && !result.isFetchingNextPage) {
            // Prefetch in the background
            queryClient.prefetchInfiniteQuery({
                queryKey: [table, userId],
                queryFn: fetchSongs,
                initialPageParam: result.data?.pages.length ? result.data.pages.length * limit : limit,
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [result.hasNextPage, result.isFetchingNextPage, result.data?.pages.length]);

    return result;
}