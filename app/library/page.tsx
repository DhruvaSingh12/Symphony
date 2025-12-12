"use client";

import Header from "@/components/Header";
import { useUserSongs } from "@/hooks/queries/useUserSongs";
import { usePlaylistsWithSongs } from "@/hooks/queries/usePlaylistsWithSongs";
import Box from "@/components/Box";
import { BounceLoader } from "react-spinners";
import AlbumCard from "@/app/artists/components/AlbumCard";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import usePlaylistModal from "@/hooks/usePlaylistModal";
import { Card } from "@/components/ui/card";
import { useUser } from "@/hooks/useUser";
import { useEffect } from "react";

const LibraryPage = () => {
    const router = useRouter();
    const playlistModal = usePlaylistModal();
    const { user, isLoading: isLoadingUser } = useUser();

    const { data: userSongs, isLoading: isLoadingSongs } = useUserSongs();
    const { data: playlists, isLoading: isLoadingPlaylists } = usePlaylistsWithSongs();

    const isLoading = isLoadingSongs || isLoadingPlaylists || isLoadingUser;

    useEffect(() => {
        if (!isLoadingUser && !user) {
            router.replace("/");
        }
    }, [isLoadingUser, user, router]);

    if (isLoadingUser || (!user && !isLoadingUser)) {
        return (
            <Box className="flex h-full w-full scrollbar-hide items-center justify-center">
                <BounceLoader className="text-foreground" size={40} />
            </Box>
        );
    }

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
                        <div
                            onClick={() => playlistModal.onOpen()}
                            className="inline-flex cursor-pointer items-center gap-x-2 text-neutral-400 hover:text-white transition"
                        >
                            <Plus size={20} />
                        </div>
                    </div>
                </Header>
            </div>
            <div className="flex-1 min-h-0 mt-2 px-2 md:px-0 md:pr-2 pb-2">
                <Card className="border-border h-full flex flex-col overflow-hidden relative">
                    <div className="h-full w-full overflow-auto scrollbar-hide">
                        {isLoading ? (
                            <Box className="flex h-full w-full scrollbar-hide items-center justify-center">
                                <BounceLoader className="text-foreground" size={40} />
                            </Box>
                        ) : (
                            <div className="p-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-4">
                                {/* Uploaded Songs Card */}
                                {userSongs && userSongs.length > 0 && (
                                    <AlbumCard
                                        albumName="Uploaded"
                                        songs={userSongs}
                                        onClick={() => router.push('/uploaded')}
                                        description=""
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
                                        onClick={() => router.push(`/playlist/${playlist.id}`)}
                                        description=""
                                        showYear={false}
                                        showPlayButton={false}
                                    />
                                ))}
                            </div>
                        )}
                        {!isLoading && (!userSongs || userSongs.length === 0) && (!playlists || playlists.length === 0) && (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-foreground text-center">
                                    No songs or playlists found.
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default LibraryPage;