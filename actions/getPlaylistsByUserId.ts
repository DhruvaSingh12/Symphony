import { Playlists } from "@/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies} from "next/headers";

const getPlaylistsByUserId = async (): Promise<Playlists[]> => {
    const supabase = createServerComponentClient({
        cookies: cookies   
    });

    const {
        data: { session },
    } = await supabase.auth.getSession();

    const {data, error} = await supabase
        .from('playlists')
        .select('*, songs(*)')
        .eq('user_id', session?.user.id)
        .order('created_at', { ascending: false });

        if(error){
            console.log(error);
            return [];
        }

        if(!data){
            return [];
        }

        return data as Playlists[];
    };

    export default getPlaylistsByUserId;