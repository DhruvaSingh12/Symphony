import { createClient } from "@/supabase/client";
import { Playlist, Song, PlaylistWithCollaborators, PlaylistSongWithAuthor } from "@/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { getCollaborators } from "./collaboration";

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
    // This function is used in server components
    // Consider migrating to fetchUserPlaylists for consistency
    return fetchUserPlaylists(userId, true, supabaseClient);
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

// Fetch playlists where user is owner OR collaborator
export async function fetchUserPlaylists(
    userId: string,
    includeCollaborative: boolean = true,
    supabaseClient?: SupabaseClient
): Promise<PlaylistWithSongs[]> {
    const supabase = (supabaseClient && 'from' in supabaseClient) ? supabaseClient : createClient();

    if (!userId) return [];

    // Fetch owned playlists
    let query = supabase
        .from("playlists")
        .select("*, playlist_songs(song_id, songs(*))")
        .eq("user_id", userId);

    const { data: ownedData, error: ownedError } = await query.order("created_at", { ascending: false });

    if (ownedError) {
        console.error("Error fetching owned playlists:", ownedError);
        return [];
    }

    let allPlaylists = ownedData as unknown as PlaylistWithSongsRaw[] || [];

    // Fetch collaborative playlists
    if (includeCollaborative) {
        const { data: collabData, error: collabError } = await supabase
            .from("playlist_collaborators")
            .select("playlist_id")
            .eq("user_id", userId)
            .eq("status", "accepted");

        if (!collabError && collabData && collabData.length > 0) {
            const playlistIds = collabData.map(c => c.playlist_id).filter((id): id is string => id !== null);

            if (playlistIds.length > 0) {
                const { data: collabPlaylists, error: playlistError } = await supabase
                    .from("playlists")
                    .select("*, playlist_songs(song_id, songs(*))")
                    .in("id", playlistIds)
                    .order("created_at", { ascending: false });

                if (!playlistError && collabPlaylists) {
                    allPlaylists = [...allPlaylists, ...(collabPlaylists as unknown as PlaylistWithSongsRaw[])];
                }
            }
        }
    }

    // Map the nested data structure
    const playlists = allPlaylists.map((playlist) => ({
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

// Fetch playlist with collaborators and check if user is owner
export async function fetchPlaylistWithCollaborators(
    playlistId: string,
    userId: string,
    supabaseClient?: SupabaseClient
): Promise<PlaylistWithCollaborators | null> {
    const supabase = (supabaseClient && 'from' in supabaseClient) ? supabaseClient : createClient();

    if (!playlistId) return null;

    // Fetch playlist with songs
    const playlist = await fetchPlaylistById(playlistId, supabase);
    if (!playlist) return null;

    // Fetch collaborators
    const collaborators = await getCollaborators(playlistId, supabase);

    // Check if current user is the owner
    const isOwner = playlist.user_id === userId;

    return {
        ...playlist,
        collaborators,
        isOwner
    };
}

// Fetch playlist songs with "added_by" user details
export async function fetchPlaylistSongsWithAuthors(
    playlistId: string,
    supabaseClient?: SupabaseClient
): Promise<PlaylistSongWithAuthor[]> {
    const supabase = (supabaseClient && 'from' in supabaseClient) ? supabaseClient : createClient();

    if (!playlistId) return [];

    const { data, error } = await supabase
        .from("playlist_songs")
        .select(`
            *,
            song:songs(*),
            added_by_user:users!playlist_songs_added_by_fkey(id, full_name, avatar_url)
        `)
        .eq("playlist_id", playlistId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching playlist songs with authors:", error);
        return [];
    }

    return (data as any[]).map(item => ({
        id: item.id,
        playlist_id: item.playlist_id,
        song_id: item.song_id,
        added_by: item.added_by,
        created_at: item.created_at,
        song: item.song,
        added_by_user: item.added_by_user
    })) as PlaylistSongWithAuthor[];
}