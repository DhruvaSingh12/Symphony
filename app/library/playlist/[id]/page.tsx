import type { Metadata } from "next";
import { fetchPlaylistById } from "@/lib/api/playlists";
import PlaylistClient from "./components/PlaylistClient";
import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";

export async function generateMetadata(
    props: PlaylistPageProps
): Promise<Metadata> {
    const params = await props.params;
    const { id } = params;
    const supabase = await createClient();
    const playlist = await fetchPlaylistById(id, supabase);

    return {
        title: `${playlist?.name || "Playlist"} | Quivery`,
        description: `Listen to ${playlist?.name || "this playlist"} on Quivery.`,
    };
}

interface PlaylistPageProps {
    params: Promise<{
        id: string;
    }>;
}

const PlaylistPage = async (props: PlaylistPageProps) => {
    const params = await props.params;
    const { id } = params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/?auth=true&next=/library/playlist/${id}`);
    }

    const playlist = await fetchPlaylistById(id, supabase);

    return (
        <PlaylistClient playlist={playlist} songs={playlist?.songs || []} />
    );
}

export default PlaylistPage;