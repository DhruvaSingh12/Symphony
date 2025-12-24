import React from "react";
import { Song } from "@/types";
import usePlayer, { PlayContext } from "../ui/usePlayer";

const useOnPlay = (songs: Song[], context?: PlayContext, contextId?: string) => {
    const player = usePlayer();

    const songIds = React.useMemo(() => songs.map((song) => song.id), [songs]);

    const onPlay = React.useCallback((id: number) => {
        player.play(
            songIds,
            id,
            context,
            contextId
        );
    }, [player, songIds, context, contextId]);

    return onPlay;
};

export default useOnPlay;