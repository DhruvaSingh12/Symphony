import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { useUser } from "@/hooks/useUser";
import { toast } from "react-hot-toast";

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
             queryClient.invalidateQueries({ queryKey: ["playlists", user?.id] });
             queryClient.invalidateQueries({ queryKey: ["playlists_with_songs", user?.id] });
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });
};

export const useAddSongToPlaylist = () => {
    const supabaseClient = useSupabaseClient();
    const { user } = useUser(); // Needed for cache invalidation mainly
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
                });

            if (error) throw error;
        },
        onSuccess: (_, variables) => {
            toast.success("Added to playlist!");
            queryClient.invalidateQueries({ queryKey: ["playlists_with_songs", user?.id] });
            queryClient.invalidateQueries({ queryKey: ["playlist_songs", variables.playlistId] });
        },
        onError: (error: any) => {
            toast.error(error.message);
        }
    });
};

export const useRemoveSongFromPlaylist = () => {
    const supabaseClient = useSupabaseClient();
    const { user } = useUser();
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
        onSuccess: (_, variables) => {
            toast.success("Removed from playlist");
            queryClient.invalidateQueries({ queryKey: ["playlists_with_songs", user?.id] });
            queryClient.invalidateQueries({ queryKey: ["playlist_songs", variables.playlistId] });
        },
        onError: (error: any) => {
            toast.error(error.message);
        }
    });
};

export const useDeletePlaylist = () => {
    const supabaseClient = useSupabaseClient();
    const { user } = useUser();
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
            queryClient.invalidateQueries({ queryKey: ["playlists", user?.id] });
            queryClient.invalidateQueries({ queryKey: ["playlists_with_songs", user?.id] });
        },
        onError: (error: any) => {
            toast.error(error.message);
        }
    });
};

export const useRenamePlaylist = () => {
    const supabaseClient = useSupabaseClient();
    const { user } = useUser();
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
            queryClient.invalidateQueries({ queryKey: ["playlists", user?.id] });
            queryClient.invalidateQueries({ queryKey: ["playlists_with_songs", user?.id] });
            queryClient.invalidateQueries({ queryKey: ["playlist", variables.playlistId] });
        },
        onError: (error: any) => {
            toast.error(error.message);
        }
    });
};