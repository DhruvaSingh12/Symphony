import { Song } from "@/types";

import usePlayer, { PlayContext } from "./usePlayer";

const useOnPlay = (songs: Song[], context?: PlayContext, contextId?: string) => {
    const player = usePlayer();

    const onPlay = (id: number) => {
        player.setId(id);
        player.setIds(songs.map((song) => song.id));
        // Set the play context when starting playback
        if (context) {
            player.setPlayContext(context, contextId);
        }
        // Auto-start playing
        player.setIsPlaying(true);
    };

    return onPlay;
};

export default useOnPlay;
