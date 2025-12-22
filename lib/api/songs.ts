import { Song, Artist, Album } from "@/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { getClient } from "./client";
import { SongSchema, validateArraySafe } from "@/lib/validation";
import { Database } from "@/types_db";

export interface ArtistInfo {
  artist: string;
  song_count: number;
  album_count: number;
  latest_update: string;
}

// Relational query string for all songs
export const SONG_RELATIONAL_SELECT = `
  *,
  album:album_id(*),
  song_artists(
    artists(*)
  )
`;

export interface RawSongJunction {
  artists: Artist | null;
}

export interface RawSongData {
  id: number;
  user_id: string | null;
  title: string | null;
  song_path: string | null;
  image_path: string | null;
  created_at: string | null;
  album_id: number | null;
  duration: number | null;
  album?: Album | null;
  song_artists?: RawSongJunction[];
}

export const mapRelationalSong = (data: RawSongData): Song | null => {
  if (!data) return null;
  
  // Extract artists from junction table
  const artists: Artist[] = data.song_artists
    ?.map((sa: RawSongJunction) => sa.artists)
    .filter((a): a is Artist => !!a) || [];

  // Extract album
  const album: Album | null = data.album || null;

  return {
    id: data.id,
    user_id: data.user_id,
    title: data.title,
    song_path: data.song_path,
    image_path: data.image_path,
    created_at: data.created_at,
    album_id: data.album_id,
    duration: data.duration,
    artists,
    album
  };
};

export async function fetchSongsByQuery(query: string, limit: number = 50, supabaseClient?: SupabaseClient<Database>): Promise<Song[]> {
  const supabase = getClient(supabaseClient);

  if (!query) {
    const { data, error } = await supabase
      .from('songs')
      .select(SONG_RELATIONAL_SELECT)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching songs:', error);
      return [];
    }

    const mapped = (data || []).map(mapRelationalSong).filter(Boolean) as Song[];
    return validateArraySafe(SongSchema, mapped);
  }

  // 1. Search songs by title
  const songTitleQuery = supabase
    .from('songs')
    .select(SONG_RELATIONAL_SELECT)
    .ilike('title', `%${query}%`)
    .limit(limit);

  // 2. Search artists by name and get their songs
  const artistNameQuery = supabase
    .from('song_artists')
    .select(`
      song:songs (
        ${SONG_RELATIONAL_SELECT}
      ),
      artists!inner(name)
    `)
    .ilike('artists.name', `%${query}%`)
    .limit(limit);

  // 3. Search albums by title and get their songs
  const albumTitleQuery = supabase
    .from('songs')
    .select(`
        id,
        user_id,
        title,
        song_path,
        image_path,
        created_at,
        album_id,
        duration,
        song_artists(artists(*)),
        album:album_id!inner(*)
    `)
    .ilike('album.title', `%${query}%`)
    .limit(limit);

  const [songsResult, artistsResult, albumsResult] = await Promise.all([
    songTitleQuery,
    artistNameQuery,
    albumTitleQuery
  ]);

  if (songsResult.error) console.error('Error searching songs by title:', songsResult.error);
  if (artistsResult.error) console.error('Error searching songs by artist:', artistsResult.error);
  if (albumsResult.error) console.error('Error searching songs by album:', albumsResult.error);

  // Collect and map all results
  const allSongsRaw: RawSongData[] = [
    ...(songsResult.data || []).map(s => s as unknown as RawSongData),
    ...(artistsResult.data || []).map((item: any) => item.song as unknown as RawSongData),
    ...(albumsResult.data || []).map(s => s as unknown as RawSongData)
  ].filter(Boolean);

  // Deduplicate by ID
  const uniqueSongsMap = new Map<number, Song>();
  allSongsRaw.forEach(raw => {
    const mapped = mapRelationalSong(raw);
    if (mapped && !uniqueSongsMap.has(mapped.id)) {
      uniqueSongsMap.set(mapped.id, mapped);
    }
  });

  const finalSongs = Array.from(uniqueSongsMap.values()).slice(0, limit);
  return validateArraySafe(SongSchema, finalSongs);
}

export async function fetchAllSongs(supabaseClient?: SupabaseClient<Database>, offset: number = 0, limit: number = 50): Promise<Song[]> {
  const supabase = getClient(supabaseClient);

  const { data, error } = await supabase
    .from('songs')
    .select(SONG_RELATIONAL_SELECT)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error(error);
    return [];
  }

  const mapped = (data || []).map(mapRelationalSong).filter(Boolean) as Song[];
  return validateArraySafe(SongSchema, mapped);
}

