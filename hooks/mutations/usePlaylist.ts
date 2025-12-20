import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { toast } from "react-hot-toast";
import { Song, PlaylistWithCollaborators, Playlist } from "@/types";
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
        onMutate: async (name) => {
            // Cancel outgoing queries
            await queryClient.cancelQueries({ queryKey: ["playlists"] });
            await queryClient.cancelQueries({ queryKey: ["playlists_with_songs"] });
            
            // Snapshot previous values
            const previousPlaylists = queryClient.getQueryData(["playlists", user?.id]);
            const previousPlaylistsWithSongs = queryClient.getQueryData(["playlists_with_songs", user?.id]);
            
            // Optimistically add new playlist
            const optimisticPlaylist = {
                id: `temp-${Date.now()}`,
                user_id: user?.id || '',
                name: name,
                created_at: new Date().toISOString(),
                songs: []
            };
            
            queryClient.setQueryData(["playlists_with_songs", user?.id], (old: PlaylistWithCollaborators[] | undefined) => {
                return old ? [optimisticPlaylist, ...old] : [optimisticPlaylist];
            });
            
            return { previousPlaylists, previousPlaylistsWithSongs };
        },
        onSuccess: () => {
             toast.success("Playlist created!");
             // Invalidate to get fresh data with correct IDs
             queryClient.invalidateQueries({ queryKey: ["playlists"] });
             queryClient.invalidateQueries({ queryKey: ["playlists_with_songs"] });
             queryClient.invalidateQueries({ queryKey: ["all-user-playlists"] });
        },
        onError: (error, _variables, context) => {
            // Rollback on error
            if (context?.previousPlaylists) {
                queryClient.setQueryData(["playlists", user?.id], context.previousPlaylists);
            }
            if (context?.previousPlaylistsWithSongs) {
                queryClient.setQueryData(["playlists_with_songs", user?.id], context.previousPlaylistsWithSongs);
            }
            toast.error(error.message);
        }
    });
};

