"use client";

import { useState } from "react";
import { useForm, FieldValues, SubmitHandler } from "react-hook-form";
import { Plus, ListMusic, Check } from "lucide-react";
import Image from "next/image";
import Modal from "./Modal";
import { Input } from "@/components/ui/input";
import Button from "./Button";
import usePlaylistModal from "@/hooks/usePlaylistModal";
import { usePlaylistsWithSongs } from "@/hooks/queries/usePlaylistsWithSongs";
import { useCreatePlaylist, useAddSongToPlaylist } from "@/hooks/mutations/usePlaylist";
import { Playlist, Song } from "@/types";
import useLoadImage from "@/hooks/useLoadImage";

interface PlaylistWithSongs extends Playlist {
    songs: Song[];
}

interface PlaylistRowProps {
    playlist: PlaylistWithSongs;
    songId: number; // The current song trying to be added
    onAddToPlaylist: (id: string) => void;
    isSubmitting: boolean;
}

const PlaylistImage = ({ song, className }: { song: Song, className?: string }) => {
    const imageUrl = useLoadImage(song);

    if (!imageUrl) {
        return (
            <div className={`flex items-center justify-center bg-neutral-800 ${className}`}>
                <ListMusic className="h-4 w-4 text-neutral-400" />
            </div>
        );
    }

    return (
        <div className={`relative overflow-hidden ${className}`}>
            <Image
                src={imageUrl}
                alt={song.title || "Song"}
                fill
                sizes="48px"
                className="object-cover"
            />
        </div>
    );
};

const PlaylistRow: React.FC<PlaylistRowProps> = ({
    playlist,
    songId,
    onAddToPlaylist,
    isSubmitting
}) => {
    const alreadyInPlaylist = playlist.songs.some(song => song.id === songId);

    // Logic for grid view
    const isGrid = playlist.songs.length >= 4;
    const songsToDisplay = playlist.songs.slice(0, 4);

    const handleClick = () => {
        if (!alreadyInPlaylist) {
            onAddToPlaylist(playlist.id);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={isSubmitting || alreadyInPlaylist}
            className="flex items-center gap-x-3 w-full p-2 hover:bg-secondary/50 rounded-md group transition disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-border"
        >
            <div className="relative h-12 w-12 bg-secondary flex items-center justify-center rounded-md overflow-hidden group-hover:bg-background border border-transparent group-hover:border-border transition flex-shrink-0">
                {isGrid ? (
                    <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
                        {songsToDisplay.map((song) => (
                            <PlaylistImage key={song.id} song={song} className="w-full h-full" />
                        ))}
                    </div>
                ) : (
                    playlist.songs.length > 0 ? (
                        <PlaylistImage song={playlist.songs[0]} className="w-full h-full" />
                    ) : (
                        <ListMusic className="text-muted-foreground group-hover:text-foreground h-6 w-6" />
                    )
                )}

                {/* Overlay Check if already in playlist */}
                {alreadyInPlaylist && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Check className="text-primary h-6 w-6" />
                    </div>
                )}
            </div>
            <div className="flex flex-col items-start overflow-hidden">
                <p className="font-medium truncate text-foreground group-hover:text-primary transition text-left w-full">
                    {playlist.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                    {playlist.songs.length} {playlist.songs.length === 1 ? 'song' : 'songs'}
                </p>
            </div>
        </button>
    );
};

const PlaylistModal = () => {
    const { isOpen, onClose, songId } = usePlaylistModal();
    const { data: playlists, isLoading } = usePlaylistsWithSongs();
    const createPlaylistMutation = useCreatePlaylist();
    const addSongMutation = useAddSongToPlaylist();

    const [isCreating, setIsCreating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
    } = useForm<FieldValues>({
        defaultValues: {
            name: ""
        }
    });

    const onChange = (open: boolean) => {
        if (!open) {
            onClose();
            setIsCreating(false);
            reset();
        }
    }

    const onCreate: SubmitHandler<FieldValues> = async (values) => {
        setIsSubmitting(true);
        try {
            await createPlaylistMutation.mutateAsync(values.name);
            setIsCreating(false);
            reset();
        } catch (error) {
            // Handled by mutation
        } finally {
            setIsSubmitting(false);
        }
    }

    const onAddToPlaylist = async (playlistId: string) => {
        if (!songId) return;
        setIsSubmitting(true);
        try {
            await addSongMutation.mutateAsync({ playlistId, songId });
            onClose();
        } catch (error) {
            // Handled by mutation
        } finally {
            setIsSubmitting(false);
        }
    }

    let content = (
        <div className="flex flex-col gap-y-2">
            <div className="flex flex-col gap-y-2 max-h-[50vh] scrollbar-hideoverflow-y-auto pr-2">
                {/* Create New Option */}
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-x-3 w-full p-2 hover:bg-secondary/50 rounded-md group transition border border-transparent hover:border-border"
                >
                    <div className="h-12 w-12 bg-secondary flex items-center justify-center rounded-md group-hover:bg-background border border-transparent group-hover:border-border transition">
                        <Plus className="text-muted-foreground group-hover:text-foreground" />
                    </div>
                    <p className="font-medium truncate text-muted-foreground group-hover:text-foreground transition">
                        Create new playlist
                    </p>
                </button>

                {/* Existing Playlists */}
                {isLoading ? (
                    <div className="text-center text-muted-foreground py-4">Loading playlists...</div>
                ) : playlists?.map((playlist) => (
                    <PlaylistRow
                        key={playlist.id}
                        playlist={playlist}
                        songId={songId!}
                        onAddToPlaylist={onAddToPlaylist}
                        isSubmitting={isSubmitting}
                    />
                ))}

                {playlists?.length === 0 && !isLoading && (
                    <div className="text-center text-muted-foreground py-4">
                        No playlists found. Create one to get started!
                    </div>
                )}
            </div>
        </div>
    );

    if (isCreating) {
        content = (
            <form onSubmit={handleSubmit(onCreate)} className="flex flex-col gap-y-4">
                <Input
                    id="name"
                    disabled={isSubmitting}
                    {...register('name', { required: true })}
                    placeholder="Playlist name"
                    className="bg-secondary/50 border-input text-foreground focus-visible:ring-primary"
                />
                <div className="flex gap-x-4 mt-2">
                    <Button
                        disabled={isSubmitting}
                        onClick={() => setIsCreating(false)}
                        type="button"
                        className="bg-secondary text-secondary-foreground hover:bg-secondary/80 w-full rounded-md border-transparent"
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={isSubmitting}
                        type="submit"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-md border-transparent"
                    >
                        Create
                    </Button>
                </div>
            </form>
        );
    }

    return (
        <Modal
            isOpen={isOpen}
            onChange={onChange}
            title={isCreating ? "Create playlist" : "Add to playlist"}
            description=""
        >
            {content}
        </Modal>
    );
}

export default PlaylistModal;