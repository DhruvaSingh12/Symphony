import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/hooks/useUser";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { Playlist, Song } from "@/types";

export interface PlaylistWithSongs extends Playlist {
    songs: Song[];
}

interface PlaylistWithSongsRaw {
    id: string;
    created_at: string;
    title: string;
    description: string;
    image_path: string;
    author: string;
    user_id: string;
    name: string;
    playlist_songs: {
        song_id: number;
        songs: Song; // Raw DB song object
    }[];
}

export const usePlaylistsWithSongs = () => {
    const { user } = useUser();
    const supabaseClient = useSupabaseClient();

    return useQuery({
        queryKey: ["playlists_with_songs", user?.id],
        queryFn: async () => {
            if (!user?.id) return [];

            // Fetch playlist IDs where user is a collaborator
            const { data: collaboratorData } = await supabaseClient
                .from("playlist_collaborators")
                .select("playlist_id")
                .eq("user_id", user.id)
                .eq("status", "accepted");

            const collaborativePlaylistIds = collaboratorData?.map(c => c.playlist_id) || [];

            // Build query based on whether there are collaborative playlists
            let query = supabaseClient
                .from("playlists")
                .select("*, playlist_songs(song_id, songs(*))");

            if (collaborativePlaylistIds.length > 0) {
                // Fetch both owned and collaborative playlists
                query = query.or(`user_id.eq.${user.id},id.in.(${collaborativePlaylistIds.join(',')})`);
            } else {
                // Only fetch owned playlists
                query = query.eq("user_id", user.id);
            }

            const { data, error } = await query.order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching playlists with songs:", error);
                throw error;
            }

            // Map the nested data structure to a flatter one
            const playlists = (data as unknown as PlaylistWithSongsRaw[] || []).map((playlist) => ({
                ...playlist,
                songs: playlist.playlist_songs
                    .map((item) => ({
                        ...item.songs,
                        author: item.songs.artist?.[0] ?? null,
                        updated_at: item.songs.created_at,
                    }))
                    .filter((song) => song !== null) as Song[]
            }));

            return playlists as PlaylistWithSongs[];
        },
        enabled: !!user?.id,
    });
};