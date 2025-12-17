"use client";

import Header from "@/components/Header";
import UploadedContent from "./UploadedContent";
import { Button } from "@/components/ui/button";
import { Play, Pause, Plus } from "lucide-react";
import useOnPlay from "@/hooks/useOnPlay";
import usePlayer from "@/hooks/usePlayer";
import { Song } from "@/types";
import Link from "next/link";

interface UploadedPageClientProps {
    songs: Song[];
}

const UploadedPageClient: React.FC<UploadedPageClientProps> = ({ songs }) => {
    const onPlay = useOnPlay(songs, 'uploaded');
    const player = usePlayer();

    const isSameContext = player.playContext === 'uploaded';
    const showPause = isSameContext && player.isPlaying;

    return (
        <div className="h-full w-full flex flex-col overflow-hidden">
            <div className="flex-none px-2 md:px-0 md:pr-2 pt-2">
                <Header className="bg-transparent">
                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-start">
                            <h1 className="text-3xl font-semibold text-foreground">
                                Uploaded Songs
                            </h1>
                        </div>
                        <div className="flex items-center gap-2">
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
                                    className="rounded-full bg-foreground hover:bg-primary/90 transition w-8 h-8 md:w-10 md:h-10"
                                >
                                    {showPause ? (
                                        <Pause className="text-background fill-background w-6 h-6 md:w-10 md:h-10" />
                                    ) : (
                                        <Play className="text-background fill-background w-6 h-6 md:w-10 md:h-10" />
                                    )}
                                </Button>
                            )}
                            <Link href="/library/upload">
                                <Button size="icon" className="rounded-full bg-foreground hover:bg-primary/90 transition w-8 h-8 md:w-10 md:h-10">
                                    <Plus className="text-background fill-background w-4 h-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </Header>
            </div>
            <div className="flex-1 overflow-hidden px-2 md:px-0 md:pr-2 mt-2 pb-2">
                <UploadedContent songs={songs} />
            </div>
        </div>
    );
};

export default UploadedPageClient;