export async function fetchSongsByArtist(artistIdentifier: string | number, supabaseClient?: SupabaseClient<Database>): Promise<Song[]> {
  const supabase = getClient(supabaseClient);

  if (!artistIdentifier) {
    return [];
  }

  let query;
  if (typeof artistIdentifier === 'number') {
    query = supabase
      .from('song_artists')
      .select(`
        song:songs (
          ${SONG_RELATIONAL_SELECT}
        )
      `)
      .eq('artist_id', artistIdentifier);
  } else {
    // Join with artists to filter by name
    query = supabase
      .from('song_artists')
      .select(`
        song:songs (
          ${SONG_RELATIONAL_SELECT}
        ),
        artists!inner(name)
      `)
      .eq('artists.name', artistIdentifier);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching songs by artist:', error);
    return [];
  }

  const songsRaw = (data || []).map((item) => item.song as unknown as RawSongData).filter(Boolean);
  const mapped = songsRaw.map(mapRelationalSong).filter((s): s is Song => !!s);
  return validateArraySafe(SongSchema, mapped);
}

export async function fetchLikedSongs(supabaseClient?: SupabaseClient<Database>, offset: number = 0, limit: number = 50): Promise<Song[]> {
  const supabase = getClient(supabaseClient);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('liked_songs')
    .select(`
      *,
      songs (
        ${SONG_RELATIONAL_SELECT}
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching liked songs:', error);
    return [];
  }

  const songsRaw = (data || []).map((item) => item.songs as unknown as RawSongData).filter(Boolean);
  const mapped = songsRaw.map(mapRelationalSong).filter((s): s is Song => !!s);
  return validateArraySafe(SongSchema, mapped);
}

export async function fetchUserSongs(supabaseClient?: SupabaseClient<Database>, offset: number = 0, limit: number = 50): Promise<Song[]> {
  const supabase = getClient(supabaseClient);

  const {
    data: userData,
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    console.error('Error authenticating user:', userError?.message);
    return [];
  }

  const { data, error } = await supabase
    .from('songs')
    .select(SONG_RELATIONAL_SELECT)
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching user songs:', error.message);
  }

  const mapped = (data || []).map(mapRelationalSong).filter(Boolean) as Song[];
  return validateArraySafe(SongSchema, mapped);
}

// Fetches all artists with their song count, album count, and latest update.
export async function fetchArtistsWithStats(supabaseClient?: SupabaseClient<Database>): Promise<ArtistInfo[]> {
  const supabase = getClient(supabaseClient);

  const { data, error } = await supabase
    .from('artists')
    .select(`
      name,
      song_artists(
        songs(
          id,
          album_id,
          created_at
        )
      )
    `)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching artists with stats:', error);
    return [];
  }

  return (data || []).map((artist) => {
    const songs = (artist.song_artists || [])
      .map((sa) => sa.songs)
      .filter((s): s is { id: number; album_id: number | null; created_at: string } => !!s);
    const albumIds = new Set(songs.map((s) => s.album_id).filter((id): id is number => id !== null));
    const latestUpdate = songs.length > 0
      ? new Date(Math.max(...songs.map((s) => new Date(s.created_at).getTime()))).toISOString()
      : new Date().toISOString();

    return {
      artist: artist.name,
      song_count: songs.length,
      album_count: albumIds.size,
      latest_update: latestUpdate
    };
  });
}

// Fetches all artists from the new artists table.
export async function fetchArtists(supabaseClient?: SupabaseClient<Database>): Promise<Artist[]> {
  const supabase = getClient(supabaseClient);

  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching artists:', error);
    return [];
  }

  return data || [];
}

// Fetches all albums from the new albums table.
export async function fetchAlbums(supabaseClient?: SupabaseClient<Database>): Promise<Album[]> {
  const supabase = getClient(supabaseClient);

  const { data, error } = await supabase
    .from('albums')
    .select('*')
    .order('title', { ascending: true });

  if (error) {
    console.error('Error fetching albums:', error);
    return [];
  }

  return data || [];
}

// Gets an artist by name or creates a new one if it doesn't exist.
export async function getOrCreateArtist(name: string, supabaseClient?: SupabaseClient<Database>): Promise<Artist | null> {
  const supabase = getClient(supabaseClient);

  // Check if artist exists
  const { data: existing, error: fetchError } = await supabase
    .from('artists')
    .select('*')
    .ilike('name', name)
    .maybeSingle();

  if (fetchError) {
    console.error('Error fetching artist:', fetchError);
    return null;
  }

  if (existing) {
    return existing;
  }

  // Create new artist
  const { data: created, error: createError } = await supabase
    .from('artists')
    .insert({ name })
    .select()
    .single();

  if (createError) {
    console.error('Error creating artist:', createError);
    return null;
  }

  return created;
}

// Gets an album by title or creates a new one if it doesn't exist.
export async function getOrCreateAlbum(title: string, supabaseClient?: SupabaseClient<Database>): Promise<Album | null> {
  const supabase = getClient(supabaseClient);

  // Check if album exists
  const { data: existing, error: fetchError } = await supabase
    .from('albums')
    .select('*')
    .ilike('title', title)
    .maybeSingle();

  if (fetchError) {
    console.error('Error fetching album:', fetchError);
    return null;
  }

  if (existing) {
    return existing;
  }

  // Create new album
  const { data: created, error: createError } = await supabase
    .from('albums')
    .insert({ title })
    .select()
    .single();

  if (createError) {
    console.error('Error creating album:', createError);
    return null;
  }

  return created;
}