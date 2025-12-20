import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { useUser } from "@/hooks/useUser";
import { toast } from "react-hot-toast";
import { removeAllCollaborators, inviteCollaborator, acceptInvitation, declineInvitation, removeCollaborator, transferOwnership} from "@/lib/api/collaboration";

// Invite a collaborator to a playlist (all collaborators have equal permissions)
export const useInviteCollaborator = () => {
    const supabaseClient = useSupabaseClient();
    const { user } = useUser();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ 
            playlistId, 
            userId
        }: { 
            playlistId: string; 
            userId: string;
        }) => {
            if (!user?.id) throw new Error("Not authenticated");
            
            return await inviteCollaborator(
                playlistId,
                userId,
                user.id,
                supabaseClient
            );
        },
        onMutate: async ({ playlistId }) => {
            // Cancel outgoing queries
            await queryClient.cancelQueries({ queryKey: ["collaborators", playlistId] });
            
            // Snapshot previous value
            const previousCollaborators = queryClient.getQueryData(["collaborators", playlistId]);
            
            return { previousCollaborators, playlistId };
        },
        onSuccess: (result, variables) => {
            if (result.success) {
                toast.success("Invitation sent!");
                
                // Immediately invalidate to show pending invitation
                queryClient.invalidateQueries({ queryKey: ["collaborators", variables.playlistId] });
                queryClient.invalidateQueries({ queryKey: ["playlist", variables.playlistId] });
                queryClient.invalidateQueries({ queryKey: ["pending-invitations"] });
            } else {
                toast.error(result.error || "Failed to send invitation");
            }
        },
        onError: (error: Error, _variables, context) => {
            // Rollback on error
            if (context?.previousCollaborators) {
                queryClient.setQueryData(
                    ["collaborators", context.playlistId],
                    context.previousCollaborators
                );
            }
            toast.error(error.message || "An error occurred");
        }
    });
};
// Accept an invitation to collaborate
export const useAcceptInvitation = () => {
    const supabaseClient = useSupabaseClient();
    const { user } = useUser();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (playlistId: string) => {
            if (!user?.id) throw new Error("Not authenticated");
            
            return await acceptInvitation(playlistId, user.id, supabaseClient);
        },
        onMutate: async (playlistId) => {
            // Cancel outgoing queries
            await queryClient.cancelQueries({ queryKey: ["pending-invitations"] });
            await queryClient.cancelQueries({ queryKey: ["playlists_with_songs"] });
            
            // Snapshot previous values
            const previousInvitations = queryClient.getQueryData(["pending-invitations"]);
            const previousPlaylists = queryClient.getQueryData(["playlists_with_songs"]);
            
            // Optimistically remove from pending invitations
            queryClient.setQueryData(["pending-invitations"], (old: any[] | undefined) => {
                if (!old) return old;
                return old.filter(inv => inv.playlist_id !== playlistId);
            });
            
            return { previousInvitations, previousPlaylists, playlistId };
        },
        onSuccess: (result, playlistId) => {
            if (result.success) {
                toast.success("Invitation accepted!");
                
                // Invalidate queries for fresh data
                queryClient.invalidateQueries({ queryKey: ["pending-invitations"] });
                queryClient.invalidateQueries({ queryKey: ["collaborators", playlistId] });
                queryClient.invalidateQueries({ queryKey: ["playlists"] });
                queryClient.invalidateQueries({ queryKey: ["playlists_with_songs"] });
                queryClient.invalidateQueries({ queryKey: ["collaborative-playlists"] });
                queryClient.invalidateQueries({ queryKey: ["all-user-playlists"] });
            } else {
                toast.error(result.error || "Failed to accept invitation");
            }
        },
        onError: (error: Error, _variables, context) => {
            // Rollback on error
            if (context?.previousInvitations) {
                queryClient.setQueryData(["pending-invitations"], context.previousInvitations);
            }
            if (context?.previousPlaylists) {
                queryClient.setQueryData(["playlists_with_songs"], context.previousPlaylists);
            }
            toast.error(error.message || "An error occurred");
        }
    });
};

