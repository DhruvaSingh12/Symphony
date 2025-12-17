import { fetchPlaylistById } from "@/lib/api/playlists";
import PlaylistClient from "./components/PlaylistClient";
import { createClient } from "@/supabase/server";

interface PlaylistPageProps {
    params: Promise<{
        id: string;
    }>;
}

const PlaylistPage = async (props: PlaylistPageProps) => {
    const params = await props.params;
    const { id } = params;
    const supabase = await createClient();

    const playlist = await fetchPlaylistById(id, supabase);

    return (
        <PlaylistClient playlist={playlist} songs={playlist?.songs || []} />
    );
}

export default PlaylistPage;