import { useQuery } from "@tanstack/react-query";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { Song, Playlist, UserDetails } from "@/types";

export const usePlaylistById = (playlistId: string) => {
    const supabaseClient = useSupabaseClient();

    return useQuery({
        queryKey: ["playlist", playlistId],
        queryFn: async () => {
            const { data, error } = await supabaseClient
                .from("playlists")
                .select("*")
                .eq("id", playlistId)
                .single();

            if (error) {
                console.error("Error fetching playlist:", error);
                throw error;
            }

            return data as Playlist;
        },
        enabled: !!playlistId,
    });
};

export const usePlaylistSongs = (playlistId: string) => {
    const supabaseClient = useSupabaseClient();

    return useQuery({
        queryKey: ["playlist_songs", playlistId],
        queryFn: async () => {
            const { data, error } = await supabaseClient
                .from("playlist_songs")
                .select(`
                    song_id, 
                    added_by,
                    songs(*),
                    added_by_user:users!playlist_songs_added_by_fkey(id, full_name, avatar_url)
                `)
                .eq("playlist_id", playlistId)
                .order("created_at", { ascending: true });

            if (error) {
                console.error("Error fetching playlist songs:", error);
                throw error;
            }

            if (!data) return [];

            return data.map((item: any) => ({
                ...item.songs,
                author: item.songs.artist?.[0] ?? null,
                updated_at: item.songs.updated_at || item.songs.created_at,
                added_by_user: item.added_by_user,
            })) as (Song & { added_by_user?: UserDetails })[];
        },
        enabled: !!playlistId,
    });
};
