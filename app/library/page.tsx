import { createClient } from "@/supabase/server";
import { fetchUserSongs } from "@/lib/api/songs";
import { fetchUserPlaylists } from "@/lib/api/playlists";
import { redirect } from "next/navigation";
import LibraryPageClient from "./components/LibraryPageClient";

export const revalidate = 60; // Revalidate every 60 seconds

const LibraryPage = async () => {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/?auth=true');
    }

    // Parallel fetching
    const [userSongs, playlists] = await Promise.all([
        fetchUserSongs(supabase, 0, 20),
        fetchUserPlaylists(user.id, true, supabase)
    ]);

    return (
        <LibraryPageClient
            userSongs={userSongs}
            playlists={playlists}
        />
    );
};

export default LibraryPage;