import { Song } from "@/types";
import { useSupabaseClient } from "@/providers/SupabaseProvider";

const useLoadSong = (song: Song | undefined) => {
    const supabaseClient = useSupabaseClient();

    if(!song || !song.song_path) {
        return "";
    }

    const {data:songData} = supabaseClient
         .storage
         .from('songs')
         .getPublicUrl(song.song_path);

    return songData.publicUrl || "";
};

export default useLoadSong;