"use client";

import useGetSongById from "@/hooks/data/useGetSongById";
import useLoadSongUrl from "@/hooks/data/useLoadSongUrl";
import usePlayer from "@/hooks/ui/usePlayer";
import PlayerContent from "./components/PlayerContent";

export const revalidate = 0;

const Player = () => {
    const player = usePlayer();
    const { song } = useGetSongById(player.activeId ? String(player.activeId) : undefined);
    const songUrl = useLoadSongUrl(song);

    // Early return if no song data or URL to prevent rendering with invalid state
    if (!song || !songUrl || !player.activeId) {
        return null;
    }

    return (
        <div className="fixed bottom-0 w-full py-1 h-[80px] px-1">
            <PlayerContent
                song={song}
                songUrl={songUrl}
            />
        </div>
    );
}

export default Player;