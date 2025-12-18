"use client";

import Header from "@/components/Header";
import AlbumCard from "@/app/artists/components/AlbumCard";
import ActionCard from "@/app/library/components/ActionCard";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import usePlaylistModal from "@/hooks/usePlaylistModal";
import { PlaylistWithSongs } from "@/lib/api/playlists";
import { Song } from "@/types";
import { PlusCircle, Upload } from "lucide-react";
import { useInfiniteSongs } from "@/hooks/useInfiniteSongs";
import React from "react";
import { useUser } from "@/hooks/useUser";

interface LibraryPageClientProps {
    userSongs: Song[];
    playlists: PlaylistWithSongs[];
}

const LibraryPageClient: React.FC<LibraryPageClientProps> = ({ userSongs, playlists }) => {
    const { user } = useUser();
    
    // Infinite query for user songs
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteSongs('user_songs', userSongs, 20, user?.id);

    // Flatten pages into a single array
    const allSongs = data?.pages.flat() ?? [];

    // IntersectionObserver to trigger next page load
    const sentinelRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        if (!sentinelRef.current) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            });
        });
        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
    const router = useRouter();
    const playlistModal = usePlaylistModal();

    return (
        <div className="h-full w-full flex flex-col overflow-hidden">
            <div className="flex-none px-2 md:px-0 md:pr-2 pt-2">
                <Header className="bg-transparent">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col items-start gap-1">
                            <h1 className="text-3xl font-semibold text-foreground">
                                Your Library
                            </h1>
                        </div>
                    </div>
                </Header>
            </div>
            <div className="flex-1 min-h-0 mt-2 px-2 md:px-0 md:pr-2 pb-2">
                <Card className="border-border h-full flex flex-col overflow-hidden relative">
                    <div className="h-full w-full overflow-auto scrollbar-hide">
                        <div className="p-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-4">
                            {/* Action Cards */}
                            <ActionCard
                                label="Upload Song"
                                icon={Upload}
                                onClick={() => router.push('/library/upload')}
                                description="Add to library"
                            />
                            <ActionCard
                                label="Create Playlist"
                                icon={PlusCircle}
                                onClick={() => playlistModal.onOpen()}
                                description="New Collection"
                            />

                            {/* Uploaded Songs Card */}
                            {allSongs && allSongs.length > 0 && (
                                <AlbumCard
                                    albumName="Uploaded"
                                    songs={allSongs}
                                    onClick={() => router.push('/library/uploaded')}
                                    description="Your songs"
                                    showYear={false}
                                    showPlayButton={false}
                                />
                            )}

                            {/* User Playlists */}
                            {playlists?.map((playlist) => (
                                <AlbumCard
                                    key={playlist.id}
                                    albumName={playlist.name}
                                    songs={playlist.songs}
                                    onClick={() => router.push(`/library/playlist/${playlist.id}`)}
                                    description="Playlist"
                                    showYear={false}
                                    showPlayButton={false}
                                />
                            ))}
                        </div>
                        {/* Sentinel for infinite scroll */}
                        <div ref={sentinelRef} className="h-1 w-full" />
                        {(!allSongs || allSongs.length === 0) && (!playlists || playlists.length === 0) && (
                            <div className="flex items-center justify-center">
                                <div className="text-foreground text-center">
                                    Create a playlist or upload songs to get started.
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default LibraryPageClient;