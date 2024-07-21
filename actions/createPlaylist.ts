import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Playlists } from '@/types';

const createPlaylist = async (name: string, songIds: number[]): Promise<Playlists | null> => {
  const supabase = useSupabaseClient();

  try {
    if (!name || typeof name !== 'string') {
      console.error("Invalid playlist name");
      throw new Error("Invalid playlist name");
    }

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Session retrieval error:", sessionError);
      throw new Error("Error retrieving user session");
    }

    if (!session) {
      console.error("User is not authenticated");
      throw new Error("User is not authenticated");
    }

    const user = session.user;

    const { data, error: playlistError } = await supabase
      .from("playlists")
      .insert({
        name,
        user_id: user.id,
      })
      .single();

    if (playlistError) {
      console.error("Error inserting playlist:", playlistError);
      return null;
    }

    const playlist = data as Playlists;

    // Insert songs into the playlist_songs table
    if (songIds.length > 0) {
      const playlistSongs = songIds.map((songId) => ({
        playlist_id: playlist.id,
        song_id: songId,
      }));

      const { error: playlistSongsError } = await supabase
        .from("playlist_songs")
        .insert(playlistSongs);

      if (playlistSongsError) {
        console.error("Error inserting playlist songs:", playlistSongsError);
        return null;
      }
    }

    return playlist;
  } catch (error) {
    console.error("Error creating playlist:", error);
    return null;
  }
};

export default createPlaylist;
