"use client";

import { use } from "react";
import Header from "@/components/Header";
import { usePlaylistById, usePlaylistSongs } from "@/hooks/queries/usePlaylistSongs";
import Box from "@/components/Box";
import { BounceLoader } from "react-spinners";
import Table from "@/components/Table";
import useOnPlay from "@/hooks/useOnPlay";
import { Card, CardContent } from "@/components/ui/card";

interface PlaylistPageProps {
    params: Promise<{
        id: string;
    }>;
}

const PlaylistPage = ({ params }: PlaylistPageProps) => {
    const { id } = use(params);
    const { data: playlist, isLoading: isLoadingPlaylist } = usePlaylistById(id);
    const { data: songs, isLoading: isLoadingSongs, error: isErrorSongs } = usePlaylistSongs(id);

    const onPlay = useOnPlay(songs || []);

    const isLoading = isLoadingPlaylist || isLoadingSongs;

    return (
        <div className="h-full w-full flex flex-col overflow-hidden">
            <div className="flex-none px-2 md:px-0 md:pr-2 pt-2">
                <Header className="bg-transparent">
                    <div className="flex flex-col items-start gap-1">
                        <h1 className="text-3xl font-semibold text-foreground">
                            {playlist?.name || "Playlist"}
                        </h1>
                        {!isLoading && songs && (
                            <div>
                                {songs.length} {songs.length === 1 ? "song" : "songs"}
                            </div>
                        )}
                    </div>
                </Header>
            </div>
            <div className="flex-1 overflow-auto px-2 md:px-0 md:pr-2 mt-2 pb-2">
                {isLoading ? (
                    <Box className="flex h-full w-full scrollbar-hide items-center justify-center">
                        <BounceLoader className="text-foreground" size={40} />
                    </Box>
                ) : isErrorSongs ? (
                    <Card className="bg-card/60 border-border">
                        <CardContent className="p-6">
                            <p className="text-center text-muted-foreground">
                                Error loading playlist songs.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <Table songs={songs || []} onPlay={onPlay} persistenceKey={`playlist-${id}`} />
                )}
            </div>
        </div>
    );
}

export default PlaylistPage;
