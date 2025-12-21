import { Playlist, Song, PlaylistWithCollaborators, PlaylistSongWithAuthor } from "@/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { getCollaborators } from "./collaboration";
import { getClient } from "./client";
import { PlaylistSchema, SongSchema, UserDetailsSchema, validateArraySafe, validateSafe } from "@/lib/validation";
import { Database } from "@/types_db";

export interface PlaylistWithSongs extends Playlist {
    songs: Song[];
}

interface PlaylistWithSongsRaw {
    id: string;
    created_at: string | null;
    title?: string;
    description: string | null;
    image_path: string | null;
    user_id: string;
    name: string;
    playlist_songs: {
        song_id: number;
        songs: any; // Raw DB song object
    }[];
}

export async function fetchPlaylistById(playlistId: string, supabaseClient?: SupabaseClient<Database>): Promise<PlaylistWithSongs | null> {
    const supabase = getClient(supabaseClient);

    if (!playlistId || playlistId.trim() === '') {
        console.error("fetchPlaylistById: Invalid playlistId");
        return null;
    }

    const { data, error } = await supabase
        .from("playlists")
        .select("*, playlist_songs(song_id, songs(*))")
        .eq("id", playlistId)
        .single();

    if (error) {
        console.error("Error fetching playlist:", error);
        return null;
    }

    if (!data) {
        return null;
    }

    const validatedPlaylist = validateSafe(PlaylistSchema, data, null);
    if (!validatedPlaylist) return null;

    const rawSongs = (data as any).playlist_songs
        ?.map((item: any) => item.songs)
        .filter(Boolean) || [];

    const validatedSongs = validateArraySafe(SongSchema, rawSongs);

    return {
        ...validatedPlaylist,
        songs: validatedSongs
    };
}

// Fetch playlists where user is owner OR collaborator
export async function fetchUserPlaylists(
    userId: string,
    includeCollaborative: boolean = true,
    supabaseClient?: SupabaseClient<Database>
): Promise<PlaylistWithSongs[]> {
    const supabase = getClient(supabaseClient);

    if (!userId || userId.trim() === '') {
        console.error("fetchUserPlaylists: Invalid userId");
        return [];
    }

    // Fetch owned playlists
    const query = supabase
        .from("playlists")
        .select("*, playlist_songs(song_id, songs(*))")
        .eq("user_id", userId);

    const { data: ownedData, error: ownedError } = await query.order("created_at", { ascending: false });

    if (ownedError) {
        console.error("Error fetching owned playlists:", ownedError);
        return [];
    }

    let allPlaylistsRaw = (ownedData as any[]) || [];

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
                    allPlaylistsRaw = [...allPlaylistsRaw, ...(collabPlaylists as any[])];
                }
            }
        }
    }

    // Map and validate
    return allPlaylistsRaw.map((playlistRaw) => {
        const validatedPlaylist = validateSafe(PlaylistSchema, playlistRaw, null);
        if (!validatedPlaylist) return null;

        const rawSongs = playlistRaw.playlist_songs
            ?.map((item: any) => item.songs)
            .filter(Boolean) || [];
        
        const validatedSongs = validateArraySafe(SongSchema, rawSongs);

        return {
            ...validatedPlaylist,
            songs: validatedSongs
        };
    }).filter((p): p is PlaylistWithSongs => p !== null);
}

// Fetch playlist with collaborators and check if user is owner
export async function fetchPlaylistWithCollaborators(
    playlistId: string,
    userId: string,
    supabaseClient?: SupabaseClient<Database>
): Promise<PlaylistWithCollaborators | null> {
    const supabase = getClient(supabaseClient);

    if (!playlistId || playlistId.trim() === '' || !userId || userId.trim() === '') {
        console.error("fetchPlaylistWithCollaborators: Invalid parameters");
        return null;
    }

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
    supabaseClient?: SupabaseClient<Database>
): Promise<PlaylistSongWithAuthor[]> {
    const supabase = getClient(supabaseClient);

    if (!playlistId || playlistId.trim() === '') {
        console.error("fetchPlaylistSongsWithAuthors: Invalid playlistId");
        return [];
    }

    const { data, error } = await supabase
        .from("playlist_songs")
        .select(`
            *,
            song:songs(*),
            added_by_user:users!playlist_songs_added_by_fkey(id, full_name, avatar_url, gender, dateOfBirth)
        `)
        .eq("playlist_id", playlistId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching playlist songs with authors:", error);
        return [];
    }

    if (!data) return [];

    return data.map(item => {
        const validatedSong = validateSafe(SongSchema, item.song, null);
        if (!validatedSong) return null;

        const validatedUser = validateSafe(UserDetailsSchema, item.added_by_user, null);

        const result: PlaylistSongWithAuthor = {
            id: item.id,
            playlist_id: item.playlist_id,
            song_id: item.song_id,
            added_by: item.added_by,
            created_at: item.created_at,
            song: validatedSong,
            added_by_user: validatedUser
        };
        return result;
    }).filter((item): item is PlaylistSongWithAuthor => item !== null);
}