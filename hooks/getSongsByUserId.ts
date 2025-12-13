import { Song } from "@/types";
import { createClient } from "@/supabase/server";

const getSongsByUserId = async (): Promise<Song[]> => {
    const supabase = await createClient();

    const {
        data: sessionData,
        error: sessionError
    } = await supabase.auth.getUser();   

    if (sessionError) {
        console.log(sessionError.message);
        return [];
    }

    const {data, error} = await supabase
      .from('songs')
      .select('*')
      .eq('user_id', sessionData.user?.id)
      .order('created_at',{ ascending: false});

      if (error) {
        console.log(error.message);
      }

      return (data as Song[]) || [];
};

export default getSongsByUserId;
