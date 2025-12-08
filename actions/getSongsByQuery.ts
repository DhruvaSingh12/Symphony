import { Song } from "@/types";
import { createClient } from "@/supabase/server";
import getSongs from "./getSongs";

const getSongsByQuery = async (query: string): Promise<Song[]> => {
    const supabase = await createClient();

    if (!query) {
        const allSongs = await getSongs();
        return allSongs;
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
};

export default getSongsByQuery;