export const useAddSongToPlaylist = () => {
    const supabaseClient = useSupabaseClient();
    const queryClient = useQueryClient();
    const { user } = useUser();

    return useMutation({
        mutationFn: async ({ playlistId, songId }: { playlistId: string; songId: number }) => {
            if (!user?.id) throw new Error("Not authenticated");

             const { data: existing } = await supabaseClient
                .from("playlist_songs")
                .select("*")
                .eq("playlist_id", playlistId)
                .eq("song_id", songId)
                .single();

            if (existing) {
                throw new Error("Song already in playlist");
            }

            // Fetch song data for optimistic update
            const { data: songData } = await supabaseClient
                .from("songs")
                .select("*")
                .eq("id", songId)
                .single();

            const { error } = await supabaseClient
                .from("playlist_songs")
                .insert({
                    playlist_id: playlistId,
                    song_id: songId,
                    added_by: user.id
                })
                .select();

            if (error) throw error;
            return songData;
        },
        onMutate: async ({ playlistId }) => {
            // Cancel outgoing queries
            await queryClient.cancelQueries({ queryKey: ["playlist_songs", playlistId] });
            await queryClient.cancelQueries({ queryKey: ["playlists_with_songs"] });
            
            // Snapshot previous values
            const previousSongs = queryClient.getQueryData<Song[]>(["playlist_songs", playlistId]);
            const previousPlaylistsWithSongs = queryClient.getQueryData(["playlists_with_songs"]);
            
            return { previousSongs, previousPlaylistsWithSongs, playlistId };
        },
        onSuccess: (songData, variables) => {
            toast.success("Added to playlist!");
            
            // Optimistically add song to UI
            if (songData) {
                queryClient.setQueryData(["playlist_songs", variables.playlistId], (old: Song[] | undefined) => {
                    if (!old) return [songData as Song];
                    // Check if song already exists to avoid duplicates
                    if (old.some(s => s.id === songData.id)) return old;
                    return [...old, songData as Song];
                });
            }
            
            // Invalidate for fresh data
            queryClient.invalidateQueries({ queryKey: ["playlist_songs", variables.playlistId] });
            queryClient.invalidateQueries({ queryKey: ["playlists_with_songs"] });
            queryClient.invalidateQueries({ queryKey: ["playlist", variables.playlistId] });
        },
        onError: (error: Error, _variables, context) => {
            // Rollback on error
            if (context?.previousSongs) {
                queryClient.setQueryData(
                    ["playlist_songs", context.playlistId],
                    context.previousSongs
                );
            }
            if (context?.previousPlaylistsWithSongs) {
                queryClient.setQueryData(
                    ["playlists_with_songs"],
                    context.previousPlaylistsWithSongs
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
            // Cancel outgoing queries
            await queryClient.cancelQueries({ queryKey: ["playlist_songs", playlistId] });
            await queryClient.cancelQueries({ queryKey: ["playlists_with_songs"] });
            
            // Snapshot previous values
            const previousSongs = queryClient.getQueryData<Song[]>(["playlist_songs", playlistId]);
            const previousPlaylistsWithSongs = queryClient.getQueryData(["playlists_with_songs"]);
            
            // Optimistically remove from UI
            queryClient.setQueryData(["playlist_songs", playlistId], (old: Song[] | undefined) => {
                if (!old || !Array.isArray(old)) return old;
                return old.filter((song: Song) => song.id !== songId);
            });
            
            // Also update playlists_with_songs
            queryClient.setQueryData(["playlists_with_songs"], (old: PlaylistWithCollaborators[] | undefined) => {
                if (!old || !Array.isArray(old)) return old;
                return old.map(playlist => {
                    if (playlist.id === playlistId) {
                        return {
                            ...playlist,
                            songs: playlist.songs?.filter((song: Song) => song.id !== songId) || []
                        };
                    }
                    return playlist;
                });
            });
            
            return { previousSongs, previousPlaylistsWithSongs, playlistId };
        },
        onSuccess: (_, variables) => {
            toast.success("Removed from playlist");
            // Invalidate for fresh data
            queryClient.invalidateQueries({ queryKey: ["playlist_songs", variables.playlistId] });
            queryClient.invalidateQueries({ queryKey: ["playlists_with_songs"] });
            queryClient.invalidateQueries({ queryKey: ["playlist", variables.playlistId] });
        },
        onError: (error: Error, _variables, context) => {
            // Rollback on error
            if (context?.previousSongs) {
                queryClient.setQueryData(
                    ["playlist_songs", context.playlistId],
                    context.previousSongs
                );
            }
            if (context?.previousPlaylistsWithSongs) {
                queryClient.setQueryData(
                    ["playlists_with_songs"],
                    context.previousPlaylistsWithSongs
                );
            }
            toast.error(error.message);
        }
    });
};

export const useDeletePlaylist = () => {
    const supabaseClient = useSupabaseClient();
    const queryClient = useQueryClient();
    const { user } = useUser();

    return useMutation({
        mutationFn: async (playlistId: string) => {
            const { error } = await supabaseClient
                .from("playlists")
                .delete()
                .eq("id", playlistId);

            if (error) throw error;
        },
        onMutate: async (playlistId) => {
            // Cancel outgoing queries
            await queryClient.cancelQueries({ queryKey: ["playlists"] });
            await queryClient.cancelQueries({ queryKey: ["playlists_with_songs"] });
            
            // Snapshot previous values
            const previousPlaylists = queryClient.getQueryData(["playlists", user?.id]);
            const previousPlaylistsWithSongs = queryClient.getQueryData(["playlists_with_songs", user?.id]);
            
            // Optimistically remove playlist
            queryClient.setQueryData(["playlists", user?.id], (old: Playlist[] | undefined) => {
                if (!old) return old;
                return old.filter(p => p.id !== playlistId);
            });
            
            queryClient.setQueryData(["playlists_with_songs", user?.id], (old: PlaylistWithCollaborators[] | undefined) => {
                if (!old) return old;
                return old.filter(p => p.id !== playlistId);
            });
            
            return { previousPlaylists, previousPlaylistsWithSongs, playlistId };
        },
        onSuccess: () => {
            toast.success("Playlist deleted");
            queryClient.invalidateQueries({ queryKey: ["playlists"] });
            queryClient.invalidateQueries({ queryKey: ["playlists_with_songs"] });
            queryClient.invalidateQueries({ queryKey: ["all-user-playlists"] });
        },
        onError: (error: Error, _variables, context) => {
            // Rollback on error
            if (context?.previousPlaylists) {
                queryClient.setQueryData(["playlists", user?.id], context.previousPlaylists);
            }
            if (context?.previousPlaylistsWithSongs) {
                queryClient.setQueryData(["playlists_with_songs", user?.id], context.previousPlaylistsWithSongs);
            }
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
        onMutate: async ({ playlistId, newName }) => {
            // Cancel outgoing queries
            await queryClient.cancelQueries({ queryKey: ["playlist", playlistId] });
            await queryClient.cancelQueries({ queryKey: ["playlists"] });
            await queryClient.cancelQueries({ queryKey: ["playlists_with_songs"] });
            
            // Snapshot previous values
            const previousPlaylist = queryClient.getQueryData(["playlist", playlistId]);
            const previousPlaylists = queryClient.getQueryData(["playlists"]);
            const previousPlaylistsWithSongs = queryClient.getQueryData(["playlists_with_songs"]);
            
            // Optimistically update playlist name
            queryClient.setQueryData(["playlist", playlistId], (old: Playlist | undefined) => {
                if (!old) return old;
                return { ...old, name: newName };
            });
            
            queryClient.setQueryData(["playlists"], (old: Playlist[] | undefined) => {
                if (!old) return old;
                return old.map(p => p.id === playlistId ? { ...p, name: newName } : p);
            });
            
            queryClient.setQueryData(["playlists_with_songs"], (old: PlaylistWithCollaborators[] | undefined) => {
                if (!old) return old;
                return old.map(p => p.id === playlistId ? { ...p, name: newName } : p);
            });
            
            return { previousPlaylist, previousPlaylists, previousPlaylistsWithSongs, playlistId };
        },
        onSuccess: (data, variables) => {
            toast.success("Playlist renamed");
            queryClient.setQueryData(["playlist", variables.playlistId], data);
            queryClient.invalidateQueries({ queryKey: ["playlists"] });
            queryClient.invalidateQueries({ queryKey: ["playlists_with_songs"] });
            queryClient.invalidateQueries({ queryKey: ["playlist", variables.playlistId] });
        },
        onError: (error: Error, _variables, context) => {
            // Rollback on error
            if (context?.previousPlaylist) {
                queryClient.setQueryData(["playlist", context.playlistId], context.previousPlaylist);
            }
            if (context?.previousPlaylists) {
                queryClient.setQueryData(["playlists"], context.previousPlaylists);
            }
            if (context?.previousPlaylistsWithSongs) {
                queryClient.setQueryData(["playlists_with_songs"], context.previousPlaylistsWithSongs);
            }
            toast.error(error.message);
        }
    });
};