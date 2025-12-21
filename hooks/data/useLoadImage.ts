import { Song } from "@/types"
import { useSupabaseClient } from "@/providers/SupabaseProvider"

const useLoadImage = (song:Song) =>{
    const supabaseClient = useSupabaseClient();
    if(!song || !song.image_path){
        return null;
    }

    const {data: imageData} = supabaseClient
    .storage
    .from('images')
    .getPublicUrl(song.image_path);

    return imageData.publicUrl || null;
};

export default useLoadImage;