import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/hooks/useUser";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { Playlist, Song } from "@/types";

export interface PlaylistWithSongs extends Playlist {
    songs: Song[];
}

export const usePlaylistsWithSongs = () => {
    const { user } = useUser();
    const supabaseClient = useSupabaseClient();

    return useQuery({
        queryKey: ["playlists_with_songs", user?.id],
        queryFn: async () => {
            if (!user?.id) return [];

            const { data, error } = await supabaseClient
                .from("playlists")
                .select("*, playlist_songs(song_id, songs(*))")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching playlists with songs:", error);
                throw error;
            }

            // Map the nested data structure to a flatter one
            const playlists = (data || []).map((playlist: any) => ({
                ...playlist,
                songs: playlist.playlist_songs
                    .map((item: any) => item.songs)
                    .filter((song: any) => song !== null) // Filter out any null songs
            }));

            return playlists as PlaylistWithSongs[];
        },
        enabled: !!user?.id,
    });
};
