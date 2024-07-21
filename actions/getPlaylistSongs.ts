import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Song } from "@/types";

const getPlaylistSongs = async (playlistId: string): Promise<Song[]> => {
  const supabase = createServerComponentClient({ cookies });

  const { data, error } = await supabase
    .from("playlist_songs")
    .select("*, songs(*)")
    .eq("playlist_id", playlistId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data.map((item: { songs: Song }) => item.songs);
};

export default getPlaylistSongs;
