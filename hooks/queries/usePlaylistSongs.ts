import { useQuery } from "@tanstack/react-query";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { Song, Playlist } from "@/types";

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
                .select("song_id, songs(*)")
                .eq("playlist_id", playlistId)
                .order("created_at", { ascending: true });

            if (error) {
                console.error("Error fetching playlist songs:", error);
                throw error;
            }

            if (!data) return [];

            interface PlaylistSongItem {
                songs: Omit<Song, 'updated_at' | 'author'> & {
                    updated_at?: string | null;
                };
            }

            return data.map((item: PlaylistSongItem) => ({
                ...item.songs,
                author: item.songs.artist?.[0] ?? null,
                updated_at: item.songs.updated_at || item.songs.created_at,
            })) as Song[];
        },
        enabled: !!playlistId,
    });
};
