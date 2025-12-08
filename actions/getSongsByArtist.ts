"use server";

import { Song } from "@/types";
import { createClient } from "@/supabase/server";

const getSongsByArtist = async (artist: string): Promise<Song[]> => {
  const supabase = await createClient();

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
    // Check if artist exists and matches
    if (!song.artist) return false;
    if (Array.isArray(song.artist)) {
        return song.artist.some(a => a.toLowerCase() === queryLower);
    }
    return false;
  });

  return filteredData;
};

export default getSongsByArtist;
