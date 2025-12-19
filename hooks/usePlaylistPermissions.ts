import { useMemo } from "react";
import { useUser } from "@/hooks/useUser";
import { useUserPlaylistRole } from "@/hooks/queries/useCollaborators";
import { useQuery } from "@tanstack/react-query";
import { useSupabaseClient } from "@/providers/SupabaseProvider";

// Check if user can edit playlist (add/remove songs)
export function useCanEditPlaylist(playlistId: string): boolean {
    const { data: role } = useUserPlaylistRole(playlistId);
    
    return useMemo(() => {
        // Owner or collaborator can edit
        return role === 'owner' || role === 'collaborator';
    }, [role]);
}

// Check if user is the playlist owner
export function useIsPlaylistOwner(playlistId: string): boolean {
    const { data: role } = useUserPlaylistRole(playlistId);
    
    return useMemo(() => {
        return role === 'owner';
    }, [role]);
}

// Get user's role in a playlist
export function usePlaylistRole(playlistId: string): 'owner' | 'collaborator' | null {
    const { data: role } = useUserPlaylistRole(playlistId);
    return role || null;
}

// Check if user can manage collaborators (invite, remove, change roles)
export function useCanManageCollaborators(playlistId: string): boolean {
    return useIsPlaylistOwner(playlistId);
}

// Check if user can delete the playlist
export function useCanDeletePlaylist(playlistId: string): boolean {
    return useIsPlaylistOwner(playlistId);
}

// Check if user can rename the playlist
export function useCanRenamePlaylist(playlistId: string): boolean {
    return useIsPlaylistOwner(playlistId);
}

// Check if user can change playlist settings (visibility, collaboration)
export function useCanChangePlaylistSettings(playlistId: string): boolean {
    return useIsPlaylistOwner(playlistId);
}

// Check if user has any access to the playlist
export function useHasPlaylistAccess(playlistId: string): boolean {
    const { data: role } = useUserPlaylistRole(playlistId);
    
    return useMemo(() => {
        return role !== null;
    }, [role]);
}

// Get comprehensive permissions object for a playlist
export function usePlaylistPermissions(playlistId: string) {
    const { user } = useUser();
    const supabaseClient = useSupabaseClient();
    
    const { data: playlist } = useQuery({
        queryKey: ["playlist-permissions", playlistId],
        queryFn: async () => {
            const { data } = await supabaseClient
                .from("playlists")
                .select("user_id")
                .eq("id", playlistId)
                .single();
            return data;
        },
        enabled: !!playlistId,
    });

    const { data: role } = useUserPlaylistRole(playlistId);

    return useMemo(() => {
        const isOwner = role === 'owner' || playlist?.user_id === user?.id;
        const isCollaborator = role === 'collaborator';

        return {
            role,
            isOwner,
            isCollaborator,
            hasAccess: role !== null,
            canView: role !== null,
            canEdit: isOwner || isCollaborator,
            canAddSongs: isOwner || isCollaborator,
            canRemoveSongs: isOwner || isCollaborator,
            canRename: isOwner,
            canDelete: isOwner,
            canManageCollaborators: isOwner,
            canChangeSettings: isOwner,
            canTransferOwnership: isOwner,
        };
    }, [role, playlist, user?.id]);
}