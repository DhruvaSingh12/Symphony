"use client";

import Header from "@/components/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Music } from "lucide-react";
import MediaItem from "@/components/MediaItem";
import LikeButton from "@/components/LikeButton";
import { Song } from "@/types";
import { useSongsByArtist } from "@/hooks/queries/useSongsByArtist";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "next/navigation";

const ArtistPage = () => {
    const params = useParams();
    const artistName = decodeURIComponent(params.name as string);

    const { data: songs, isLoading, error } = useSongsByArtist(artistName);
    const songCount = songs?.length || 0;

    return (
        <div className="h-full w-full flex flex-col overflow-hidden">
            <div className="flex-none px-2 md:px-0 md:pr-2 pt-2">
                <Header className="bg-transparent">
                    <div className="px-2">
                        <div className="flex items-center gap-x-5">
                            <Avatar className="h-20 w-20 md:h-24 md:w-24 lg:h-28 lg:w-28">
                                <AvatarImage src="/images/artists.avif" alt={artistName} />
                                <AvatarFallback>
                                    <Music className="h-12 w-12" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-y-2">
                                <h1 className="text-2xl md:text-5xl lg:text-6xl font-bold text-foreground">
                                    {artistName}
                                </h1>
                                {!isLoading && (
                                    <p className="text-muted-foreground text-sm md:text-base">
                                        {songCount} {songCount === 1 ? "song" : "songs"}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </Header>
            </div>
            <div className="flex-1 min-h-0 mt-2 px-2 md:px-0 md:pr-2 pb-2">
                <Card className="bg-card/60 border-border h-full flex flex-col overflow-hidden">
                    <ScrollArea className="h-full">
                        {isLoading ? (
                            <CardContent className="p-4 space-y-2">
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                            </CardContent>
                        ) : error ? (
                            <CardContent className="p-4">
                                <p className="text-center text-muted-foreground">
                                    Error loading songs. Please try again.
                                </p>
                            </CardContent>
                        ) : (
                            <div className="p-4 space-y-2">
                                {songs && songs.map((song: Song) => (
                                    <div
                                        key={song.id}
                                        className="flex items-center gap-x-4 w-full p-2 rounded-md hover:bg-neutral-800/10 transition"
                                    >
                                        <div className="flex-1 overflow-hidden">
                                            <MediaItem data={song} />
                                        </div>
                                        <LikeButton songId={song.id} />
                                    </div>
                                ))}
                                {songs && songs.length === 0 && (
                                    <div className="text-neutral-400 text-center p-4">
                                        No songs found.
                                    </div>
                                )}
                            </div>
                        )}
                    </ScrollArea>
                </Card>
            </div>
        </div>
    );
};

export default ArtistPage;