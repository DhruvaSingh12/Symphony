import { createClient } from "@/supabase/client";
import { Song } from "@/types";

export async function fetchSongsByQuery(query: string): Promise<Song[]> {
  const supabase = createClient();

  if (!query) {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.log(error);
      return [];
    }

    return (data as Song[]) || [];
  }

  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.log(error);
    return [];
  }

  const queryLower = query.toLowerCase();
  const filteredData = (data as Song[]).filter((song) =>
    song.title?.toLowerCase().includes(queryLower) ||
    song.album?.toLowerCase().includes(queryLower) ||
    (song.artist && song.artist.some((artist: string) =>
      artist.toLowerCase().includes(queryLower)
    ))
  );

  return filteredData;
}

export async function fetchAllSongs(): Promise<Song[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data as Song[];
}

export async function fetchSongsByArtist(artist: string): Promise<Song[]> {
  const supabase = createClient();

  if (!artist) {
    return [];
  }

  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.log(error);
    return [];
  }

  const queryLower = artist.toLowerCase();
  const filteredData = (data as Song[]).filter((song) => {
    if (!song.artist) return false;
    if (Array.isArray(song.artist)) {
      return song.artist.some(a => a.toLowerCase() === queryLower);
    }
    return false;
  });

  return filteredData;
}

export async function fetchLikedSongs(): Promise<Song[]> {
  const supabase = createClient();

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
    .order('created_at', { ascending: false });

  if (error) {
    console.log(error);
    return [];
  }

  if (!data) {
    return [];
  }

  return data.map((item) => ({
    ...item.songs,
  })) as Song[];
}

export async function fetchUserSongs(): Promise<Song[]> {
  const supabase = createClient();

  const {
    data: userData,
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    console.log(userError?.message);
    return [];
  }

  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.log(error.message);
  }

  return (data as any) || [];
}