// Decline an invitation to collaborate
export const useDeclineInvitation = () => {
    const supabaseClient = useSupabaseClient();
    const { user } = useUser();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (playlistId: string) => {
            if (!user?.id) throw new Error("Not authenticated");
            
            return await declineInvitation(playlistId, user.id, supabaseClient);
        },
        onMutate: async (playlistId) => {
            // Cancel outgoing queries
            await queryClient.cancelQueries({ queryKey: ["pending-invitations"] });
            
            // Snapshot previous value
            const previousInvitations = queryClient.getQueryData(["pending-invitations"]);
            
            // Optimistically remove from pending invitations
            queryClient.setQueryData(["pending-invitations"], (old: any[] | undefined) => {
                if (!old) return old;
                return old.filter(inv => inv.playlist_id !== playlistId);
            });
            
            return { previousInvitations, playlistId };
        },
        onSuccess: (result) => {
            if (result.success) {
                toast.success("Invitation declined");
                
                // Invalidate for fresh data
                queryClient.invalidateQueries({ queryKey: ["pending-invitations"] });
            } else {
                toast.error(result.error || "Failed to decline invitation");
            }
        },
        onError: (error: Error, _variables, context) => {
            // Rollback on error
            if (context?.previousInvitations) {
                queryClient.setQueryData(["pending-invitations"], context.previousInvitations);
            }
            toast.error(error.message || "An error occurred");
        }
    });
};

// Remove a collaborator from a playlist
export const useRemoveCollaborator = () => {
    const supabaseClient = useSupabaseClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ 
            playlistId, 
            userId 
        }: { 
            playlistId: string; 
            userId: string 
        }) => {
            return await removeCollaborator(playlistId, userId, supabaseClient);
        },
        onMutate: async ({ playlistId, userId }) => {
            // Cancel outgoing queries
            await queryClient.cancelQueries({ queryKey: ["collaborators", playlistId] });
            
            // Snapshot previous value
            const previousCollaborators = queryClient.getQueryData(["collaborators", playlistId]);
            
            // Optimistically remove collaborator
            queryClient.setQueryData(["collaborators", playlistId], (old: any[] | undefined) => {
                if (!old) return old;
                return old.filter(collab => collab.user_id !== userId);
            });
            
            return { previousCollaborators, playlistId };
        },
        onSuccess: (result, variables) => {
            if (result.success) {
                toast.success("Collaborator removed");
                
                // Invalidate for fresh data
                queryClient.invalidateQueries({ queryKey: ["collaborators", variables.playlistId] });
                queryClient.invalidateQueries({ queryKey: ["playlist", variables.playlistId] });
            } else {
                toast.error(result.error || "Failed to remove collaborator");
            }
        },
        onError: (error: Error, _variables, context) => {
            // Rollback on error
            if (context?.previousCollaborators) {
                queryClient.setQueryData(
                    ["collaborators", context.playlistId],
                    context.previousCollaborators
                );
            }
            toast.error(error.message || "An error occurred");
        }
    });
};

// Transfer playlist ownership to another user
export const useTransferOwnership = () => {
    const supabaseClient = useSupabaseClient();
    const { user } = useUser();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ 
            playlistId, 
            newOwnerId 
        }: { 
            playlistId: string; 
            newOwnerId: string 
        }) => {
            if (!user?.id) throw new Error("Not authenticated");
            
            return await transferOwnership(playlistId, newOwnerId, user.id, supabaseClient);
        },
        onSuccess: (result, variables) => {
            if (result.success) {
                toast.success("Ownership transferred successfully");
                
                // Invalidate all playlist-related queries
                queryClient.invalidateQueries({ queryKey: ["playlist", variables.playlistId] });
                queryClient.invalidateQueries({ queryKey: ["playlists"] });
                queryClient.invalidateQueries({ queryKey: ["playlists_with_songs"] });
                queryClient.invalidateQueries({ queryKey: ["collaborators", variables.playlistId] });
            } else {
                toast.error(result.error || "Failed to transfer ownership");
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || "An error occurred");
        }
    });
};