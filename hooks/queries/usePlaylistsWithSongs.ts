import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/hooks/auth/useUser";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { Song } from "@/types";
import { PlaylistWithSongs } from "@/lib/api/playlists";
import { SONG_RELATIONAL_SELECT, mapRelationalSong, RawSongData } from "@/lib/api/songs";

interface PlaylistWithSongsRaw {
    id: string;
    created_at: string | null;
    title: string | null;
    description: string | null;
    image_path: string | null;
    user_id: string;
    name: string;
    playlist_songs: {
        song_id: number;
        songs: RawSongData | null;
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

            // Build query
            let query = supabaseClient
                .from("playlists")
                .select(`
                    *, 
                    playlist_songs(
                        song_id, 
                        songs(
                            ${SONG_RELATIONAL_SELECT}
                        )
                    )
                `);

            if (collaborativePlaylistIds.length > 0) {
                // Fetch both owned and collaborative playlists
                // Filter out nulls and join with commas
                const ids = collaborativePlaylistIds.filter((id): id is string => id !== null).join(',');
                if (ids) {
                    query = query.or(`user_id.eq.${user.id},id.in.(${ids})`);
                } else {
                    query = query.eq("user_id", user.id);
                }
            } else {
                // Only fetch owned playlists
                query = query.eq("user_id", user.id);
            }

            const { data, error } = await query.order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching playlists with songs:", error);
                throw error;
            }

            // Map and validate
            const playlists = (data as unknown as PlaylistWithSongsRaw[] || []).map((playlist) => ({
                ...playlist,
                songs: playlist.playlist_songs
                    .map((item) => item.songs ? mapRelationalSong(item.songs) : null)
                    .filter((song): song is Song => song !== null)
            }));

            return playlists as PlaylistWithSongs[];
        },
        enabled: !!user?.id,
    });
};