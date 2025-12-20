import { useMemo } from "react";
import { useUserPlaylistRole } from "@/hooks/queries/useCollaborators";

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
    const { data: role } = useUserPlaylistRole(playlistId);

    return useMemo(() => {
        const isOwner = role === 'owner';
        const isCollaborator = role === 'collaborator';
        const hasAccess = role !== null;

        return {
            role,
            isOwner,
            isCollaborator,
            hasAccess,
            canView: hasAccess,
            canEdit: isOwner || isCollaborator,
            canAddSongs: isOwner || isCollaborator,
            canRemoveSongs: isOwner || isCollaborator,
            canRename: isOwner,
            canDelete: isOwner,
            canManageCollaborators: isOwner,
            canChangeSettings: isOwner,
            canTransferOwnership: isOwner,
        };
    }, [role]);
}