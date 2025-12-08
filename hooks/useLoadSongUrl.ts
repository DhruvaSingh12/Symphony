import { Song } from "@/types";
import { useSupabaseClient } from "@/providers/SupabaseProvider";

const useLoadSong = (song: Song) => {
    const supabaseClient = useSupabaseClient();

    if(!song) {
        return "";
    }

    const {data:songData} = supabaseClient
         .storage
         .from('songs')
         .getPublicUrl(song.song_path ?? '');

    return songData.publicUrl;
};

export default useLoadSong;