"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Table from "@/components/Table";
import useOnPlay from "@/hooks/data/useOnPlay";
import { Button } from "@/components/ui/button";
import { Play, Pause, MoreHorizontal, ListPlus, Trash2, Edit, UserPlus, Settings, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useDeletePlaylist, useRenamePlaylist } from "@/hooks/mutations/usePlaylist";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import usePlayer from "@/hooks/ui/usePlayer";
import { toast } from "react-hot-toast";
import { PlaylistWithSongs } from "@/lib/api/playlists";
import { Song, UserDetails } from "@/types";
import InviteCollaborator from "@/components/playlists/InviteCollaborator";
import CollaborationSettings from "@/components/playlists/CollaborationSettings";
import { AvatarStack } from "@/components/playlists/AvatarStack";
import { useUser } from "@/hooks/auth/useUser";
import { useCollaborators } from "@/hooks/queries/useCollaborators";
import { useUserById } from "@/hooks/queries/useUserSearch";
import { usePlaylistById, usePlaylistSongs } from "@/hooks/queries/usePlaylistSongs";

interface PlaylistClientProps {
    playlist: PlaylistWithSongs | null;
    songs: Song[];
}

const PlaylistClient: React.FC<PlaylistClientProps> = ({ playlist: initialPlaylist, songs: initialSongs }) => {
    const router = useRouter();
    const deletePlaylist = useDeletePlaylist();
    const renamePlaylist = useRenamePlaylist();
    const { user } = useUser();

    // Use client-side queries for real-time updates
    const { data: playlistData } = usePlaylistById(initialPlaylist?.id || "");
    const { data: playlistSongsData, isLoading: isSongsLoading } = usePlaylistSongs(initialPlaylist?.id || "");

    // Use client-side data if available, otherwise fall back to server data
    const playlist = playlistData || initialPlaylist;
    const songs = playlistSongsData || initialSongs;

    const [isRenameOpen, setIsRenameOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [isCollaborationOpen, setIsCollaborationOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const player = usePlayer();
    const { data: collaborators = [] } = useCollaborators(playlist?.id || "");
    const { data: playlistOwner } = useUserById(playlist?.user_id || "");

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

    // Check if current user is the owner
    const isOwner = user?.id === playlist.user_id;

    const handleAddToQueue = () => {
        if (!songs.length) return;
        const songIds = songs.map((song) => song.id);
        player.addIdsToQueue(songIds);
        toast.success("Added to queue");
    };

    const confirmDelete = async () => {
        try {
            await deletePlaylist.mutateAsync(playlist.id);
            setIsDeleteOpen(false);
            // Small delay to show success before redirect
            setTimeout(() => {
                router.push('/library');
            }, 200);
        } catch (error) {
            // Error is already handled by the mutation
            console.error("Failed to delete playlist:", error);
        }
    };

    const handleRename = async () => {
        const trimmedName = newName.trim();
        if (!trimmedName) {
            toast.error("Playlist name cannot be empty");
            return;
        }
        try {
            await renamePlaylist.mutateAsync({ playlistId: playlist.id, newName: trimmedName });
            setIsRenameOpen(false);
        } catch (error) {
            // Error is already handled by the mutation
            console.error("Failed to rename playlist:", error);
        }
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
                        <div className="flex flex-col items-start gap-2">
                            <h1 className="text-3xl font-semibold text-foreground">
                                {playlist.name || "Playlist"}
                                {renamePlaylist.isPending && (
                                    <Loader2 className="inline-block ml-2 h-6 w-6 animate-spin text-muted-foreground" />
                                )}
                            </h1>
                            <div className="flex items-center gap-3">
                                {songs && (
                                    <div className="text-sm text-muted-foreground">
                                        {songs.length} {songs.length === 1 ? "song" : "songs"}
                                        {(isSongsLoading && !initialSongs) && (
                                            <Loader2 className="inline-block ml-1 h-3 w-3 animate-spin" />
                                        )}
                                    </div>
                                )}
                                <div className="text-muted-foreground">•</div>
                                <AvatarStack
                                    users={[
                                        // Include owner first (if owner data is loaded)
                                        ...(playlistOwner ? [playlistOwner] : []),
                                        // Then add accepted collaborators (excluding owner)
                                        ...collaborators
                                            .filter(c => c.status === 'accepted' && c.user_id !== playlist.user_id)
                                            .map(c => c.user)
                                            .filter((u): u is UserDetails => u !== null && u !== undefined)
                                    ]}
                                    maxAvatarsAmount={4}
                                    size="sm"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="rounded-full"
                                        disabled={deletePlaylist.isPending || renamePlaylist.isPending}
                                    >
                                        <MoreHorizontal className="w-6 h-6 text-muted-foreground" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-42 md:w-44">
                                    <DropdownMenuItem onClick={handleAddToQueue}>
                                        <ListPlus className="mr-2 h-4 w-4" />
                                        Add to queue
                                    </DropdownMenuItem>
                                    {isOwner && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={(e) => {
                                                e.preventDefault();
                                                setIsInviteOpen(true);
                                            }}>
                                                <UserPlus className="mr-2 h-4 w-4" />
                                                Invite collaborator
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={(e) => {
                                                e.preventDefault();
                                                setIsCollaborationOpen(true);
                                            }}>
                                                <Settings className="mr-2 h-4 w-4" />
                                                Settings
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
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
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
                        </div>
                    </div>
                </Header>
            </div>
            <div className="flex-1 overflow-auto px-2 md:px-0 md:pr-2 mt-2 pb-2">
                <Table
                    songs={songs || []}
                    onPlay={onPlay}
                    persistenceKey={`playlist-${playlist.id}`}
                    playlistId={playlist.id}
                    isOwner={isOwner}
                />
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
                        <Button
                            variant="outline"
                            onClick={() => setIsRenameOpen(false)}
                            disabled={renamePlaylist.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRename}
                            disabled={renamePlaylist.isPending}
                        >
                            {renamePlaylist.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save"
                            )}
                        </Button>
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
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteOpen(false)}
                            disabled={deletePlaylist.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={deletePlaylist.isPending}
                        >
                            {deletePlaylist.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Invite Collaborator Dialog */}
            <InviteCollaborator
                isOpen={isInviteOpen}
                onClose={() => setIsInviteOpen(false)}
                playlistId={playlist.id}
                playlistName={playlist.name}
            />

            {/* Collaboration Settings Dialog */}
            <CollaborationSettings
                isOpen={isCollaborationOpen}
                onClose={() => setIsCollaborationOpen(false)}
                playlistId={playlist.id}
                playlistName={playlist.name}
                currentUserId={user?.id || ''}
                ownerId={playlist.user_id}
                isOwner={playlist.user_id === user?.id}
            />
        </div>
    );
};

export default PlaylistClient;