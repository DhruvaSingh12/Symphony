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
        onSuccess: (result, variables) => {
            if (result.success) {
                toast.success("Invitation sent!");
                
                // Invalidate collaborator queries
                queryClient.invalidateQueries({ queryKey: ["collaborators", variables.playlistId] });
                queryClient.invalidateQueries({ queryKey: ["playlist", variables.playlistId] });
                // Invalidate pending invitations for the invited user (they need to see the new notification)
                queryClient.invalidateQueries({ queryKey: ["pending-invitations"] });
            } else {
                toast.error(result.error || "Failed to send invitation");
            }
        },
        onError: (error: Error) => {
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
        onSuccess: (result, playlistId) => {
            if (result.success) {
                toast.success("Invitation accepted!");
                
                // Invalidate queries
                queryClient.invalidateQueries({ queryKey: ["pending-invitations"] });
                queryClient.invalidateQueries({ queryKey: ["collaborators", playlistId] });
                queryClient.invalidateQueries({ queryKey: ["playlists"] });
                queryClient.invalidateQueries({ queryKey: ["playlists_with_songs"] });
                queryClient.invalidateQueries({ queryKey: ["collaborative-playlists"] });
            } else {
                toast.error(result.error || "Failed to accept invitation");
            }
        },
        onError: (error: Error) => {
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
        onSuccess: (result) => {
            if (result.success) {
                toast.success("Invitation declined");
                
                // Invalidate queries
                queryClient.invalidateQueries({ queryKey: ["pending-invitations"] });
            } else {
                toast.error(result.error || "Failed to decline invitation");
            }
        },
        onError: (error: Error) => {
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
        onSuccess: (result, variables) => {
            if (result.success) {
                toast.success("Collaborator removed");
                
                // Invalidate collaborator queries
                queryClient.invalidateQueries({ queryKey: ["collaborators", variables.playlistId] });
                queryClient.invalidateQueries({ queryKey: ["playlist", variables.playlistId] });
            } else {
                toast.error(result.error || "Failed to remove collaborator");
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || "An error occurred");
        }
    });
};

// Note: Role update functionality removed - all collaborators have equal permissions now

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