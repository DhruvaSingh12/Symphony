import { createClient } from "@/supabase/client";
import { Song } from "@/types";
import { SupabaseClient } from "@supabase/supabase-js";

export interface ArtistInfo {
  artist: string;
  song_count: number;
  album_count: number;
  latest_update: string;
}

export async function fetchSongsByQuery(query: string, limit: number = 50, supabaseClient?: SupabaseClient): Promise<Song[]> {
  const supabase = (supabaseClient && 'from' in supabaseClient) ? supabaseClient : createClient();

  if (!query) {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching songs:', error);
      return [];
    }

    return (data as Song[]) || [];
  }

  const { data, error } = await (supabase.rpc as (name: string, params: { keyword: string }) => ReturnType<typeof supabase.rpc>)('search_songs_custom', {
      keyword: query
    })
    .limit(limit);

  if (error) {
    console.error('Error searching songs:', error);
    return [];
  }
  
  return (data as Song[]) || [];
}

export async function fetchAllSongs(supabaseClient?: SupabaseClient, offset: number = 0, limit: number = 50): Promise<Song[]> {
  const supabase = (supabaseClient && 'from' in supabaseClient) ? supabaseClient : createClient();

  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error(error);
    return [];
  }

  return data as Song[];
}

export async function fetchSongsByArtist(artist: string, supabaseClient?: SupabaseClient): Promise<Song[]> {
  const supabase = (supabaseClient && 'from' in supabaseClient) ? supabaseClient : createClient();

  if (!artist) {
    return [];
  }

  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .contains('artist', [artist])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching songs by artist:', error);
    return [];
  }

  return (data as Song[]) || [];
}

export async function fetchLikedSongs(supabaseClient?: SupabaseClient, offset: number = 0, limit: number = 50): Promise<Song[]> {
  const supabase = (supabaseClient && 'from' in supabaseClient) ? supabaseClient : createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('liked_songs')
    .select('*, songs(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching liked songs:', error);
    return [];
  }

  if (!data) {
    return [];
  }

  return data.map((item: { songs: Song | null }) => item.songs).filter((song): song is Song => song !== null);
}

export async function fetchUserSongs(supabaseClient?: SupabaseClient, offset: number = 0, limit: number = 50): Promise<Song[]> {
  const supabase = (supabaseClient && 'from' in supabaseClient) ? supabaseClient : createClient();

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
    .select('*')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching user songs:', error.message);
  }

  return (data as Song[]) || [];
}

export async function fetchArtists(supabaseClient?: SupabaseClient): Promise<ArtistInfo[]> {
  const supabase = (supabaseClient && 'from' in supabaseClient) ? supabaseClient : createClient();

  try {
    const { data, error } = await supabase.rpc('get_artists_with_counts');
    
    if (!error && data) {
      const artistMap = new Map<string, ArtistInfo>();
      (data as ArtistInfo[]).forEach(artist => {
        const existing = artistMap.get(artist.artist);
        if (!existing || artist.song_count > existing.song_count) {
          artistMap.set(artist.artist, artist);
        }
      });
      return Array.from(artistMap.values());
    }
    const { data: songs, error: songsError } = await supabase
      .from('songs')
      .select('artist, album, created_at');

    if (songsError) {
      console.error('Error fetching artists:', songsError);
      return [];
    }

    const artistMap = new Map<string, { songCount: number; albums: Set<string>; latestUpdate: string }>();
    
    songs?.forEach((song: { artist?: string[]; album?: string; created_at?: string }) => {
      if (song.artist && Array.isArray(song.artist)) {
        song.artist.forEach((artistName: string) => {
          const existing = artistMap.get(artistName);
          if (existing) {
            existing.songCount++;
            if (song.album) existing.albums.add(song.album);
            if (song.created_at && song.created_at > existing.latestUpdate) {
              existing.latestUpdate = song.created_at;
            }
          } else {
            artistMap.set(artistName, {
              songCount: 1,
              albums: song.album ? new Set([song.album]) : new Set(),
              latestUpdate: song.created_at || new Date().toISOString(),
            });
          }
        });
      }
    });

    const artists: ArtistInfo[] = Array.from(artistMap.entries()).map(([artist, info]) => ({
      artist,
      song_count: info.songCount,
      album_count: info.albums.size,
      latest_update: info.latestUpdate,
    }));

    artists.sort((a, b) => new Date(b.latest_update).getTime() - new Date(a.latest_update).getTime());

    return artists;
  } catch (error) {
    console.error('Error fetching artists:', error);
    return [];
  }
}