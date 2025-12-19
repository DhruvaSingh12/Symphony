import { useQuery } from "@tanstack/react-query";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { useUser } from "@/hooks/useUser";
import { PlaylistCollaborator, PlaylistWithCollaborators, PlaylistSongWithAuthor } from "@/types";
import { getCollaborators, checkUserPermission } from "@/lib/api/collaboration";
import { fetchPlaylistWithCollaborators, fetchPlaylistSongsWithAuthors, fetchUserPlaylists } from "@/lib/api/playlists";

// Get all collaborators for a playlist
export const useCollaborators = (playlistId: string) => {
    const supabaseClient = useSupabaseClient();

    return useQuery<PlaylistCollaborator[]>({
        queryKey: ["collaborators", playlistId],
        queryFn: () => getCollaborators(playlistId, supabaseClient),
        enabled: !!playlistId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

// Get user's pending invitations
export const usePendingInvitations = () => {
    const supabaseClient = useSupabaseClient();
    const { user } = useUser();

    return useQuery<PlaylistCollaborator[]>({
        queryKey: ["pending-invitations", user?.id],
        queryFn: async () => {
            if (!user?.id) {
                console.log("[usePendingInvitations] No user ID, returning empty array");
                return [];
            }

            console.log("[usePendingInvitations] Fetching invitations for user:", user.id);
            console.log("[usePendingInvitations] User object:", user);

            const { data, error } = await supabaseClient
                .from("playlist_collaborators")
                .select("*")
                .eq("user_id", user.id)
                .eq("status", "pending")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("[usePendingInvitations] Error fetching pending invitations:", error);
                console.error("[usePendingInvitations] Error details:", JSON.stringify(error, null, 2));
                return [];
            }

            console.log("[usePendingInvitations] Query response - data:", data);
            console.log("[usePendingInvitations] Query response - count:", data?.length);

            // Fetch related data separately to avoid RLS recursion
            const collaborators = data as any[];
            
            if (collaborators.length === 0) {
                console.log("[usePendingInvitations] No pending invitations found");
                return [];
            }

            const playlistIds = collaborators.map(c => c.playlist_id);
            const inviterIds = collaborators.map(c => c.invited_by).filter(Boolean);

            console.log("[usePendingInvitations] Fetching playlists:", playlistIds);
            console.log("[usePendingInvitations] Fetching inviters:", inviterIds);

            const [playlists, inviters] = await Promise.all([
                playlistIds.length > 0
                    ? supabaseClient.from("playlists").select("id, name, user_id").in("id", playlistIds)
                    : Promise.resolve({ data: [] }),
                inviterIds.length > 0
                    ? supabaseClient.from("users").select("id, full_name, avatar_url").in("id", inviterIds)
                    : Promise.resolve({ data: [] })
            ]);

            console.log("[usePendingInvitations] Fetched playlists:", playlists.data);
            console.log("[usePendingInvitations] Fetched inviters:", inviters.data);

            const result = collaborators.map(item => ({
                ...item,
                playlist: playlists.data?.find((p: any) => p.id === item.playlist_id),
                user: inviters.data?.find((u: any) => u.id === item.invited_by)
            })) as PlaylistCollaborator[];

            console.log("[usePendingInvitations] Final result:", result);

            return result;
        },
        enabled: !!user?.id,
        staleTime: 1000 * 30, // 30 seconds
        refetchInterval: 1000 * 60, // Refetch every 60 seconds
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });
};

// Get playlists where user is a collaborator
export const useCollaborativePlaylists = () => {
    const supabaseClient = useSupabaseClient();
    const { user } = useUser();

    return useQuery({
        queryKey: ["collaborative-playlists", user?.id],
        queryFn: async () => {
            if (!user?.id) return [];

            const { data, error } = await supabaseClient
                .from("playlist_collaborators")
                .select("*")
                .eq("user_id", user.id)
                .eq("status", "accepted")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching collaborative playlists:", error);
                return [];
            }

            // Fetch related data separately to avoid RLS recursion
            const collaborators = data as any[];
            const playlistIds = collaborators.map(c => c.playlist_id);

            if (playlistIds.length === 0) return [];

            const { data: playlists } = await supabaseClient
                .from("playlists")
                .select("*")
                .in("id", playlistIds);

            const ownerIds = playlists?.map((p: any) => p.user_id).filter(Boolean) || [];
            const { data: owners } = ownerIds.length > 0
                ? await supabaseClient.from("users").select("id, full_name, avatar_url").in("id", ownerIds)
                : { data: [] };

            return collaborators.map((item: any) => {
                const playlist = playlists?.find((p: any) => p.id === item.playlist_id);
                const owner = owners?.find((o: any) => o.id === playlist?.user_id);
                return {
                    ...playlist,
                    joined_at: item.accepted_at,
                    owner
                };
            });
        },
        enabled: !!user?.id,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

// Get playlist with collaborators and current user role
export const usePlaylistWithCollaborators = (playlistId: string) => {
    const supabaseClient = useSupabaseClient();
    const { user } = useUser();

    return useQuery<PlaylistWithCollaborators | null>({
        queryKey: ["playlist-with-collaborators", playlistId, user?.id],
        queryFn: () => {
            if (!user?.id) return null;
            return fetchPlaylistWithCollaborators(playlistId, user.id, supabaseClient);
        },
        enabled: !!playlistId && !!user?.id,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

// Get playlist songs with "added_by" user info
export const usePlaylistSongsWithAuthors = (playlistId: string) => {
    const supabaseClient = useSupabaseClient();

    return useQuery<PlaylistSongWithAuthor[]>({
        queryKey: ["playlist-songs-with-authors", playlistId],
        queryFn: () => fetchPlaylistSongsWithAuthors(playlistId, supabaseClient),
        enabled: !!playlistId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

// Get user's permission/role for a specific playlist
export const useUserPlaylistRole = (playlistId: string) => {
    const supabaseClient = useSupabaseClient();
    const { user } = useUser();

    return useQuery<'owner' | 'collaborator' | null>({
        queryKey: ["user-playlist-role", playlistId, user?.id],
        queryFn: () => {
            if (!user?.id) return null;
            return checkUserPermission(playlistId, user.id, supabaseClient);
        },
        enabled: !!playlistId && !!user?.id,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

// Get all user playlists (owned + collaborative)
export const useAllUserPlaylists = (includeCollaborative: boolean = true) => {
    const supabaseClient = useSupabaseClient();
    const { user } = useUser();

    return useQuery({
        queryKey: ["all-user-playlists", user?.id, includeCollaborative],
        queryFn: () => {
            if (!user?.id) return [];
            return fetchUserPlaylists(user.id, includeCollaborative, supabaseClient);
        },
        enabled: !!user?.id,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};