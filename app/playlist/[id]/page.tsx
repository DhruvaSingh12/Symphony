"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import Header from "@/components/Header";
import { usePlaylistById, usePlaylistSongs } from "@/hooks/queries/usePlaylistSongs";
import Box from "@/components/Box";
import { BounceLoader } from "react-spinners";
import Table from "@/components/Table";
import useOnPlay from "@/hooks/useOnPlay";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, MoreHorizontal, ListPlus, Trash2, Edit } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useDeletePlaylist, useRenamePlaylist } from "@/hooks/mutations/usePlaylist";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useUser } from "@/hooks/useUser";
import usePlayer from "@/hooks/usePlayer";
import { toast } from "react-hot-toast";

interface PlaylistPageProps {
    params: Promise<{
        id: string;
    }>;
}

const PlaylistPage = ({ params }: PlaylistPageProps) => {
    const { id } = use(params);
    const router = useRouter();
    const { user, isLoading: isLoadingUser } = useUser();
    const { data: playlist, isLoading: isLoadingPlaylist } = usePlaylistById(id);
    const { data: songs, isLoading: isLoadingSongs, error: isErrorSongs } = usePlaylistSongs(id);

    const onPlay = useOnPlay(songs || [], 'playlist', id);
    const deletePlaylist = useDeletePlaylist();
    const renamePlaylist = useRenamePlaylist();

    const [isRenameOpen, setIsRenameOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const player = usePlayer();

    const isLoading = isLoadingPlaylist || isLoadingSongs;

    const isContextPlaying = player.playContext === 'playlist' && player.playContextId === id && player.isPlaying;

    const handleAddToQueue = () => {
        if (!songs) return;
        const songIds = songs.map((song) => song.id);
        player.addIdsToQueue(songIds);
        toast.success("Added to queue");
    };

    useEffect(() => {
        if (!isLoadingUser && !user) {
            router.replace("/");
        }
    }, [isLoadingUser, user, router]);

    const confirmDelete = async () => {
        await deletePlaylist.mutateAsync(id);
        setIsDeleteOpen(false);
        router.push('/library');
    };

    const handleRename = async () => {
        if (!newName.trim()) return;
        await renamePlaylist.mutateAsync({ playlistId: id, newName: newName });
        setIsRenameOpen(false);
    };

    const openRenameModal = () => {
        setNewName(playlist?.name || "");
        setIsRenameOpen(true);
    };

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
                    <div className="flex items-center justify-between mt-2">
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
                        <div className="flex items-center gap-2">
                            {!isLoading && songs && songs.length > 0 && (
                                <Button
                                    onClick={() => {
                                        if (isContextPlaying) {
                                            player.togglePlayPause();
                                        } else if (player.activeId && songs.some(s => s.id === player.activeId)) {
                                            player.togglePlayPause();
                                        } else {
                                            onPlay(songs[0].id);
                                        }
                                    }}
                                    size="icon"
                                    className="rounded-full bg-foreground hover:bg-primary/90 transition w-10 h-10 md:w-12 md:h-12"
                                >
                                    {isContextPlaying ? (
                                        <Pause className="text-background fill-background w-8 h-8 md:w-12 md:h-12" />
                                    ) : (
                                        <Play className="text-background fill-background w-8 h-8 md:w-12 md:h-12" />
                                    )}
                                </Button>
                            )}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size="icon" variant="ghost" className="rounded-full">
                                        <MoreHorizontal className="w-6 h-6 text-muted-foreground" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-42 md:w-44">
                                    <DropdownMenuItem onClick={handleAddToQueue}>
                                        <ListPlus className="mr-2 h-4 w-4" />
                                        Add to queue
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={(e) => {
                                        e.preventDefault();
                                        openRenameModal();
                                    }}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Rename playlist
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => {
                                        e.preventDefault();
                                        setIsDeleteOpen(true);
                                    }} className="focus:text-red-500">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete playlist
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
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
                    <Table songs={songs || []} onPlay={onPlay} persistenceKey={`playlist-${id}`} playlistId={id} />
                )}
            </div>

            {/* Rename Dialog */}
            <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rename Playlist</DialogTitle>
                        <DialogDescription>
                            Enter a new name for your playlist.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-2">
                        <Input
                            placeholder="Playlist name"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleRename();
                                }
                            }}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRenameOpen(false)}>Cancel</Button>
                        <Button onClick={handleRename}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Playlist</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <span className="font-semibold text-foreground">{playlist?.name}</span>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default PlaylistPage;