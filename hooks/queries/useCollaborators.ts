import { useQuery } from "@tanstack/react-query";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { useUser } from "@/hooks/auth/useUser";
import { Playlist, UserDetails, PlaylistCollaborator, PlaylistWithCollaborators, PlaylistSongWithAuthor } from "@/types";
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
                return [];
            }

            const { data, error } = await supabaseClient
                .from("playlist_collaborators")
                .select("*")
                .eq("user_id", user.id)
                .eq("status", "pending")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching pending invitations:", error);
                return [];
            }

            const collaborators = data as PlaylistCollaborator[];
            
            if (collaborators.length === 0) {
                return [];
            }

            const playlistIds = collaborators.map(c => c.playlist_id).filter(Boolean);
            const inviterIds = collaborators.map(c => c.invited_by).filter(Boolean);

            const [playlistsResult, invitersResult] = await Promise.all([
                playlistIds.length > 0
                    ? supabaseClient
                        .from("playlists")
                        .select(`
                            *,
                            playlist_songs(song_id, songs(image_path))
                        `)
                        .in("id", playlistIds)
                    : Promise.resolve({ data: [], error: null }),
                inviterIds.length > 0
                    ? supabaseClient.from("users").select("id, full_name, avatar_url, gender, dateOfBirth").in("id", inviterIds)
                    : Promise.resolve({ data: [], error: null })
            ]);

            if (playlistsResult.error) {
                console.error("Error fetching playlists:", playlistsResult.error);
            }
            if (invitersResult.error) {
                console.error("Error fetching inviters:", invitersResult.error);
            }

            const result = (data as any[]).map(item => {
                const playlist = playlistsResult.data?.find((p: any) => p.id === item.playlist_id);
                const inviter = invitersResult.data?.find((u: any) => u.id === item.invited_by);

                const mappedPlaylist: Playlist | null = playlist ? {
                    id: (playlist as any).id,
                    user_id: (playlist as any).user_id,
                    name: (playlist as any).name,
                    description: (playlist as any).description || null,
                    image_path: (playlist as any).image_path || null,
                    created_at: (playlist as any).created_at || null,
                } : null;

                const mappedUser: UserDetails | null = inviter ? {
                    id: (inviter as any).id,
                    full_name: (inviter as any).full_name || null,
                    avatar_url: (inviter as any).avatar_url || null,
                    gender: (inviter as any).gender || null,
                    dateOfBirth: (inviter as any).dateOfBirth || null,
                } : null;

                return {
                    id: item.id,
                    playlist_id: item.playlist_id,
                    user_id: item.user_id,
                    invited_by: item.invited_by,
                    invited_at: item.invited_at,
                    accepted_at: item.accepted_at || null,
                    status: item.status,
                    created_at: item.created_at || null,
                    playlist: mappedPlaylist,
                    user: mappedUser
                };
            }) as PlaylistCollaborator[];

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
            const collaborators = data as PlaylistCollaborator[];
            const playlistIds = collaborators.map(c => c.playlist_id);

            if (playlistIds.length === 0) return [];

            const { data: playlists } = await supabaseClient
                .from("playlists")
                .select("*")
                .in("id", playlistIds);

            const ownerIds = playlists?.map((p: any) => p.user_id).filter(Boolean) || [];
            const { data: owners } = ownerIds.length > 0
                ? await supabaseClient.from("users").select("id, full_name, avatar_url, gender, dateOfBirth").in("id", ownerIds)
                : { data: [] };

            return collaborators.map((item: PlaylistCollaborator) => {
                const playlist = playlists?.find((p: any) => p.id === item.playlist_id);
                const owner = owners?.find((o: any) => o.id === playlist?.user_id);
                const ownerUser: UserDetails | null = owner ? {
                    id: (owner as any).id,
                    full_name: (owner as any).full_name || null,
                    avatar_url: (owner as any).avatar_url || null,
                    gender: (owner as any).gender || null,
                    dateOfBirth: (owner as any).dateOfBirth || null,
                } : null;

                return {
                    ...playlist,
                    joined_at: item.accepted_at,
                    owner: ownerUser
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