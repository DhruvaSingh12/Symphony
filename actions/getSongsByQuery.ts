import { Song } from "@/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import getSongs from "./getSongs";

const getSongsByQuery = async (query: string): Promise<Song[]> => {
    const supabase = createServerComponentClient({
        cookies: cookies
    });

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
        song.title.toLowerCase().includes(queryLower) ||
        song.album.toLowerCase().includes(queryLower) ||
        (song.artist && song.artist.some((artist: string) =>
            artist.toLowerCase().includes(queryLower)
        ))
    );

    return filteredData;
};

export default getSongsByQuery;
