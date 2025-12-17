import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { toast } from "react-hot-toast";
import { Song } from "@/types";
import { useUser } from "@/hooks/useUser";

export const useCreatePlaylist = () => {
    const supabaseClient = useSupabaseClient();
    const { user } = useUser();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (name: string) => {
            if (!user?.id) throw new Error("Not authenticated");

            const { data, error } = await supabaseClient
                .from("playlists")
                .insert({
                    user_id: user.id,
                    name: name
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
             toast.success("Playlist created!");
             queryClient.invalidateQueries({ queryKey: ["playlists"] });
             queryClient.invalidateQueries({ queryKey: ["playlists_with_songs"] });
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });
};

export const useAddSongToPlaylist = () => {
    const supabaseClient = useSupabaseClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ playlistId, songId }: { playlistId: string; songId: number }) => {
             const { data: existing } = await supabaseClient
                .from("playlist_songs")
                .select("*")
                .eq("playlist_id", playlistId)
                .eq("song_id", songId)
                .single();

            if (existing) {
                throw new Error("Song already in playlist");
            }

            const { error } = await supabaseClient
                .from("playlist_songs")
                .insert({
                    playlist_id: playlistId,
                    song_id: songId
                })
                .select();

            if (error) throw error;
        },
        onMutate: async ({ playlistId }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["playlist_songs", playlistId] });
            
            // Snapshot the previous value
            const previousSongs = queryClient.getQueryData<Song[]>(["playlist_songs", playlistId]);
            
            // Optimistically update to the new value
            queryClient.setQueryData(["playlist_songs", playlistId], (old: Song[] | undefined) => {
                if (!old) return old;
                // We don't have the full song data, but we mark it as added
                return old;
            });
            
            return { previousSongs, playlistId };
        },
        onSuccess: (_, variables) => {
            toast.success("Added to playlist!");
            queryClient.invalidateQueries({ queryKey: ["playlists_with_songs"] });
            queryClient.invalidateQueries({ queryKey: ["playlist_songs", variables.playlistId] });
        },
        onError: (error: Error, variables, context: { previousSongs?: Song[]; playlistId: string } | undefined) => {
            // Rollback on error
            if (context?.previousSongs) {
                queryClient.setQueryData(
                    ["playlist_songs", context.playlistId],
                    context.previousSongs
                );
            }
            toast.error(error.message);
        }
    });
};

export const useRemoveSongFromPlaylist = () => {
    const supabaseClient = useSupabaseClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ playlistId, songId }: { playlistId: string; songId: number }) => {
            const { error } = await supabaseClient
                .from("playlist_songs")
                .delete()
                .eq("playlist_id", playlistId)
                .eq("song_id", songId);

            if (error) throw error;
        },
        onMutate: async ({ playlistId, songId }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["playlist_songs", playlistId] });
            
            // Snapshot the previous value
            const previousSongs = queryClient.getQueryData<Song[]>(["playlist_songs", playlistId]);
            
            // Optimistically remove from UI
            queryClient.setQueryData(["playlist_songs", playlistId], (old: Song[] | undefined) => {
                if (!old || !Array.isArray(old)) return old;
                return old.filter((song: Song) => song.id !== songId);
            });
            
            return { previousSongs, playlistId };
        },
        onSuccess: (_, variables) => {
            toast.success("Removed from playlist");
            queryClient.invalidateQueries({ queryKey: ["playlists_with_songs"] });
            queryClient.invalidateQueries({ queryKey: ["playlist_songs", variables.playlistId] });
        },
        onError: (error: Error, variables, context: { previousSongs?: Song[]; playlistId: string } | undefined) => {
            // Rollback on error
            if (context?.previousSongs) {
                queryClient.setQueryData(
                    ["playlist_songs", context.playlistId],
                    context.previousSongs
                );
            }
            toast.error(error.message);
        }
    });
};

export const useDeletePlaylist = () => {
    const supabaseClient = useSupabaseClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (playlistId: string) => {
            const { error } = await supabaseClient
                .from("playlists")
                .delete()
                .eq("id", playlistId);

            if (error) throw error;
        },
        onSuccess: () => {
            toast.success("Playlist deleted");
            queryClient.invalidateQueries({ queryKey: ["playlists"] });
            queryClient.invalidateQueries({ queryKey: ["playlists_with_songs"] });
        },
        onError: (error: Error) => {
            toast.error(error.message);
        }
    });
};

export const useRenamePlaylist = () => {
    const supabaseClient = useSupabaseClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ playlistId, newName }: { playlistId: string; newName: string }) => {
            const { data, error } = await supabaseClient
                .from("playlists")
                .update({ name: newName })
                .eq("id", playlistId)
                .select();

            if (error) throw error;
            if (!data || data.length === 0) {
                throw new Error("Failed to rename: Playlist not found or permission denied.");
            }
            return data[0];
        },
        onSuccess: (data, variables) => {
            toast.success("Playlist renamed");
            queryClient.setQueryData(["playlist", variables.playlistId], data);
            queryClient.invalidateQueries({ queryKey: ["playlists"] });
            queryClient.invalidateQueries({ queryKey: ["playlists_with_songs"] });
            queryClient.invalidateQueries({ queryKey: ["playlist", variables.playlistId] });
        },
        onError: (error: Error) => {
            toast.error(error.message);
        }
    });
};