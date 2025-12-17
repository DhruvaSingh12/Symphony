import { Song } from "@/types";

import usePlayer, { PlayContext } from "./usePlayer";

const useOnPlay = (songs: Song[], context?: PlayContext, contextId?: string) => {
    const player = usePlayer();

    const onPlay = (id: number) => {
        player.play(
            songs.map((song) => song.id),
            id,
            context,
            contextId
        );
    };

    return onPlay;
};

export default useOnPlay;