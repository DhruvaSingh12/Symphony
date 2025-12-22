import { useEffect, useMemo, useState } from "react";

import { Song } from "@/types";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { toast } from "react-hot-toast";
import { SONG_RELATIONAL_SELECT, mapRelationalSong } from "@/lib/api/songs";

const useGetSongById = ( id?: string) => {
    const [song, setSong] = useState<Song | undefined>(undefined);
    const [isloading, setIsLoading] = useState(false);
    const supabaseClient = useSupabaseClient();

    useEffect(() => {
        const songId = Number(id);
        if(!id || Number.isNaN(songId)) {
            return;
        }

        const fetchSong = async () => {
            setTimeout(() => setIsLoading(true), 0);
            const {data, error} = await supabaseClient
                .from('songs')
                .select(SONG_RELATIONAL_SELECT)
                .eq('id', songId)
                .single();

            if(error || !data) {
                setIsLoading(false);
                if(error && error.code !== 'PGRST116') { // PGRST116 is 'no rows returned' for .single()
                    return toast.error(error.message);
                }
                return;
            }

            const mappedSong = mapRelationalSong(data);

            if (mappedSong) {
                setSong(mappedSong);
            }
            setIsLoading(false);
        }
        fetchSong();
    }, [id, supabaseClient]);

    return useMemo(() => ({
        song,
        isloading
    }), [song, isloading]);
};

export default useGetSongById;