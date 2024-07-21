"use client";

import useGetSongById from "@/hooks/useGetSongById";
import useLoadSongUrl from "@/hooks/useLoadSongUrl";
import usePlayer from "@/hooks/usePlayer";
import PlayerContent from "./components/PlayerContent";

export const revalidate = 0;

const Player = () => {
const player = usePlayer();
const { song } = useGetSongById(player.activeId);
const songUrl = useLoadSongUrl(song!);

if (!song || !songUrl || !player.activeId) {
    return null;
}

return (
    <div className="
        fixed
        bottom-0
        w-full
        py-1
        h-[80px]
        px-1
    ">
        <PlayerContent
            key={songUrl}
            song={song}
            songUrl={songUrl}
        />
    </div>
);
}

export default Player;