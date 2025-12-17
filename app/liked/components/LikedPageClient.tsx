"use client";

import Header from "@/components/Header";
import LikedContent from "./LikedContent";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import useOnPlay from "@/hooks/useOnPlay";
import usePlayer from "@/hooks/usePlayer";
import { Song } from "@/types";

interface LikedPageClientProps {
    songs: Song[];
}

const LikedPageClient: React.FC<LikedPageClientProps> = ({ songs }) => {
    const onPlay = useOnPlay(songs, 'liked');
    const player = usePlayer();

    const isSameContext = player.playContext === 'liked';
    const showPause = isSameContext && player.isPlaying;

    return (
        <div className="h-full w-full flex flex-col overflow-hidden">
            <div className="flex-none px-2 md:px-0 md:pr-2 pt-2">
                <Header className="bg-transparent">
                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-start">
                            <h1 className="text-3xl font-semibold text-foreground">
                                Liked Songs
                            </h1>
                        </div>
                        {songs.length > 0 && (
                            <Button
                                onClick={() => {
                                    if (isSameContext) {
                                        player.togglePlayPause();
                                    } else {
                                        onPlay(songs[0].id);
                                    }
                                }}
                                size="icon"
                                className="rounded-full bg-foreground hover:bg-primary/90 transition w-10 h-10 md:w-12 md:h-12"
                            >
                                {showPause ? (
                                    <Pause className="text-background fill-background w-8 h-8 md:w-12 md:h-12" />
                                ) : (
                                    <Play className="text-background fill-background w-8 h-8 md:w-12 md:h-12" />
                                )}
                            </Button>
                        )}
                    </div>
                </Header>
            </div>
            <div className="flex-1 overflow-hidden px-2 md:px-0 md:pr-2 mt-2 pb-2">
                <LikedContent songs={songs} />
            </div>
        </div>
    );
};

export default LikedPageClient;