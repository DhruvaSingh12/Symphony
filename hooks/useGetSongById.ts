import { useEffect, useMemo, useState } from "react";

import { Song } from "@/types";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { toast } from "react-hot-toast";

const useGetSongById = ( id?: string) => {
    const [song, setSong] = useState<Song | undefined>(undefined);
    const [isloading, setIsLoading] = useState(false);
    const supabaseClient = useSupabaseClient();

    useEffect(() => {
        const songId = Number(id);
        if(!id || Number.isNaN(songId)) {
            return;
        }

        setIsLoading(true);

        const fetchSong = async () => {
            const {data, error} = await supabaseClient
                .from('songs')
                .select('*')
                .eq('id', songId)
                .single();

            if(error || !data) {
                setIsLoading(false);
                if(error) {
                    return toast.error(error.message);
                }
                return;
            }

            const mappedSong: Song = {
                updated_at: data.created_at ?? '',
                id: String(data.id),
                user_id: data.user_id ?? '',
                author: data.author ?? '',
                artist: [],
                title: data.title ?? '',
                song_path: data.song_path ?? '',
                image_path: data.image_path ?? '',
                created_at: data.created_at,
                album: ''
            };

            setSong(mappedSong);
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