import { createClient } from "@/supabase/client";
import { Playlist, Song } from "@/types";
import { SupabaseClient } from "@supabase/supabase-js";

export interface PlaylistWithSongs extends Playlist {
    songs: Song[];
}

interface PlaylistWithSongsRaw {
    id: string;
    created_at: string;
    title: string;
    description: string;
    image_path: string;
    user_id: string;
    name: string;
    playlist_songs: {
        song_id: number;
        songs: Song; // Raw DB song object
    }[];
}

export async function fetchPlaylistsWithSongs(userId: string, supabaseClient?: SupabaseClient): Promise<PlaylistWithSongs[]> {
    const supabase = (supabaseClient && 'from' in supabaseClient) ? supabaseClient : createClient();

    if (!userId) return [];

    const { data, error } = await supabase
        .from("playlists")
        .select("*, playlist_songs(song_id, songs(*))")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching playlists with songs:", error);
        return [];
    }

    // Map the nested data structure to a flatter one
    const playlists = (data as unknown as PlaylistWithSongsRaw[] || []).map((playlist) => ({
        ...playlist,
        songs: playlist.playlist_songs
            .map((item) => ({
                ...item.songs,
                updated_at: item.songs.created_at,
            }))
            .filter((song) => song !== null) as Song[]
    }));

    return playlists as PlaylistWithSongs[];
}

export async function fetchPlaylistById(playlistId: string, supabaseClient?: SupabaseClient): Promise<PlaylistWithSongs | null> {
    const supabase = (supabaseClient && 'from' in supabaseClient) ? supabaseClient : createClient();

    if (!playlistId) return null;

    const { data, error } = await supabase
        .from("playlists")
        .select("*, playlist_songs(song_id, songs(*))")
        .eq("id", playlistId)
        .single();

    if (error) {
        console.error("Error fetching playlist:", error);
        return null;
    }

    const rawPlaylist = data as unknown as PlaylistWithSongsRaw;
    
    return {
        ...rawPlaylist,
        songs: rawPlaylist.playlist_songs
            .map((item) => ({
                ...item.songs,
                updated_at: item.songs.created_at,
            }))
            .filter((song) => song !== null) as Song[]
    };
}