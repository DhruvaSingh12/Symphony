"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Table from "@/components/Table";
import useOnPlay from "@/hooks/useOnPlay";
import { Button } from "@/components/ui/button";
import { Play, Pause, MoreHorizontal, ListPlus, Trash2, Edit } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useDeletePlaylist, useRenamePlaylist } from "@/hooks/mutations/usePlaylist";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import usePlayer from "@/hooks/usePlayer";
import { toast } from "react-hot-toast";
import { PlaylistWithSongs } from "@/lib/api/playlists";
import { Song } from "@/types";

interface PlaylistClientProps {
    playlist: PlaylistWithSongs | null;
    songs: Song[];
}

const PlaylistClient: React.FC<PlaylistClientProps> = ({ playlist, songs }) => {
    const router = useRouter();
    const deletePlaylist = useDeletePlaylist();
    const renamePlaylist = useRenamePlaylist();

    const [isRenameOpen, setIsRenameOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const player = usePlayer();

    // Call hooks before any conditional returns
    const onPlay = useOnPlay(songs || [], 'playlist', playlist?.id || '');
    const isSameContext = player.playContext === 'playlist' && player.playContextId === playlist?.id;
    const showPause = isSameContext && player.isPlaying;

    // Guard clause if playlist is null
    if (!playlist) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <p className="text-muted-foreground">Playlist not found.</p>
            </div>
        );
    }

    const handleAddToQueue = () => {
        if (!songs.length) return;
        const songIds = songs.map((song) => song.id);
        player.addIdsToQueue(songIds);
        toast.success("Added to queue");
    };

    const confirmDelete = async () => {
        await deletePlaylist.mutateAsync(playlist.id);
        setIsDeleteOpen(false);
        router.push('/library');
    };

    const handleRename = async () => {
        if (!newName.trim()) return;
        await renamePlaylist.mutateAsync({ playlistId: playlist.id, newName: newName });
        setIsRenameOpen(false);
    };

    const openRenameModal = () => {
        setNewName(playlist.name || "");
        setIsRenameOpen(true);
    };

    return (
        <div className="h-full w-full flex flex-col overflow-hidden">
            <div className="flex-none px-2 md:px-0 md:pr-2 pt-2">
                <Header className="bg-transparent">
                    <div className="flex items-center justify-between mt-2">
                        <div className="flex flex-col items-start gap-1">
                            <h1 className="text-3xl font-semibold text-foreground">
                                {playlist.name || "Playlist"}
                            </h1>
                            {songs && (
                                <div>
                                    {songs.length} {songs.length === 1 ? "song" : "songs"}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {songs && songs.length > 0 && (
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
                <Table songs={songs || []} onPlay={onPlay} persistenceKey={`playlist-${playlist.id}`} playlistId={playlist.id} />
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
                            Are you sure you want to delete <span className="font-semibold text-foreground">{playlist.name}</span>? This action cannot be undone.
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
};

export default PlaylistClient;