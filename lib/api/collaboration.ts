import { createClient } from "@/supabase/client";
import { PlaylistCollaborator } from "@/types";
import { SupabaseClient } from "@supabase/supabase-js";

// Remove all collaborators from a playlist (used when disabling collaboration)
export async function removeAllCollaborators(
    playlistId: string,
    supabaseClient?: SupabaseClient
): Promise<{ success: boolean; error?: string }> {
    const supabase = (supabaseClient && 'from' in supabaseClient) ? supabaseClient : createClient();

    const { error } = await supabase
        .from("playlist_collaborators")
        .delete()
        .eq("playlist_id", playlistId);

    if (error) {
        console.error("Error removing collaborators:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// Invite a user to collaborate on a playlist
export async function inviteCollaborator(
    playlistId: string,
    userId: string,
    invitedBy: string,
    supabaseClient?: SupabaseClient
): Promise<{ success: boolean; error?: string; data?: PlaylistCollaborator }> {
    const supabase = (supabaseClient && 'from' in supabaseClient) ? supabaseClient : createClient();

    // Check if invitation already exists
    const { data: existing } = await supabase
        .from("playlist_collaborators")
        .select("*")
        .eq("playlist_id", playlistId)
        .eq("user_id", userId)
        .single();

    if (existing) {
        return { success: false, error: "User is already invited or a collaborator" };
    }

    const { data, error } = await supabase
        .from("playlist_collaborators")
        .insert({
            playlist_id: playlistId,
            user_id: userId,
            invited_by: invitedBy,
            invited_at: new Date().toISOString(),
            status: 'pending'
        })
        .select()
        .single();

    if (error) {
        console.error("Error inviting collaborator:", error);
        return { success: false, error: error.message };
    }

    return { success: true, data: data as PlaylistCollaborator };
}

// Accept an invitation to collaborate on a playlist
export async function acceptInvitation(
    playlistId: string,
    userId: string,
    supabaseClient?: SupabaseClient
): Promise<{ success: boolean; error?: string }> {
    const supabase = (supabaseClient && 'from' in supabaseClient) ? supabaseClient : createClient();

    const { error } = await supabase
        .from("playlist_collaborators")
        .update({ 
            status: 'accepted',
            accepted_at: new Date().toISOString()
        })
        .eq("playlist_id", playlistId)
        .eq("user_id", userId);

    if (error) {
        console.error("Error accepting invitation:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// Decline an invitation to collaborate on a playlist
export async function declineInvitation(
    playlistId: string,
    userId: string,
    supabaseClient?: SupabaseClient
): Promise<{ success: boolean; error?: string }> {
    const supabase = (supabaseClient && 'from' in supabaseClient) ? supabaseClient : createClient();

    const { error } = await supabase
        .from("playlist_collaborators")
        .update({ status: 'declined' })
        .eq("playlist_id", playlistId)
        .eq("user_id", userId);

    if (error) {
        console.error("Error declining invitation:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// Remove a collaborator from a playlist
export async function removeCollaborator(
    playlistId: string,
    userId: string,
    supabaseClient?: SupabaseClient
): Promise<{ success: boolean; error?: string }> {
    const supabase = (supabaseClient && 'from' in supabaseClient) ? supabaseClient : createClient();

    const { error } = await supabase
        .from("playlist_collaborators")
        .delete()
        .eq("playlist_id", playlistId)
        .eq("user_id", userId);

    if (error) {
        console.error("Error removing collaborator:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// Get all collaborators for a playlist
export async function getCollaborators(
    playlistId: string,
    supabaseClient?: SupabaseClient
): Promise<PlaylistCollaborator[]> {
    const supabase = (supabaseClient && 'from' in supabaseClient) ? supabaseClient : createClient();

    // First, get collaborators without the user join to avoid RLS issues
    const { data, error } = await supabase
        .from("playlist_collaborators")
        .select("*")
        .eq("playlist_id", playlistId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching collaborators:", error);
        return [];
    }

    if (!data || data.length === 0) {
        return [];
    }

    // Fetch user details separately to avoid RLS recursion
    const userIds = data.map((c: any) => c.user_id).filter(Boolean);
    
    if (userIds.length === 0) {
        return data as PlaylistCollaborator[];
    }

    const { data: users } = await supabase
        .from("users")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

    // Map collaborators with their user details
    return data.map((item: any) => ({
        ...item,
        user: users?.find((u: any) => u.id === item.user_id)
    })) as PlaylistCollaborator[];
}

// Check if user has permission to perform an action on a playlist
export async function checkUserPermission(
    playlistId: string,
    userId: string,
    supabaseClient?: SupabaseClient
): Promise<'owner' | 'collaborator' | null> {
    const supabase = (supabaseClient && 'from' in supabaseClient) ? supabaseClient : createClient();

    // Check if user is the owner
    const { data: playlist } = await supabase
        .from("playlists")
        .select("user_id")
        .eq("id", playlistId)
        .single();

    if (playlist?.user_id === userId) {
        return 'owner';
    }

    // Check if user is a collaborator (all collaborators have equal permissions now)
    const { data: collaborator } = await supabase
        .from("playlist_collaborators")
        .select("id")
        .eq("playlist_id", playlistId)
        .eq("user_id", userId)
        .eq("status", "accepted")
        .single();

    if (collaborator) {
        return 'collaborator';
    }

    return null;
}

// Transfer ownership of a playlist to another user
export async function transferOwnership(
    playlistId: string,
    newOwnerId: string,
    currentOwnerId: string,
    supabaseClient?: SupabaseClient
): Promise<{ success: boolean; error?: string }> {
    const supabase = (supabaseClient && 'from' in supabaseClient) ? supabaseClient : createClient();

    // Update playlist owner
    const { error: playlistError } = await supabase
        .from("playlists")
        .update({ user_id: newOwnerId })
        .eq("id", playlistId)
        .eq("user_id", currentOwnerId);

    if (playlistError) {
        console.error("Error transferring ownership:", playlistError);
        return { success: false, error: playlistError.message };
    }

    // Remove new owner from collaborators if they exist
    await supabase
        .from("playlist_collaborators")
        .delete()
        .eq("playlist_id", playlistId)
        .eq("user_id", newOwnerId);

    // Add current owner as collaborator
    await supabase
        .from("playlist_collaborators")
        .insert({
            playlist_id: playlistId,
            user_id: currentOwnerId,
            invited_by: newOwnerId,
            status: 'accepted',
            accepted_at: new Date().toISOString()
        });

    return { success: true };
}